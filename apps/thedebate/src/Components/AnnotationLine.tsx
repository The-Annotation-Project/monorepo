import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { Annotation } from "../Debate2/types";
import { useState } from "react";
import { SelectedAnnotationInterface } from "../interfaces";

interface AnnotationLineInterface {
  annotation: Annotation;
  text: string;
  setSelectedAnnotation: React.Dispatch<
    React.SetStateAction<SelectedAnnotationInterface | null>
  >;
}

const AnnotationLine: React.FC<AnnotationLineInterface> = ({
  text,
  setSelectedAnnotation,
  annotation,
}) => {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <Tooltip
        title={
          clicked
            ? "Done!"
            : `By ${annotation.annotatedBy
                .map((i) => i.name)
                .join(", ")}, Click to View`
        }
        arrow
        placement="top"
      >
        <Box
          onClick={() => {
            if (!clicked) {
              setSelectedAnnotation({
                annotation,
                textAnnotatedOn: text,
              });
              setClicked(true);
              setTimeout(() => {
                setClicked(false);
              }, 750);
            }
          }}
          sx={{
            display: "inline",
            color: `rgb(${annotation.color})`,
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              cursor: "pointer",
              backgroundColor: `rgba(${annotation.color},0.1)`,
            },
            boxSizing: "border-box",
            borderBottom: `2px solid rgb(${annotation.color})`,
          }}
        >
          {text}
        </Box>
      </Tooltip>{" "}
    </>
  );
};

export default AnnotationLine;
