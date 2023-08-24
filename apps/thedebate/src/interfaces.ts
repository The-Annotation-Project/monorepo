import { Annotation } from "./Debate2/types";

export interface UtteranceInterface {
  confidence: number;
  end: number;
  speaker: string;
  start: number;
  text: string;
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker: string;
  }>;
}

export interface TranscriptionInterface {
  utterances: UtteranceInterface[];
}


export interface PlayerInterface {
  getCurrentTime: () => number;
}

export interface SelectedAnnotationInterface{
  annotation:Annotation;
  textAnnotatedOn:string;
}