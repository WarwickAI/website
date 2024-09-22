import { ChessGame } from "./chess_game";
import { addPositions, multiplyPosition, Position } from "./helpers/position";
import { Piece, PieceColour } from "./piece";


export class MovementEngine {
    private game: ChessGame;

    constructor(game: ChessGame) {
        this.game = game;
    }


    // Move a piece
    public movePiece(from: Position, to: Position): boolean {
        const movedPiece = this.getPiece(from);
        const targetPiece = this.getPiece(to);

        // validity of the moved piece
        if (!movedPiece || movedPiece.colour != this.game.nextToMove)
            return false;


        // update game stats
        this.game.nextToMove = movedPiece.colour === "white" ? "black" : "white";
        this.game.halfMoveClock = targetPiece || movedPiece.name === "p" ? 0 : this.game.halfMoveClock + 1;
        this.game.fullMoveClock = targetPiece ? 1 : this.game.fullMoveClock + (movedPiece.colour === "black" ? 1 : 0);

        // Move the piece
        const takenPiece = this.game.board[to.row][to.column];
        if (takenPiece?.name == "k") this.game.winner = movedPiece.colour;  // Temporary king capture = win

        this.game.board[to.row][to.column] = movedPiece;
        this.game.board[from.row][from.column] = undefined;

        // Castle availability. Can we pretend this spaghetti bowl of pasta doesn't exist?
        if (movedPiece.name === "k") {
            if (movedPiece.colour === "black") {
                this.game.blackCastleKingside = false;
                this.game.blackCastleQueenside = false;
            }
            else {
                this.game.whiteCastleKingside = false;
                this.game.whiteCastleQueenside = false;
            }
        }
        if (movedPiece.name === "r") {
            this.game.blackCastleQueenside &&= !(from.row == 0 && from.column == 0);
            this.game.blackCastleKingside &&= !(from.row == 0 && from.column == 7);
            this.game.whiteCastleQueenside &&= !(from.row == 7 && from.column == 0);
            this.game.whiteCastleKingside &&= !(from.row == 7 && from.column == 7);
        }

        // pawn bullshittery - needs redoing if chess becomes 4-way
        if (movedPiece.name == "p") {
            // Took an enpassant
            if (this.game.enPassantTarget === this.positionToChessPosition(to))
                this.game.board[from.row][to.column] = undefined;

            // Moved 2 (setup for enpassant)
            if (Math.abs(from.row - to.row) == 2)
                this.game.enPassantTarget = this.positionToChessPosition({ row: (from.row + to.row) / 2, column: to.column }) ?? "-";
            else this.game.enPassantTarget = "-";

            // Reached end of board?
            if (to.row == 0 || to.row == this.game.board.length) {
                const pawn = this.game.board[to.row][to.column];
                if (pawn) pawn.name = "q"; // Deafult to Queen for now.
            }
        }
        else {
            this.game.enPassantTarget = "-";
        }

        return true;
    }


    // Returns "e4", "d5" etc...
    public positionToChessPosition(pos: Position): string | undefined {
        const columnLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        if (pos.row < 0 || pos.row > 7 || pos.column < 0 || pos.column > 7)
            return undefined;

        const columnLetter = columnLetters[pos.column];
        const rowNumber = 8 - (pos.row);    // THE BOARD IS BACKWARDS OH FCK

        return `${columnLetter}${rowNumber}`;
    }

    // Returns the position of "e4", "d5", etc...
    public chessPositionToPosition(chessPos: string): Position | undefined {
        const columnLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        return /^[a-h][1-8]$/.test(chessPos) ?
            { row: 8 - (parseInt(chessPos[1])), column: columnLetters.indexOf(chessPos[0]) } :
            undefined
    }

    // Check if a location is a piece
    public isPiece(location: Position): boolean {
        return this.getPiece(location) != undefined;
    }

    // Get a piece at a location
    public getPiece(location: Position): Piece | undefined {
        return this.game.board[location.row][location.column];
    }

