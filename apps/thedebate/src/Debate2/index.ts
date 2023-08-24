import { Annotation } from "./types";
import annotationJson from "./annotations.json";
import  transcriptionJson from "./transcription.json";

export const annotationData: Annotation[] = annotationJson as any;
export const transcriptionData: any = transcriptionJson;
