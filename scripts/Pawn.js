import Piece from "./Piece.js";

export class Pawn extends Piece {
    constructor(color, type = "pawn") {
        super(color, type);
        this.moves = [[-1, 1], [1, 1]];  // Kill moves
        this.limitations = true

        // For en Passant
        this.firstMoveRank = 0;
        this.numberOfMostRecentMove = 0;

        // For en passant, this number must be exactly three for the capturing pawn
        // If this number === 6 for pawns, they can be promoted
        this.ranksAdvanced = 0;

        this.killCount = 0;
    }

    getFwdMoves() {
        if (this.moveCount > 0) {
            return [[0, 1]];
        }

        return [[0, 2], [0, 1]];
    }
}