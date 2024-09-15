// Chess board
"use client"

import { ChessGame } from "@/classes/chess/chess_game";
import ChessBoard from "./board";
import { useRef, useState } from "react";
import Notice from "../notice";
import { Position } from "@/classes/chess/helpers/position";

// FEN Notation: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
export default function ChessBoardPlayable() {
    const [currentBoardFEN, setCurrentBoardFEN] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const selectedTile = useRef<Position | null>(null);
    const [highlightedTiles, setHighlightedTiles] = useState<Position[] | null>(null);

    const gameRef = useRef<ChessGame>(new ChessGame(currentBoardFEN));


    const handleTileClick = (rowIndex: number, columnIndex: number) => {
        // First selection
        if (!selectedTile.current) {
            selectedTile.current = { row: rowIndex, column: columnIndex };
            setHighlightedTiles(gameRef.current.movementEngine.getPieceMovementOptions(selectedTile.current));
            return;
        }

        // Get the tiles selected
        const lastTileSelected = { row: selectedTile.current.row, column: selectedTile.current.column };
        const currentTileSelected = { row: rowIndex, column: columnIndex };

        // Same selection twice
        if (lastTileSelected.row == currentTileSelected.row && lastTileSelected.column == currentTileSelected.column) {
            selectedTile.current = null;
            setHighlightedTiles(null);
            return;
        }

        // Valid move?
        if (highlightedTiles?.some(t => t.row == currentTileSelected.row && t.column == currentTileSelected.column)) {
            // Move.
            const moved = gameRef.current.movementEngine.movePiece(lastTileSelected, currentTileSelected)

            if (!moved) {
                selectedTile.current = null;
                setHighlightedTiles(null);
                return;
            }

            setCurrentBoardFEN(gameRef.current.toFEN());
            selectedTile.current = null;
            setHighlightedTiles(null);
            return;
        }

        // Reselection required
        selectedTile.current = { row: rowIndex, column: columnIndex };
        setHighlightedTiles(gameRef.current.movementEngine.getPieceMovementOptions(selectedTile.current));
        return;
    };


    return (
        <>
            <ChessBoard fenString={currentBoardFEN} onTileClick={handleTileClick} highlightedTiles={highlightedTiles} />
        </>
    );
} 
