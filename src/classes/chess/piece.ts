// A single chess piece

export type PieceColour = "white" | "black";
export type PieceType = "p" | "r" | "n" | "b" | "q" | "k";


export class Piece {
    name: PieceType;
    colour: PieceColour;

    constructor(name: PieceType, colour: PieceColour) {
        this.name = name;
        this.colour = colour;
    }
}
