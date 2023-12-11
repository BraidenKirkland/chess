import Piece from "./Piece.js";

export class Pawn extends Piece {
    constructor(color, type = "pawn", limitations = true) {
        super(color, type, limitations);
        this.moves = [[-1, 1], [1, 1]];  // Kill moves
    }

    getFwdMoves() {
        if (this.moveCount > 0) {
            return [[0, 1]];
        }

        return [[0, 2], [0, 1]];
    }
}