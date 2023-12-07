import Piece from "./Piece.js";

export class Knight extends Piece {
    constructor(color, type = "knight") {
        super(color, type);
        this.moves = [[-2, 1], [-2, -1], [-1, 2], [-1, -2], [2, 1], [2, -1], [1, 2], [1, -2]];
        this.limitations = true
    }
}