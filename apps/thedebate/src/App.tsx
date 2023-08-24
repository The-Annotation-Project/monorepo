import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { annotationData, transcriptionData } from "./Debate2";

import YouTube from "react-youtube";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ShowAnnotation from "./Components/ShowAnnotation";
import { debounce } from "./utils/debounce";
import {
  PlayerInterface,
  SelectedAnnotationInterface,
  TranscriptionInterface,
  UtteranceInterface,
} from "./interfaces";
import AnnotationLine from "./Components/AnnotationLine";

const height = 600;

// YouTube video player options
const opts = {
  height,
  width: "100%",
  playerVars: {
    autoplay: 0,
  },
};

const videoId = "irzSo578gmg"; // Replace with your YouTube video ID

function App() {
  const [currentUtterance, setCurrentUtterance] =
    useState<UtteranceInterface | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SelectedAnnotationInterface | null>(null);
  const [player, setPlayer] = useState<PlayerInterface | null>(null);
  const [jsx, setJsx] = useState<null | JSX.Element>(null); //the jsx to show on the right hand side
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Function that returns the utterance for a given timestamp
  const getUtteranceByTimestamp = useCallback(
    (timestamp: number): UtteranceInterface | null => {
      for (let utterance of (transcriptionData as TranscriptionInterface)
        .utterances) {
        if (timestamp >= utterance.start && timestamp <= utterance.end) {
          return utterance;
        }
      }
      return null;
    },
    []
  );

  const updateScrollPosition = useCallback(() => {
    if (player && currentUtterance && contentRef.current) {
      const timestamp = player.getCurrentTime() * 1000;
      const currentScroll =
        (timestamp - currentUtterance.start) /
        (currentUtterance.end - currentUtterance.start);
      const scrollStart = 0.3;
      const scrollEnd = 0.8;
      if (currentScroll > scrollStart && currentScroll < scrollEnd) {
        const desiredScroll = Math.min(
          (currentScroll - scrollStart) / (scrollEnd - scrollStart),
          1
        );
        const scrollHeight = contentRef.current.scrollHeight;
        contentRef.current.scrollTo({
          top: desiredScroll * scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [player, currentUtterance]);

  const updateUtterance = useCallback(() => {
    if (player) {
      const timestamp = Math.floor(player.getCurrentTime() * 1000); // convert to milliseconds
      setCurrentUtterance(getUtteranceByTimestamp(timestamp) || null);
    }
  }, [getUtteranceByTimestamp, player]);

  const getJSX = useCallback((utterance: UtteranceInterface): JSX.Element => {
    let jsx: JSX.Element[] = [<span>{utterance.speaker}:</span>];

    // Filter out annotations that do not belong to the utterance
    const filteredAnnotations = annotationData.filter((annotation) => {
      return (
        annotation.start >= utterance.start && annotation.end <= utterance.end
      );
    });

    //sort
    const relevantAnnotations = [...filteredAnnotations].sort(
      (a, b) => a.start - b.start
    );

    /*
    create jsx: for each annotation we have words within the annotation, and words before that annotaion
    we iterate over annotations and add beforeWords and words, then after all done, we add remaining words
    */
    let i = 0; //utterance.words index

    for (let ai = 0; ai < relevantAnnotations.length; ai++) {
      let words = [];
      let beforeWords = [];
      while (
        i < utterance.words.length &&
        utterance.words[i].end <= relevantAnnotations[ai].end
      ) {
        if (utterance.words[i].end <= relevantAnnotations[ai].start) {
          beforeWords.push(utterance.words[i].text);
        }
        if (
          utterance.words[i].start >= relevantAnnotations[ai].start &&
          utterance.words[i].end <= relevantAnnotations[ai].end
        ) {
          words.push(utterance.words[i].text);
        }
        i++;
      }

      jsx.push(<span>{beforeWords.join(" ")} </span>);
      jsx.push(
        <AnnotationLine
          setSelectedAnnotation={setSelectedAnnotation}
          text={words.join(" ")}
          annotation={relevantAnnotations[ai]}
        />
      );
    }

    let remainingWords = [];
    for (; i < utterance.words.length; i++) {
      remainingWords.push(utterance.words[i].text);
    }
    jsx.push(<span>{remainingWords.join(" ")}</span>);

    return <>{jsx}</>;
  }, []);

  // Check video timestamp every second and update the current utterance
  useEffect(() => {
    let updateUtteranceTimer: null | number = null;
    let scrollTimer: null | number = null;
    if (player) {
      updateUtteranceTimer = window.setInterval(() => {
        updateUtterance();
      }, 1000);
      scrollTimer = window.setInterval(() => {
        updateScrollPosition();
      }, 5000);
      // TODO: this interval works even if the video is stopped
    }
    return () => {
      if (updateUtteranceTimer) {
        clearInterval(updateUtteranceTimer);
      }
      if (scrollTimer) {
        clearInterval(scrollTimer);
      }
    };
  }, [player, updateScrollPosition, updateUtterance]);

  useEffect(() => {
    if (currentUtterance) {
      //remove selected annotation when utterance changes
      setSelectedAnnotation(null);
      setJsx(getJSX(currentUtterance));
    }
  }, [currentUtterance, getJSX]);

  useEffect(() => {
    const debouncedUpdateScrollPosition = debounce(updateScrollPosition, 300);

    const current = contentRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      debouncedUpdateScrollPosition();
    });

    if (current) {
      resizeObserver.observe(current);
    }

    return () => {
      if (current) {
        resizeObserver.unobserve(current);
      }
    };
  }, [updateScrollPosition]);

  return (
    <>
      <Typography variant="h5" p={2} pb={0}>
        Annotation Platform
      </Typography>
      <Grid container spacing={3} p={2}>
        <Grid item xs={12} sm={8} md={7}>
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={(e) => {
              setPlayer(e.target);
            }}
            onStateChange={(e) => {
              if (
                e.target.getPlayerState() === 1 ||
                e.target.getPlayerState() === 2
              ) {
                // PlayerState.PLAYING || PlayerState.PAUSED
                updateUtterance();
                updateScrollPosition();
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={5}>
          <Card sx={{ height }}>
            <CardContent
              sx={{
                height: "100%",
                boxSizing: "border-box",
                overflow: "auto",
                textAlign: "justify",
              }}
              ref={contentRef}
            >
              {jsx}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <ShowAnnotation selectedAnnotation={selectedAnnotation} />
        </Grid>
      </Grid>
    </>
  );
}

export default App;