    // Check if a position is in check for a colour
    public isInCheck(location: Position, colour: PieceColour): boolean {
        for (let y = 0; y < this.game.board.length; y++) {
            for (let x = 0; x < this.game.board[y].length; x++) {

                const piece = this.getPiece({ row: y, column: x });
                if (piece && piece.colour !== colour) {
                    const coveredSquares = this.getPieceMovementOptions({ row: y, column: x }, true);

                    if (coveredSquares.some(cell => cell.row == location.row && cell.column == location.column))
                        return true;
                }
            }
        }
        return false;
    }


    // Get all movement options from a piece
    public getPieceMovementOptions(location: Position, checkCheck: boolean = false): Position[] {
        const piece = this.getPiece(location);
        if (piece == undefined) return [];

        switch (piece.name) {
            case 'p': return this.getPawnMovementOptions(location, checkCheck);
            case 'r': return this.getRookMovementOptions(location, checkCheck);
            case 'n': return this.getKnightMovementOptions(location);
            case 'b': return this.getBishopMovementOptions(location, checkCheck);
            case 'q': return this.getQueenMovementOptions(location, checkCheck);
            case 'k': return this.getKingMovementOptions(location, checkCheck);
            default: return [];
        }
    }


    private getPawnMovementOptions(location: Position, checkCheck: boolean): Position[] {
        const pawn = this.getPiece(location);
        if (!pawn) return [];

        const movementDirection = pawn.colour === "white" ? -1 : 1;
        const oneStepMove: Position = addPositions(location, { row: movementDirection, column: 0 });
        // Two steps ahead... I am always. Two steps. Ahead...
        const twoStepMove: Position = addPositions(location, { row: 2 * movementDirection, column: 0 });

        const takeLeft: Position = addPositions(location, { row: movementDirection, column: -1 });
        const takeRight: Position = addPositions(location, { row: movementDirection, column: 1 });

        const validMoves: Position[] = [];

        // Movement
        if (!checkCheck && !this.isPiece(oneStepMove)) {
            validMoves.push(oneStepMove);
            if (this.isPawnInStartingPosition(location, pawn.colour) && !this.isPiece(twoStepMove))
                validMoves.push(twoStepMove);
        }

        // Capture
        if (checkCheck
            || (this.isPiece(takeLeft) && this.getPiece(takeLeft)?.colour !== pawn.colour)
            || this.positionToChessPosition(takeLeft) === this.game.enPassantTarget) validMoves.push(takeLeft);
        if (checkCheck
            || (this.isPiece(takeRight) && this.getPiece(takeRight)?.colour !== pawn.colour)
            || this.positionToChessPosition(takeRight) === this.game.enPassantTarget) validMoves.push(takeRight);

        return validMoves;
    }


    private getRookMovementOptions(location: Position, checkCheck: boolean): Position[] {
        const rook = this.getPiece(location);
        if (!rook) return [];

        const directions: Position[] = [
            { row: 1, column: 0 },
            { row: -1, column: 0 },
            { row: 0, column: 1 },
            { row: 0, column: -1 }
        ];

        return this.getLinearMovementOptions(location, directions, rook.colour, checkCheck);
    }


    private getKnightMovementOptions(location: Position): Position[] {
        const knight = this.getPiece(location);
        if (!knight) return [];

        const directions: Position[] = [
            { row: -1, column: -2 },
            { row: -1, column: 2 },
            { row: -2, column: -1 },
            { row: -2, column: 1 },
            { row: 1, column: -2 },
            { row: 1, column: 2 },
            { row: 2, column: -1 },
            { row: 2, column: 1 }
        ]

        const validMoves: Position[] = [];

        directions.forEach(direction => {
            const pos = addPositions(location, direction);
            if (this.isWithinBounds(pos) && !(this.getPiece(pos)?.colour === knight.colour))
                validMoves.push(pos);
        });

        return validMoves;
    }

