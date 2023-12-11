import {King} from './King.js';
import { Queen } from './Queen.js';
import { Knight } from './Knight.js';
import { Bishop } from './Bishop.js';
import { Rook } from './Rook.js';
import { Pawn } from './Pawn.js';

export function createPiece(color, type) {
    switch (type.toLowerCase()) {
        case 'king':
            return new King(color);
        case 'queen':
            return new Queen(color)
        case 'rook':
            return new Rook(color);
        case 'pawn':
            return new Pawn(color)
        case 'bishop':
            return new Bishop(color);
        case 'knight':
            return new Knight(color)
        default:
            throw new Error(`Unknown piece type: ${type}`);
    }
}