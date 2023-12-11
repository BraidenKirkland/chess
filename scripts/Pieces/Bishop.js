import Piece from "./Piece.js";

export class Bishop extends Piece {
    constructor(color, type = "bishop", limitations = false) {
        super(color, type, limitations);
        this.moves = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    }
}