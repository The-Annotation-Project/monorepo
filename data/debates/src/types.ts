export type Annotation = {
  /**
   * The start time in milliseconds for the annotation
   */
  start: number;
  /**
   * The end time in milliseconds for the annotation
   */
  end: number;
  /**
   * The text to be displayed for the annotation
   */
  text: string;
  /**
   * The author(s) of the annotation
   */
  annotatedBy: AnnotationCredit[];
  /**
   * The type of annotation, used for deserialization
   * and rendering
   */
  type: AnnotationType;
  /**
   * Polymorphic data based on type
   */
  data: any;
};

export const AnnotationTypes = ["PlainText"] as const;

export type AnnotationType = (typeof AnnotationTypes)[number];

export type AnnotationCredit = {
  /**
   * The name of the annotation author in either
   * plain or Name <email> format
   */
  name: string;
};
