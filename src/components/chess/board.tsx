// Chess board
"use client"

import Piece from "./piece";
import boardStyle from "./board.module.css"
import { ChessGame } from "@/classes/chess/chess_game";
import Notice from "../notice";

// FEN Notation: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
export default function ChessBoard(props: {
    fenString: string,
    tileSize?: string,
    onTileClick?: (row: number, column: number) => void
    highlightedTiles?: Array<{ row: number; column: number }> | null;
}) {
    let game = new ChessGame(props.fenString);

    if (!game.validPosition) {
        return (
            <Notice important={true} >Invalid game position</Notice>
        );
    }

    const isTileSelected = (row: number, column: number) => {
        return props.highlightedTiles?.some(tile => tile.row === row && tile.column === column);
    };

    return (
        <div className="grid place-content-center" >
            {game.board.map((row, rowIndex) => (
                <div className="flex" key={rowIndex}>
                    {row.map((piece, columnIndex) => (
                        <div
                            className={`${boardStyle["tile" + ((rowIndex + columnIndex) % 2)]}`}
                            style={{ '--tile-size': props.tileSize || '80px' } as React.CSSProperties}
                            key={columnIndex}
                            onClick={() => props.onTileClick?.(rowIndex, columnIndex)}
                        >
                            {piece ? (
                                <Piece piece={piece} />
                            ) : (
                                <div className={boardStyle.blankTile} />
                            )}
                            {isTileSelected(rowIndex, columnIndex) && <div className={boardStyle.highlightOrb} />}
                        </div>
                    ))}
                </div>
            ))
            }
        </div >
    );
} 
