import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { SelectedAnnotationInterface } from "../interfaces";

interface ShowAnnotationInterface {
  selectedAnnotation: SelectedAnnotationInterface | null;
}

const ShowAnnotation: React.FC<ShowAnnotationInterface> = ({
  selectedAnnotation,
}) => {
  return (
    <Card>
      <CardContent>
        {selectedAnnotation ? (
          <>
            <Typography variant="subtitle1">
              Annotated by:{" "}
              {selectedAnnotation.annotation.annotatedBy
                .map((a) => a.name)
                .join(", ")}
            </Typography>
            <Typography variant="subtitle2">
              {selectedAnnotation.annotation.text}
            </Typography>
            <Divider sx={{ mt: 1, mb: 1 }} />
            <Typography variant="subtitle2">
              {selectedAnnotation.textAnnotatedOn}
            </Typography>
          </>
        ) : (
          <Typography>Click on a annotation to view!</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ShowAnnotation;
