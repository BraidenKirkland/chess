// Piece.js
export default class Piece {
    constructor(color, type) {
        this.color = color;
        this.type = type;
        this.position = null;
        this.moveCount = 0;
    }
    
    getSymbol() {
        const symbols = {
            'pawn': {
                'white': '&#9817',
                'black': '&#9823'
            },
            'bishop': {
                'white': '&#9815',
                'black': '&#9821'
            },
            'knight': {
                'white': '&#9816',
                'black': '&#9822'
            },
            'queen': {
                'white': '&#9813',
                'black': '&#9819'
            },
            'king': {
                'white': '&#9812',
                'black': '&#9818'
            },
            'rook': {
                'white': '&#9814',
                'black': '&#9820'
            }
        };

        return symbols[this.type][this.color];
    }
}

// class Piece {

//     constructor(pieceType, color) {
//         // Make a deep copy of each piece - important for determining available moves for pawns
//         this.pieceType = Object.assign({}, pieces.find(piece => piece.name === pieceType));
//         // this.pieceType = pieces.find(piece => piece.name === pieceType);
//         this.color = color;
//         this.squareId = null;
//         this.moveCount = 0; // Add the move count here so each piece keeps its own separate count
        
//         // To track if the pawn moved one or two squares on its first move (for en passant)
//         this.firstMoveRank = 0;

//         // For en passant
//         this.numberOfMostRecentMove = 0;

//         // For en passant, this number must be exactly three for the capturing pawn
//         // If this number === 6 for pawns, they can be promoted
//         this.ranksAdvanced = 0;

//         this.killCount = 0;
//     }

// }