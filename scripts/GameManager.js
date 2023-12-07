import {Board} from './Board.js';
import { MoveValidator } from './MoveValidator.js';

export class GameManager {
    constructor() {
        this.board = new Board();
        this.moveValidator = new MoveValidator();
        this.turn = "white";
    }
}