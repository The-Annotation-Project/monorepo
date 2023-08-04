require("dotenv").config();

import axios from "axios";
import fs, { mkdirSync, rmSync, rmdirSync } from "fs";
import * as Minio from "minio";
import express from "express";
import { join } from "path";
import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
const pkg = require("../package.json");

if (!ffmpegStatic) {
  console.log("Couldn't load ffmpeg");
  process.exit(1);
}

ffmpeg.setFfmpegPath(ffmpegStatic);

interface UserIdentity {
  principalId: string;
}

interface RequestParameters {
  principalId: string;
  region: string;
  sourceIPAddress: string;
}

interface ResponseElements {
  "x-amz-id-2": string;
  "x-amz-request-id": string;
  "x-minio-deployment-id": string;
  "x-minio-origin-endpoint": string;
}

interface S3 {
  s3SchemaVersion: string;
  configurationId: string;
  bucket: {
    name: string;
    ownerIdentity: {
      principalId: string;
    };
    arn: string;
  };
  object: {
    key: string;
    size: number;
    eTag: string;
    contentType: string;
    userMetadata: {
      "content-type": string;
    };
    sequencer: string;
  };
}

interface Source {
  host: string;
  port: string;
  userAgent: string;
}

interface MinioRecord {
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  eventTime: string;
  eventName: string;
  userIdentity: UserIdentity;
  requestParameters: RequestParameters;
  responseElements: ResponseElements;
  s3: S3;
  source: Source;
}

interface MinioWebhook {
  EventName: string;
  /// File path
  Key: string;
  Records: MinioRecord[];
}

try {
  mkdirSync("data");
} catch {}

const config = {
  s3: {
    accessKey: process.env.S3_ACCESS_KEY ?? "",
    secretKey: process.env.S3_SECRET ?? "",
  },
  assemblyApiKey: process.env.ASSEMBLY_API_TOKEN ?? "",
};

if (config.s3.accessKey === "" || config.s3.secretKey === "") {
  console.log("S3 environment variables not defined");
  process.exit(1);
}

var minioClient = new Minio.Client({
  endPoint: "s3.hooli.co",
  port: 443,
  useSSL: true,
  ...config.s3,
});

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`${pkg.name} ${pkg.version}`);
});

app.get("/healthz", (req, res) => res.send());
app.get("/readyz", (req, res) => res.send());

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mktmp = () =>
  fs.mkdtempSync(join("data", new Date().getTime().toString()));

const downloadFile = async (
  bucketName: string,
  key: string,
  destination: string
) => {
  const fileStream = fs.createWriteStream(destination);

  const object = await minioClient.getObject(bucketName, key);
  object.on("data", (chunk) => fileStream.write(chunk));

  await (async () =>
    new Promise<void>((resolve) => {
      object.on("end", () => {
        console.log(`Reading ${key} finished`);
        resolve();
      });
    }))();

  return { bucketName, key, destination };
};

const handleFfmpegInbox = async (minioWebhook: MinioWebhook) => {
  const record = minioWebhook.Records[0];
  if (!record) throw new Error("No record");

  const tmp = mktmp();
  const dest = join(tmp, record.s3.object.key);

  const downloadResult = await downloadFile(
    record.s3.bucket.name,
    record.s3.object.key,
    dest
  );

  const mp3Name = [record.s3.object.key, "mp3"].join(".");

  const mp3Out = join(tmp, mp3Name);
  // Extract sound only
  await (async () =>
    new Promise((resolve, reject) =>
      ffmpeg()
        // Input file
        .input(dest)

        // Audio bit rate
        // .outputOptions("-ab", "192k")

        // Output file
        .saveToFile(mp3Out)
        .on("end", resolve)
        .on("progress", (progress) => {
          if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
          }
        })
        .on("error", (error) => {
          console.error(error);
          reject(error);
        })
    ))();
  console.log("Converted");
  await sleep(500);
  await minioClient.putObject(
    "ffmpeg-outbox",
    mp3Name,
    fs.readFileSync(mp3Out)
  );
  rmSync(tmp, { force: true, recursive: true });
};

