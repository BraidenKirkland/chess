
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
        this.selectedElement = null;
        
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
                    continue;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    continue;
                }
                theoreticalMoves.push(this.getRegularPosition(newPosition));                
            }   

            for(let i=0; i < killMoves.length; i++){
                newPosition[0] = startingPosition[0] + (piece.color === 'white' ? killMoves[i][0] : -1 * killMoves[i][0]);
                newPosition[1] = startingPosition[1] + (piece.color === 'white' ? killMoves[i][1] : -1 * killMoves[i][1]);
                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    continue;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    continue;
                }
  
                theoreticalMoves.push(this.getRegularPosition(newPosition));  
            }
        }

        return theoreticalMoves;
    }

    validMove(srcSquareId, dstSquareId, piece){

        // Cannot move to the square if it is occupied by a same color piece
        if(this.squares[dstSquareId] != null && this.squares[dstSquareId].color === piece.color){
            return false;
        }

        // The one and only check for the knight has already been passed
        // This is because there is no need to check intermediate squares
        if(piece.pieceType.name === 'knight'){
            return true;
        }

        // Get the numeric id's of the source and destination squares
        let srcSquareNumeric = [Number(this.getNumericPosition(srcSquareId)[0]), Number(this.getNumericPosition(srcSquareId)[1])];
        let dstSquareIdNumeric = [Number(this.getNumericPosition(dstSquareId)[0]), Number(this.getNumericPosition(dstSquareId)[1])];

        // Calculate the horizontal and vertical offsets
        let horizontal = dstSquareIdNumeric[0] - srcSquareNumeric[0];
        let vertical = dstSquareIdNumeric[1] - srcSquareNumeric[1];

        let difference = [horizontal, vertical];
        let verticalCounter = 1, horizontalCounter = 1;

        // Check if destination square is below the current square
        if(vertical < 0){
            verticalCounter = -1;
        }

        // Check if destination square is to the left of the current square
        if(horizontal < 0){
            horizontalCounter = -1;
        }

        // Check if the move is purely horizontal or vertical
        if(vertical === 0){
            verticalCounter = 0;
        }
        if(horizontal === 0){
            horizontalCounter = 0;
        }

        /* 
            Special case for pawns
            If the move has a horizontal component, then it must be a kill move.
            This is only allowed if the destination square is occupied by an enemy piece
         */
        if(piece.pieceType.name === 'pawn' && horizontal !== 0){
            let dstSquare = this.getRegularPosition(dstSquareIdNumeric);
            // The move is not allowd if the destination square has no piece or a piece of the same color
            if(this.squares[dstSquare] === null || this.squares[dstSquare].color === piece.color){
                return false;
            }
            return true;
        }

        if(piece.pieceType.name === 'pawn' && horizontal === 0){
            let dstSquare = this.getRegularPosition(dstSquareIdNumeric);
            // The move is not allowd if the destination square is occupied by a piece of any color
            if(this.squares[dstSquare] !== null){
                return false;
            }
            return true;
        }


        let intermediatePosition = [];
        let intermediateSquare;
        let enemyPiecesOnPath = 0;
        for(let i=1; i < Math.max(Math.abs(vertical), Math.abs(horizontal)); i++){

            intermediatePosition[0] = srcSquareNumeric[0] + horizontalCounter*i;
            intermediatePosition[1] = srcSquareNumeric[1] + verticalCounter*i;
            intermediateSquare = this.getRegularPosition(intermediatePosition);

            if(this.squares[intermediateSquare] == null){
                continue;
            }
            if(this.squares[intermediateSquare].color === piece.color){
                return false;
            }

            // Track how many enemy pieces have been encountered on this path
            // Only the first one encountered can be killed
            if(this.squares[intermediateSquare].color !== piece.color){
                enemyPiecesOnPath++;
            }
        }

        if(enemyPiecesOnPath > 0){
            return false;
        }

        return true;
    }

    getValidMoves(squareId) {
        let currentPiece = this.squares[squareId];
        let theoreticalMoves = this.theoreticalMoves(squareId, currentPiece);
        let validMoves = theoreticalMoves.filter(dstSquareId => this.validMove(squareId, dstSquareId, currentPiece));

        return validMoves;
    }

    /* 
    Method to swap the killing piece with the piece being killed.
    TODO: Remove old highlight from the piece that was killed
    */
    takePiece(killingPiece, victimPiece){
        
        // Get the current square id of each piece
        let victimSquareId = victimPiece.squareId.slice();
        let killingSquareId = killingPiece.squareId.slice();

        // Update squares object to reflect new pieces
        this.squares[victimSquareId] = killingPiece;
        this.squares[killingSquareId] = null;
        
        let dstSquareList = document.getElementsByClassName(victimSquareId);
        let dstSquareTableCell = dstSquareList[0];
        let dstSquareButton = dstSquareList[1];

        let currentSquareList = document.getElementsByClassName(killingSquareId);
        let currentSquareTableCell = currentSquareList[0];
        let currentSquareButton = currentSquareList[1];

        // Update the square id in the button's class
        currentSquareButton.classList.remove(killingSquareId)
        currentSquareButton.classList.add(victimSquareId);

        // TODO: Update id of the button to containing the killing piece
        dstSquareTableCell.replaceChild(currentSquareButton, dstSquareTableCell.childNodes[1]);
        killingPiece.squareId = victimSquareId;

        if(victimPiece.color === 'white'){
            this.whitePiecesKilled.push(victimPiece)
            return;
        }

        this.blackPiecesKilled.push(victimPiece);
    }
}

