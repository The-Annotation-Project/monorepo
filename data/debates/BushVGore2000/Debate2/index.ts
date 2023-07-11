import { Annotation } from "../../src";
import * as annotationJson from "./annotations.json";
import * as transcriptionJson from "./transcription.json";

export const annotationData: Annotation = annotationJson as any;
export const transcriptionData: any = transcriptionJson;
