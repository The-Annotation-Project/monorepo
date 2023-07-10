require("dotenv").config();

import axios from "axios";
import fs from "fs";

const run = async () => {
  // replace with your API token
  const API_TOKEN = process.env.ASSEMBLY_API_TOKEN;
  if (API_TOKEN === undefined) {
    console.log("ASSEMBLY_API_TOKEN not defined");
    process.exit(1);
  }

  // URL of the file to transcribe
  const FILE_URL =
    "https://pub-1ce3702f432549ffae40e2d281c22c8f.r2.dev/BushVGore2000_Debate2_0000-0500.mp3";

  // AssemblyAI transcript endpoint (where we submit the file)
  const transcript_endpoint = "https://api.assemblyai.com/v2/transcript";

  // request parameters where Speaker Diarization has been enabled
  const data = {
    audio_url: FILE_URL,
    speaker_labels: true,
    entity_detection: true,
  };

  // HTTP request headers
  const headers = {
    Authorization: API_TOKEN,
    "Content-Type": "application/json",
  };

  console.log(`Submitting ${FILE_URL} to ${transcript_endpoint}`);

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
      // print the results
      console.log(transcriptionResult);
      fs.writeFileSync(
        `outputs/${response.data.id}.json`,
        JSON.stringify(transcriptionResult)
      );
      break;
    } else if (transcriptionResult.status === "error") {
      throw new Error(`Transcription failed: ${transcriptionResult.error}`);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

run();
