import { Chess, Square, Piece, PieceSymbol, Color } from "chess.js";
import { Position } from "./helpers/position";

const locationRegex = /^[a-h][1-8]$/;

export class ChessGame {
  private chess: Chess;
  private isValidPosition: boolean;

  constructor(fenString?: string) {
    this.isValidPosition = true;
    try {
      this.chess = new Chess(fenString);
    } catch (e) {
      this.isValidPosition = false;
      this.chess = new Chess();
    }
  }

  public isValidGameState(): boolean {
    return this.isValidPosition;
  }

  public board(): ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][] {
    return this.chess.board();
  }

  public getPiece(location: Position): Piece | undefined {
    const chessPos = this.positionToChessPosition(location);
    if (chessPos) return this.chess.get(chessPos);
  }

  public nextToMove(): Color {
    return this.chess.turn();
  }

  public getPieceMovementOptions(location: Position): Position[] {
    const square = this.positionToChessPosition(location);
    if (square) {
      console.log(this.chess.moves({ square: square }));
      const moves = this.chess.moves({ square: square });
      const positions: Position[] = [];
      for (let i = 0; i < moves.length; i++) {
        const pos = this.chessPositionToPosition(moves[i]);
        if (pos) positions.push(pos);
      }
      return positions;
    }
    return [];
  }

  public movePiece(from: Position, to: Position): boolean {
    this.chess.move({
      from: this.positionToChessPosition(from) as string,
      to: this.positionToChessPosition(to) as string,
      promotion: "q",
    });
    return true;
  }

  // Returns "e4", "d5" etc...
  public positionToChessPosition(pos: Position): Square | undefined {
    const columnLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];

    if (pos.row < 0 || pos.row > 7 || pos.column < 0 || pos.column > 7)
      return undefined;

    const columnLetter = columnLetters[pos.column];
    const rowNumber = 8 - pos.row; // THE BOARD IS BACKWARDS OH FCK

    return `${columnLetter}${rowNumber}` as Square;
  }

  // Returns the position of "e4", "d5", etc...
  public chessPositionToPosition(chessPos: string): Position | undefined {
    const columnLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];

    // Handle castling bullshit.
    if (chessPos === "O-O") return { row: 7, column: 6 };
    else if (chessPos === "O-O-O") return { row: 7, column: 2 };

    // Handle check or checkmate bullshit.
    if (chessPos.includes("+") || chessPos.includes("#"))
      chessPos = chessPos.substring(0, chessPos.length - 1);

    // Handles promotion bullshit.
    if (chessPos.includes("=")) chessPos = chessPos.split("=")[0];

    // Remove all the other bullshit.
    chessPos = chessPos.slice(-2);

    return locationRegex.test(chessPos)
      ? {
          row: 8 - parseInt(chessPos[1]),
          column: columnLetters.indexOf(chessPos[0]),
        }
      : undefined;
  }

  public toFEN(): string {
    return this.chess.fen();
  }

  public winner(): Color | "draw" | "something went wrong" | undefined {
    if (this.chess.isDraw() || this.chess.isInsufficientMaterial())
      return "draw";
    return !this.chess.isCheckmate()
      ? !this.chess.isGameOver()
        ? undefined
        : "something went wrong"
      : this.chess.turn() === "w"
        ? "b"
        : "w";
  }
}
