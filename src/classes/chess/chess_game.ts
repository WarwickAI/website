import { MovementEngine } from "./movement_engine";
import { Piece, PieceType } from "./piece";


export class ChessGame {
    public blackCastleKingside: boolean = false;
    public blackCastleQueenside: boolean = false;
    public whiteCastleKingside: boolean = false;
    public whiteCastleQueenside: boolean = false;
    public nextToMove: string | undefined;

    public enPassantTarget: string | undefined;
    public halfMoveClock: number = NaN;
    public fullMoveClock: number = NaN;

    public validPosition: boolean = true;

    public board: (Piece | undefined)[][] = [[]];  // [Row][Column]
    public movementEngine: MovementEngine;


    constructor(fenString: string) {
        this.validPosition = this.digestFen(fenString);

        this.movementEngine = new MovementEngine(this);
    }


    // To FEN
    public toFEN(): string {
        let FEN = "";

        // Section 1: Board
        for (let y = 0; y < this.board.length; y++) {
            let blankCounter = 0;
            for (let x = 0; x < this.board[y].length; x++) {
                let piece: Piece | undefined = this.board[y][x];

                // Blank space
                if (piece === undefined) {
                    blankCounter++;
                    continue;
                }

                // Blank space has ended
                if (blankCounter > 0) {
                    FEN += blankCounter.toString();
                    blankCounter = 0;
                }

                const pieceKey = piece.name;

                // Add piece to FEN
                FEN += piece.colour === "white" ? pieceKey.toUpperCase() : pieceKey.toLowerCase();
            }

            // Add any extra blanks
            if (blankCounter > 0) {
                FEN += blankCounter.toString();
                blankCounter = 0;
            }
            FEN += "/";
        }

        // Section 2.
        FEN += " ";
        FEN += this.nextToMove === "black" ? "b" : "w";     // This is reversed to default to white's move

        // Section 3. (Ugly, I am sorry)
        FEN += " ";
        FEN += this.blackCastleKingside ? "k" : "";
        FEN += this.blackCastleQueenside ? "q" : "";
        FEN += this.whiteCastleKingside ? "K" : "";
        FEN += this.whiteCastleQueenside ? "Q" : "";

        // Section 4
        FEN += " ";
        FEN += this.enPassantTarget === undefined ? "-" : this.enPassantTarget;

        // Section 5 & 6
        FEN += " ";
        FEN += `${this.halfMoveClock} ${this.fullMoveClock}`;
        return FEN;
    }


    // Digest the FEN string
    private digestFen(fenString: string): boolean {
        var fields = fenString.split(' ');
        if (fields.length != 6) return false;

        // Reset vars
        this.board = [[]];

        // Section 1: The board
        var boardFen: string = fields[0];
        var row = 0;
        for (let i = 0; i < boardFen.length; i++) {
            let letter = boardFen[i];

            // New row
            if (letter === '/') {
                row++;
                this.board.push([]);
                continue;
            }

            // Otherwise...
            this.digestBoardLetter(letter, row);
        }

        // Section 2: next to move
        this.nextToMove = fields[1] === "w" ? "white" : "black";

        // Section 3: Castle Availablilty
        this.blackCastleKingside = fields[2].includes("k");
        this.blackCastleQueenside = fields[2].includes("q");
        this.whiteCastleKingside = fields[2].includes("K");
        this.whiteCastleQueenside = fields[2].includes("Q");

        // Section 4: Enpassant target square - remain as undefined if nothing
        if (fields[3] !== "-")
            this.enPassantTarget = fields[3];

        // Section 5: halfmove clock
        this.halfMoveClock = +fields[4];

        // Section 6: fullmove Clock
        this.fullMoveClock = +fields[5];

        return true;
    }


    // Digest a single letter when creating the board
    private digestBoardLetter(letter: string, row: number) {
        const colour = letter.toUpperCase() === letter ? "white" : "black";

        const pieceType: PieceType = letter.toLowerCase() as PieceType;

        // Can't compare it to the type interface directly :(.
        if (["p", "r", "n", "b", "q", "k"].includes(pieceType))
            return this.board[row].push(new Piece(pieceType, colour));


        // Check if number
        let blank = +letter;
        if (isNaN(blank)) return;

        for (let i = 0; i < blank; i++)
            this.board[row].push(undefined);
    }
}
