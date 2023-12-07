import Piece from "./Piece.js";

export class Queen extends Piece {
    constructor(color, type = "queen") {
        super(color, type);
        this.moves = [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
        this.limitations = false
    }
}