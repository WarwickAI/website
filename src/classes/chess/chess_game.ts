import { Piece } from "./piece";

export class ChessGame {
    public blackCastleKingside: boolean = false;
    public blackCastleQueenside: boolean = false;
    public whiteCastleKingside: boolean = false;
    public whiteCastleQueenside: boolean = false;
    public nextToMove: string | undefined;

    public enPassantTarget: string | undefined;
    public halfMoveClock: number = NaN;
    public fullMoveClock: number = NaN;

    public board: (Piece | undefined)[][] = [[]];  // [Row][Column]

    constructor(fenString: string) {
        console.log(`Digesting ${fenString}`);
        this.digestFen(fenString);
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
        let colour = letter.toUpperCase() === letter ? "white" : "black";

        switch (letter.toLowerCase()) {
            // Pawn
            case "p":
                return this.board[row].push(new Piece("pawn", colour))

            // Rook
            case "r":
                return this.board[row].push(new Piece("rook", colour))

            // Knight
            case "n":
                return this.board[row].push(new Piece("knight", colour))

            // Bishop
            case "b":
                return this.board[row].push(new Piece("bishop", colour))

            // Queen
            case "q":
                return this.board[row].push(new Piece("queen", colour))

            // King
            case "k":
                return this.board[row].push(new Piece("king", colour))

            // Number? (Blanks)
            default:
                let blank = +letter;
                if (isNaN(blank)) return;

                for (let i = 0; i < blank; i++)
                    this.board[row].push(undefined);
                break;
        }
    }
}