class Piece {

    constructor(pieceType, color) {
        this.pieceType = pieces.find(piece => piece.name === pieceType);
        this.color = color;
        this.squareId = null;
    }

}

/* 
    Set backgroundColor of 'element' to 'color'
*/
function highlightElement(element, color) {

    element.style.backgroundColor = color;
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

    // add board position to <td> class list
    element.classList.add(letter + number);
    // add board position to <button> class list
    if (element.firstElementChild != null) {
        element.firstElementChild.classList.add(letter + number);
    }
});

const boardPieces = [...document.querySelectorAll(".piece")];

const board = new Board();


// Respond to click events on each button
boardPieces.forEach(button => {
    button.addEventListener('click', (eventObject) => {

        /* 
        The selected element field of the board is used to track what 
        piece was clicked.
        */

        let squareId = eventObject.target.classList[1];
        let clickedPiece = board.getSquares()[squareId];
        clickedPiece.squareId = squareId;
        let parentElementOfButton = document.querySelector("." + squareId);

        // Need to get valid moves of previous (if there was a previous)

        let validMoves = board.getValidMoves(squareId);
        
        // Case 1 - No element currently selected
        if(board.selectedElement === null){
            board.selectedElement = clickedPiece;
            highlightElement(parentElementOfButton, 'yellow');
            validMoves.forEach((square) => {
                let dstSqaure = document.querySelector('.' + square);
                highlightElement(dstSqaure, 'yellow');
            });

        // Case 2 - Clicked on the element already selected
        }else if(squareId === board.selectedElement.squareId){
            highlightElement(parentElementOfButton, null);
            validMoves.forEach((square) => {
                let dstSqaure = document.querySelector('.' + square);
                highlightElement(dstSqaure, null);
            });

            // indicate no element selected
            board.selectedElement = null;

        // Case 3 - An element is already selected and the user clicked on a different element
        }else{

            /* 
                Check if the move is valid
                If the move is valid
                    - move the piece there
                    - remove the highlighting

                How to check if empty squares are clicked? Maybe make them into buttons?
                  If buttons, how to identify them?
            */

            let previousParentElement = document.querySelector("." + board.selectedElement.squareId);
            let validMovesOfPrevious = board.getValidMoves(board.selectedElement.squareId);

            if(validMovesOfPrevious.includes(squareId)){
                
                highlightElement(parentElementOfButton, null);  // BAK
                highlightElement(previousParentElement, null);  // BAK
                board.takePiece(board.selectedElement, clickedPiece);
                
                highlightElement(previousParentElement, null);
                validMovesOfPrevious.forEach((square) => {
                    let dstSqaure = document.querySelector('.' + square);
                    highlightElement(dstSqaure, null);
                });

                board.selectedElement = null;  // BAK
                return;
            }

            // Remove highlighting from the previously clicked element and its valid move squares
            highlightElement(previousParentElement, null);
            validMovesOfPrevious.forEach((square) => {
                let dstSqaure = document.querySelector('.' + square);
                highlightElement(dstSqaure, null);
            });

            if(board.squares[squareId] == null){
                board.selectedElement = null;
                return;
            }

            board.selectedElement = clickedPiece;
            highlightElement(parentElementOfButton, 'yellow');
            validMoves.forEach((square) => {
                let dstSqaure = document.querySelector('.' + square);
                highlightElement(dstSqaure, 'yellow');
            });
        }

        return;

    });
});
