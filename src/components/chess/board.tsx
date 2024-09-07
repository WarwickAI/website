// Chess board
"use client"

import Piece from "./piece";
import boardStyle from "./board.module.css"
import { ChessGame } from "@/classes/chess/chess_game";

// ??? -> Allow https://chess.stackexchange.com/questions/8500/alternatives-to-the-fen-notation

// FEN Notation: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
export default function ChessBoard(props: { fenString: string }) {
    let game = new ChessGame(props.fenString)


    // className={`${boardStyle.board}`}
    return (
        <div className="grid place-content-center">
            {game.board.map((row, index) => (
                <div className="flex" key={index}>
                    {row.map((piece, column) => (
                        <div
                            className={`${boardStyle["tile" + ((index + column) % 2)]}`}
                            style={{ '--tile-size': '80px' } as React.CSSProperties}
                            key={column}
                        >
                            {piece ? (
                                <Piece
                                    pieceColour={piece.colour}
                                    pieceType={piece.name}
                                />
                            ) : (
                                <div className={boardStyle.blankTile} />
                            )}
                        </div>
                    ))}
                </div>
            ))
            }
        </div >
    );
} 