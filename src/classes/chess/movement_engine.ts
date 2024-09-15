import { ChessGame } from "./chess_game";
import { addPositions, multiplyPosition, Position } from "./helpers/position";
import { Piece, PieceColour } from "./piece";


export class MovementEngine {
    private game: ChessGame;

    constructor(game: ChessGame) {
        this.game = game;
    }


    // Move a piece
    public movePiece(from: { row: number, column: number }, to: { row: number, column: number }): boolean {
        const movedPiece = this.getPiece(from);
        const targetPiece = this.getPiece(to);

        // validity of the moved piece
        if (!movedPiece || movedPiece.colour != this.game.nextToMove)
            return false;


        // update game stats
        this.game.nextToMove = movedPiece.colour == "white" ? "black" : "white";
        this.game.halfMoveClock = targetPiece || movedPiece.name === "p" ? 0 : this.game.halfMoveClock + 1;
        this.game.fullMoveClock = targetPiece ? 0 : this.game.fullMoveClock + 1;


        // Move the piece
        this.game.board[to.row][to.column] = movedPiece;
        this.game.board[from.row][from.column] = undefined;

        return true;
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
                // Can't be king, as otherwise recursion.
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
        if (checkCheck || (this.isPiece(takeLeft) && this.getPiece(takeLeft)?.colour !== pawn.colour)) validMoves.push(takeLeft);
        if (checkCheck || (this.isPiece(takeRight) && this.getPiece(takeRight)?.colour !== pawn.colour)) validMoves.push(takeRight);

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

        return validMoves;
    }


    private isPawnInStartingPosition(location: Position, colour: string): boolean {
        return colour === "white" ? location.row === 6 : location.row === 1;
    }

    private isWithinBounds(location: Position): boolean {
        return location.row >= 0 && location.row < 8 && location.column >= 0 && location.column < 8;
    }


    // Get all of the valid movement options in the given directions
    private getLinearMovementOptions(location: Position, directions: Position[], pieceColour: string, ignoreKing: boolean): Position[] {
        const validMoves: Position[] = [];

        directions.forEach(direction => {
            let currentLocation = location;

            while (true) {
                const nextPosition = addPositions(currentLocation, direction);
                if (!this.isWithinBounds(nextPosition)) break;

                const pieceAtNextPosition = this.getPiece(nextPosition);

                // Friendly?
                if (pieceAtNextPosition?.colour === pieceColour) break;
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