const handleFfmpegOutbox = async (minioWebhook: MinioWebhook) => {
  const record = minioWebhook.Records[0];
  if (!record) throw new Error("No record");
  const { key } = record.s3.object;
  const { name: bucketName } = record.s3.bucket;
  if (key.includes("outboxignore")) {
    console.log("Contains outboxignore, ignoring");
    return;
  }
  const tmp = mktmp();
  const dest = join(tmp, record.s3.object.key);

  const downloadResult = await downloadFile(
    record.s3.bucket.name,
    record.s3.object.key,
    dest
  );
  await sleep(500);
  await minioClient.putObject(
    "transcription-inbox",
    key,
    fs.readFileSync(dest)
  );

  rmSync(tmp, { force: true, recursive: true });
};

const getPresignedUrl = async (bucketName: string, key: string) => {
  return await minioClient.presignedGetObject(
    bucketName,
    key,
    // valid for 24 hours
    60 * 60 * 24
  );
};

const handleTranscriptionInbox = async (minioWebhook: MinioWebhook) => {
  const record = minioWebhook.Records[0];
  if (!record) throw new Error("No record");
  const { key } = record.s3.object;
  const { name: bucketName } = record.s3.bucket;
  const tmp = mktmp();

  const presignedUrl = await getPresignedUrl(
    record.s3.bucket.name,
    record.s3.object.key
  );

  console.log(`Generated presignedUrl of ${presignedUrl}`);

  const transcriptionName = [key, "json"].join(".");
  const dest = join(tmp, transcriptionName);

  // AssemblyAI transcript endpoint (where we submit the file)
  const transcript_endpoint = "https://api.assemblyai.com/v2/transcript";

  // request parameters where Speaker Diarization has been enabled
  const data = {
    audio_url: presignedUrl,
    speaker_labels: true,
    entity_detection: true,
  };

  // HTTP request headers
  const headers = {
    Authorization: config.assemblyApiKey,
    "Content-Type": "application/json",
  };

  console.log(`Submitting ${presignedUrl} to ${transcript_endpoint}`);

  // submit for transcription via HTTP request
  const response = await axios.post(transcript_endpoint, data, {
    headers: headers,
  });

  console.log(`Submission response: ${JSON.stringify(response.data)}`);

  // polling for transcription completion
  const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${response.data.id}`;

  while (true) {
    const pollingResponse = await axios.get(pollingEndpoint, {
      headers: headers,
    });
    const transcriptionResult = pollingResponse.data;

    if (transcriptionResult.status === "completed") {
      console.log("Transcription finished");
      fs.writeFileSync(dest, JSON.stringify(transcriptionResult));
      break;
    } else if (transcriptionResult.status === "error") {
      throw new Error(`Transcription failed: ${transcriptionResult.error}`);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  await sleep(500);
  await minioClient.putObject(
    "transcription-outbox",
    transcriptionName,
    fs.readFileSync(dest)
  );
};
const handleTranscriptionOutbox = async (minioWebhook: MinioWebhook) => {};

app.post("/minio-webhook", async (req, res) => {
  console.log(req.body);
  const webhookBody: MinioWebhook = req.body;
  switch (webhookBody.Records[0]?.s3.bucket.arn) {
    case "arn:aws:s3:::ffmpeg-inbox":
      return res.send(await handleFfmpegInbox(webhookBody));
      break;
    case "arn:aws:s3:::ffmpeg-outbox":
      return res.send(await handleFfmpegOutbox(webhookBody));
      break;
    case "arn:aws:s3:::transcription-inbox":
      return res.send(await handleTranscriptionInbox(webhookBody));
      break;
    case "arn:aws:s3:::transcription-outbox":
      return res.send(await handleTranscriptionOutbox(webhookBody));
      break;
    default:
      return res.status(400).send();
  }
});

app.listen(port, () => {
  console.log(`media-pipeline-listener listening on port ${port}`);
});
