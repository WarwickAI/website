// Chess board
"use client";

import { ChessGame } from "@/classes/chess/chess_game";
import { Color } from "chess.js";
import ChessBoard from "./board";
import { useRef, useState } from "react";
import { Position } from "@/classes/chess/helpers/position";

// FEN Notation: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
export default function ChessBoardPlayable() {
  const [currentBoardFEN, setCurrentBoardFEN] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const selectedTile = useRef<Position | null>(null);
  const [highlightedTiles, setHighlightedTiles] = useState<Position[] | null>(
    null,
  );
  const [winner, setWinner] = useState<
    Color | "draw" | "something went wrong" | undefined
  >(undefined);

  const gameRef = useRef<ChessGame>(new ChessGame(currentBoardFEN));

  const handleTileClick = (rowIndex: number, columnIndex: number) => {
    if (winner || gameRef.current.nextToMove() === "b") return;

    // First selection
    if (!selectedTile.current) {
      const selectedPos: Position = { row: rowIndex, column: columnIndex };
      const piece = gameRef.current.getPiece(selectedPos);

      if (!piece || gameRef.current.nextToMove() !== piece.color) return;

      selectedTile.current = selectedPos;
      setHighlightedTiles(
        gameRef.current.getPieceMovementOptions(selectedTile.current),
      );
      return;
    }

    // Get the tiles selected
    const lastTileSelected = {
      row: selectedTile.current.row,
      column: selectedTile.current.column,
    };
    const currentTileSelected = { row: rowIndex, column: columnIndex };

    // Same selection twice
    if (
      lastTileSelected.row == currentTileSelected.row &&
      lastTileSelected.column == currentTileSelected.column
    ) {
      selectedTile.current = null;
      setHighlightedTiles(null);
      return;
    }

    // Valid move?
    if (
      highlightedTiles?.some(
        (t) =>
          t.row == currentTileSelected.row &&
          t.column == currentTileSelected.column,
      )
    ) {
      // Move.
      const moved = gameRef.current.movePiece(
        lastTileSelected,
        currentTileSelected,
      );

      if (!moved) {
        selectedTile.current = null;
        setHighlightedTiles(null);
        return;
      }

      setCurrentBoardFEN(gameRef.current.toFEN());
      selectedTile.current = null;
      setHighlightedTiles(null);
      setWinner(gameRef.current.winner());

      // Get move from API
      getMoveFromAPI(gameRef.current.toFEN()).then((aiFen) => {
        console.log(aiFen);
        if (aiFen) {
          gameRef.current = new ChessGame(aiFen);
          setCurrentBoardFEN(aiFen);
        }
      });

      return;
    }

    // Choose
    const piece = gameRef.current.getPiece(currentTileSelected);

    if (!piece || gameRef.current.nextToMove() !== piece.color) {
      selectedTile.current = null;
      setHighlightedTiles(null);
      return;
    }

    selectedTile.current = currentTileSelected;
    setHighlightedTiles(
      gameRef.current.getPieceMovementOptions(selectedTile.current),
    );
    return;
  };

  function getWinnerMessage(winner: Color | "draw" | "something went wrong") {
    if (winner === "draw" || winner === "something went wrong")
      return `${winner.toUpperCase()} WON`;
    return `${winner === "b" ? "BLACK" : "WHITE"} WON`;
  }

  // This will need to be updated to our Chess AI whenever it gets made.
  // The AI just needs an API which takes in a FEN string, and outputs a FEN string of the next position... or something like that.
  async function getMoveFromAPI(fen: string): Promise<string | null> {
    // You will need to run the AI server locally!
    const url =
      process.env.NODE_ENV === "development"
        ? "http://localhost:8787/"
        : "https://bad-chess-ai.hello-442.workers.dev/";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Accept: "text/plain",
        },
        body: fen,
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  return (
    <>
      {winner && (
        <div className="text-center font-mono text-4xl font-bold text-blue-green">
          {getWinnerMessage(winner)}
        </div>
      )}
      <ChessBoard
        fenString={currentBoardFEN}
        onTileClick={handleTileClick}
        highlightedTiles={highlightedTiles}
      />
      <p className="text-center font-mono text-2xl font-bold text-wai-gray">
        {currentBoardFEN}
      </p>
    </>
  );
}
