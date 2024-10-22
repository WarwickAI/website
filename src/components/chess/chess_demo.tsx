"use client";

import ChessBoard from "./board";
import { useEffect, useRef, useState } from "react";

export default function ChessDemo(props: {
  title: string;
  fenData: string;
  tileSize?: string;
}) {
  const gameFen = props.fenData.split("\n");
  const [currentFen, setCurrentFen] = useState<string | null>(null);
  const currentMoveIndex = useRef<number>(0);

  const gameEndDelayDefault = 5;
  const gameEndDelay = useRef<number>(gameEndDelayDefault);

  useEffect(() => {
    // Auto-move timer
    const intervalId = setInterval(() => {
      if (currentMoveIndex.current < gameFen.length) {
        setCurrentFen(gameFen[currentMoveIndex.current++]);
        return;
      }

      gameEndDelay.current--;
      if (gameEndDelay.current <= 0) {
        gameEndDelay.current = gameEndDelayDefault;
        currentMoveIndex.current = 0;
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <ChessBoard
        fenString={
          currentFen ??
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        }
        tileSize={props.tileSize}
      />
      <p className={"t-16 text-center font-mono text-lg text-wai-gray"}>
        {currentFen ? props.title : "Loading..."}
      </p>
    </div>
  );
}
