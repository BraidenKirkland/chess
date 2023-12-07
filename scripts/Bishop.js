import Piece from "./Piece.js";

export class Bishop extends Piece {
    constructor(color, type = "bishop") {
        super(color, type);
        this.moves = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
        this.limitations = false
    }
}