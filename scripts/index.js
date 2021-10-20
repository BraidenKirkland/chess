
// move format [left-right, up-down]

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
    get fwdMoves() { return this.moveCount === 0 ? [[0, 2], [0, 1]] : [[0, 1]] },
    killMoves: [[-1, 1], [1, 1]],
    name: 'pawn',
    moveCount: 0
}

let pieces = [king, queen, bishop, knight, rook, pawn];

class Board {

    constructor() {

        // arrays to track pieces as they are killed
        this.whitePiecesKilled = [];
        this.blackPiecesKilled = [];
        
        /*  
        keep track of each square on the board
        */
        this.squares = {};
        this.createSquares();
        this.addPiecesToBoard();
    }

    getSquares(){
        return this.squares;
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

    addPiecesToBoard() {
        const allBlackPieces = [...document.querySelectorAll('button[id$="black"]')];
        allBlackPieces.forEach(piece => {

            // Get position of piece from element class
            let position = [...piece.classList][1];
            // Extract piece info from element id
            let pieceType = piece.id.split('-')[0].replace(/\d/g, '');
             // mark this position as occupied by a black piece
            this.squares[position] = new Piece(pieceType, 'black');
        });

        const allWhitePieces = [...document.querySelectorAll('button[id$="white"]')];
        allWhitePieces.forEach(piece => {

            // Get position of piece from element class
            let position = [...piece.classList][1];
            // Extract piece info from element id
            let pieceType = piece.id.split('-')[0].replace(/\d/g, '');
            // mark this position as occupied by a white piece
            this.squares[position] = new Piece(pieceType, 'white'); 
        });
    }

    /* e.g. a1 -> 00 , h8 -> (77) */
    getNumericPosition(regularPosition){
        const letters = 'abcdefgh';
        const numbers = '12345678';

        return String(letters.indexOf(regularPosition[0])) + String(numbers.indexOf(regularPosition[1]));
    }

    /* e.g. 00 -> a1 , 77 -> h8 */
    getRegularPosition(numericPosition){
        const letters = 'abcdefgh';
        const numbers = '12345678';

        return String(letters[Number(numericPosition[0])] + numbers[Number(numericPosition[1])]);
    }

    theoreticalMoves(srcSquareId, piece){
        const theoreticalMoves = [];
        let startingPosition = [Number(this.getNumericPosition(srcSquareId)[0]), Number(this.getNumericPosition(srcSquareId)[1])];
        let newPosition = [];

        let isPawn = piece.pieceType.name === 'pawn';

        for(let i=0; !isPawn && i < piece.pieceType.moves.length; i++){
            for(let j=1; j < 8; j++){
                newPosition[0] = startingPosition[0] + piece.pieceType.moves[i][0] * j;
                newPosition[1] = startingPosition[1] + piece.pieceType.moves[i][1] * j;

                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    break;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    break;
                }
                // theoreticalMoves.push(newPosition.slice());
                theoreticalMoves.push(this.getRegularPosition(newPosition));

                // If there is a limitation (e.g. king) only take the first move (j=1)
                // This works for knights as well because there is only one possible move in each direction
                if (piece.pieceType.limitations) {
                    break;
                }                  
            }
        }

        if(isPawn){
            let fwdMoves = piece.pieceType.fwdMoves;
            let killMoves = piece.pieceType.killMoves;
            for(let i=0; i < fwdMoves.length; i++){
                newPosition[0] = startingPosition[0] + (piece.color === 'white' ? fwdMoves[i][0] : -1 * fwdMoves[i][0]);
                newPosition[1] = startingPosition[1] + (piece.color === 'white' ? fwdMoves[i][1] : -1 * fwdMoves[i][1]);

                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    break;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    break;
                }
                // theoreticalMoves.push(newPosition.slice());
                theoreticalMoves.push(this.getRegularPosition(newPosition));                
            }

            for(let i=0; i < killMoves.length; i++){
                newPosition[0] = startingPosition[0] + (piece.color === 'white' ? killMoves[i][0] : -1 * killMoves[i][0]);
                newPosition[1] = startingPosition[1] + (piece.color === 'white' ? killMoves[i][1] : -1 * killMoves[i][1]);

                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    break;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    break;
                }
                // theoreticalMoves.push(newPosition.slice());
                theoreticalMoves.push(this.getRegularPosition(newPosition));  
            }
        }

        return theoreticalMoves;
    }

    getPath(srcSquareId, dstSquareId, piece){

        if(piece.pieceType.name === 'knight'){
            return true;
        }

        

    }
}

class Piece {

    constructor(pieceType, color) {
        this.pieceType = pieces.find(piece => piece.name === pieceType);
        this.color = color;
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
    button.addEventListener('click', (eventObject) => {

        let squareId = eventObject.target.classList[1];
        let clickedPiece = board.getSquares()[squareId];
        console.log(squareId + ' - ' + clickedPiece.pieceType.name + ' - ' + clickedPiece.color);
        console.log(board.theoreticalMoves(squareId, clickedPiece));
        console.log();
    });
});