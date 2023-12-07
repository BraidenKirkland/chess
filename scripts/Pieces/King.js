import Piece from "./Piece.js";

export class King extends Piece {
    constructor(color, type="king") {
        super(color, type);
        this.moves = [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
        this.limitations = true
    }
}