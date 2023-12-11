import Piece from "./Piece.js";

export class Rook extends Piece {
    constructor(color, type = "rook", limitations = false) {
        super(color, type, limitations);
        this.moves = [[-1, 0], [1, 0], [0, 1], [0, -1]];
    }
}