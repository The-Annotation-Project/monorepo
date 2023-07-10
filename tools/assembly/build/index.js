"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv").config();
const axios_1 = tslib_1.__importDefault(require("axios"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const run = async () => {
    // replace with your API token
    const API_TOKEN = process.env.ASSEMBLY_API_TOKEN;
    if (API_TOKEN === undefined) {
        console.log("ASSEMBLY_API_TOKEN not defined");
        process.exit(1);
    }
    // URL of the file to transcribe
    const FILE_URL = "https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3";
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
    const response = await axios_1.default.post(transcript_endpoint, data, {
        headers: headers,
    });
    console.log(`Submission response: ${response.data}`);
    // polling for transcription completion
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${response.data.id}`;
    while (true) {
        const pollingResponse = await axios_1.default.get(pollingEndpoint, {
            headers: headers,
        });
        const transcriptionResult = pollingResponse.data;
        if (transcriptionResult.status === "completed") {
            // print the results
            console.log(transcriptionResult);
            fs_1.default.writeFileSync(`${response.data.id}.json`, JSON.stringify(transcriptionResult));
            break;
        }
        else if (transcriptionResult.status === "error") {
            throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        }
        else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
};
run();