    private getBishopMovementOptions(location: Position, checkCheck: boolean): Position[] {
        const bishop = this.getPiece(location);
        if (!bishop) return [];

        const directions: Position[] = [
            { row: 1, column: 1 },
            { row: 1, column: -1 },
            { row: -1, column: 1 },
            { row: -1, column: -1 }
        ];

        return this.getLinearMovementOptions(location, directions, bishop.colour, checkCheck);
    }

    private getQueenMovementOptions(location: Position, checkCheck: boolean): Position[] {
        return [...this.getRookMovementOptions(location, checkCheck), ...this.getBishopMovementOptions(location, checkCheck)];
    }

    private getKingMovementOptions(location: Position, checkCheck: boolean): Position[] {
        const king = this.getPiece(location);
        if (!king) return [];

        const directions: Position[] = [
            { row: -1, column: -1 },
            { row: -1, column: 0 },
            { row: -1, column: 1 },
            { row: 0, column: -1 },
            { row: 0, column: 1 },
            { row: 1, column: -1 },
            { row: 1, column: 0 },
            { row: 1, column: 1 },
        ]

        const validMoves: Position[] = [];

        directions.forEach(direction => {
            const pos = addPositions(location, direction);
            if (this.isWithinBounds(pos) && !(this.getPiece(pos)?.colour === king.colour) && (checkCheck || !this.isInCheck(pos, king.colour)))
                validMoves.push(pos);
        });

        // Castling availability
        const castleQueenside: Position | null = (king.colour === "black" ? this.game.blackCastleQueenside : this.game.whiteCastleQueenside) ? { row: 0, column: -2 } : null;
        const castleKingside: Position | null = (king.colour === "black" ? this.game.blackCastleKingside : this.game.whiteCastleKingside) ? { row: 0, column: 2 } : null;

        if (castleQueenside) {
            let castle: boolean = true;
            for (let x = location.column - 1; x > 0; x--) {
                const queryLocation: Position = { row: location.row, column: x };
                if (this.isPiece(queryLocation) || this.isInCheck(queryLocation, king.colour)) {
                    castle = false;
                    break;
                }
            }
            if (castle) validMoves.push(addPositions(location, castleQueenside));
        }
        if (castleKingside) {
            let castle: boolean = true;
            for (let x = location.column + 1; x <= this.game.board[location.column].length; x++) {
                const queryLocation: Position = { row: location.row, column: x };
                if (this.isPiece(queryLocation) || this.isInCheck(queryLocation, king.colour)) {
                    castle = false;
                    break;
                }
            }
            if (castle) validMoves.push(addPositions(location, castleKingside));
        }

        return validMoves;
    }


    private isPawnInStartingPosition(location: Position, colour: string): boolean {
        return colour === "white" ? location.row === 6 : location.row === 1;
    }

    private isWithinBounds(location: Position): boolean {
        return location.row >= 0 && location.row < 8 && location.column >= 0 && location.column < 8;
    }


    // Get all of the valid movement options in the given directions
    private getLinearMovementOptions(location: Position, directions: Position[], pieceColour: string, ignoreKing: boolean, checkCheck: boolean = false): Position[] {
        const validMoves: Position[] = [];

        directions.forEach(direction => {
            let currentLocation = location;

            while (true) {
                const nextPosition = addPositions(currentLocation, direction);
                if (!this.isWithinBounds(nextPosition)) break;

                const pieceAtNextPosition = this.getPiece(nextPosition);

                // Friendly?
                if (pieceAtNextPosition?.colour === pieceColour && !checkCheck) break;
                validMoves.push(nextPosition);

                // Enemy? (Exclude king if ignore king flag set)
                if (pieceAtNextPosition && !(ignoreKing && pieceAtNextPosition.name === "k"))
                    break;

                currentLocation = nextPosition;
            }
        });

        return validMoves;
    }

}

