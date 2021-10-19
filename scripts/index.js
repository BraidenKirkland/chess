
// move format [left-right, up-down]


class Board {

    constructor() {
        this.availableWhitePieces = [];
        this.availableBlackPieces = [];
        
        /*  
        keep track of each square on the board
            - key => square name {a1,a2,...,h7}
            - value => 'w' if white, 'b' if black, null if empty
        */
        this.squares = {};
        this.createSquares();
        this.addPieces();
    }

    /* 
        Function to initially sign a null value to 
        every square on the board.
    */
    createSquares(){
        const letters = 'abcdefgh';
        const numbers = '12345678';

        for(let i=0; i < letters.length; i++){
            for(let j=0; j < numbers.length; j++){
                this.squares[letters[i] + numbers[j]] = null;
            }
        }
    }

    addPieces() {
        const allBlackPieces = [...document.querySelectorAll('button[id$="black"]')];
        allBlackPieces.forEach(piece => {

            // Get position of piece from element class
            let position = [...piece.classList][1];
            // Extract piece info from element id
            let pieceType = piece.id.split('-')[0].replace(/\d/g, '');
            this.availableBlackPieces.push(new Piece(position, pieceType, 'black'));
            this.squares[position] = 'b'; // mark this position as occupied by a black piece
        });

        const allWhitePieces = [...document.querySelectorAll('button[id$="white"]')];
        allWhitePieces.forEach(piece => {
            // Get position of piece from element class
            let position = [...piece.classList][1];
            // Extract piece info from element id
            let pieceType = piece.id.split('-')[0].replace(/\d/g, '');
            this.availableWhitePieces.push(new Piece(position, pieceType, 'white'));
            this.squares[position] = 'w'; // mark this position as occupied by a white piece
        });
    }

}


const king = {
    // left, right, up, down, up and right, up and left, down and left, down and right
    moves: [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]],
    limitations: true,
    name: 'king'
}

const queen = {
    moves: [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]],
    limitations: false,
    name: 'queen'
}

const bishop = {
    moves: [[1, 1], [1, -1], [-1, -1], [-1, 1]],
    limitations: false,
    name: 'bishop'
}

const knight = {
    moves: [[-2, 1], [-2, -1], [-1, 2], [-1, -2], [2, 1], [2, -1], [1, 2], [1, -2]],
    limitations: true,
    name: 'knight'
}

const rook = {
    moves: [[-1, 0], [1, 0], [0, 1], [0, -1]],
    limitations: false,
    name: 'rook'
}

const pawn = {
    moves: [[0, 2], [0, 1]],
    killMoves: [[-1, 1], [1, 1]],
    name: 'pawn'
}

let pieces = [king, queen, bishop, knight, rook, pawn];

class Piece {

    constructor(currentPosition, pieceType, color) {
        this.currentPosition = currentPosition;
        this.pieceType = pieces.find(piece => piece.name === pieceType);
        this.color = color;
        this.state = 'alive';
        this.numericPosition = this.getNumericPosition();
        this.transformBlackPawns(pieceType);
        this.availableMoves();
    }

    availableMoves() {

        const possibleMoves = [];
        let startingPosition = [Number(this.numericPosition[0]), Number(this.numericPosition[1])];
        let newPosition = [];
        // need to make exception for knight - limitations might handle it
        for (let i = 0; i < this.pieceType.moves.length; i++) {
            for (let j = 1; j < 8; j++) {
                newPosition[0] = startingPosition[0] + this.pieceType.moves[i][0] * j;
                newPosition[1] = startingPosition[1] + this.pieceType.moves[i][1] * j;

                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    break;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    break;
                }
                possibleMoves.push(newPosition.slice());

                // If there is a limitation (e.g. king) only take the first move (j=1)
                if (this.pieceType.limitations) {
                    break;
                }
            }
        }
        if(this.pieceType.name === 'knight'){
            console.log(`${this.pieceType.name}-${this.color} ${this.currentPosition} (${this.numericPosition})`);
            console.log(possibleMoves);
        }

        return possibleMoves;
    }

    getNumericPosition() {
        const letters = 'abcdefgh';
        const numbers = '12345678';

        return String(letters.indexOf(this.currentPosition[0])) + String(numbers.indexOf(this.currentPosition[1]));
    }

    getDestination(move) {

    }

    isDestinationValid() {

    }

    validMoves() {
        const possibleMoves = this.availableMoves();
        /* 
            Iterate through all possible moves, checking:
                - If there is a piece of the same color on that square
                - Eventually will have to make sure a move does not place the king in check

            * Need a way to access what pieces are occupying each square - maybe a global array of all pieces still alive on the board
        */
    }

    transformBlackPawns(pieceName) {
        if (pieceName === 'pawn' && this.color === 'black') {
            this.pieceType.moves = this.pieceType.moves.map(([a, b]) => [a * -1, b * -1]);
        }
    }

}


// Store all board squares in an array
const boardPositions = [...document.querySelectorAll('td')].reverse();

let letters = 'hgfedcba';
let numbers = '12345678';

// Label each square with its position (as a html class)
let rowIndex = 0;
let letter, number;
boardPositions.forEach((element, index) => {
    letter = letters[index % 8];
    if (index < 8) {
        number = '1';
    } else if (index < 16) {
        number = '2';
    } else if (index < 24) {
        number = '3';
    } else if (index < 32) {
        number = '4';
    } else if (index < 40) {
        number = '5';
    } else if (index < 48) {
        number = '6';
    } else if (index < 56) {
        number = '7';
    } else {
        number = '8';
    }

    element.classList.add(letter + number);
    if (element.firstElementChild != null) {
        element.firstElementChild.classList.add(letter + number);
    }
});

const boardPieces = [...document.querySelectorAll(".piece")];

const board = new Board();


// Respond to click events on each button
boardPieces.forEach(button => {
    button.addEventListener('click', () => {

    });
});