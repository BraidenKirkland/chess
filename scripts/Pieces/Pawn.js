import Piece from "./Piece.js";

export class Pawn extends Piece {
    constructor(color, type = "pawn") {
        super(color, type);
        this.moves = [[-1, 1], [1, 1]];  // Kill moves
        this.limitations = true

        // For en Passant
        this.numberOfMostRecentMove = 0;
    }

    getFwdMoves() {
        if (this.moveCount > 0) {
            return [[0, 1]];
        }

        return [[0, 2], [0, 1]];
    }
}