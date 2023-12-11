import Piece from "./Piece.js";

export class King extends Piece {
    constructor(color, type="king", limitations = true) {
        super(color, type, limitations);
        this.moves = [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
    }
}