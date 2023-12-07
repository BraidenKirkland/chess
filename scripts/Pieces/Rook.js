import Piece from "./Piece.js";

export class Rook extends Piece {
    constructor(color, type = "rook") {
        super(color, type);
        this.moves = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        this.limitations = false
    }
}