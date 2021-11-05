
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
    killMoves: [[-1, 1], [1, 1]],
    name: 'pawn',
}

const pawnFwdMoves = (moveCount) => {
    if(moveCount > 0){
        return [[0, 1]];
    }

    return [[0, 2], [0, 1]];
};

let pieces = [king, queen, bishop, knight, rook, pawn];

class Board {

    constructor() {

        // arrays to track pieces as they are killed
        this.whitePiecesKilled = [];
        this.blackPiecesKilled = [];
        this.selectedElement = null;
        this.turn = 'white';
        
        /*  
        keep track of each square on the board
        */
        this.squares = {};
        this.createSquares();
        this.addPiecesToBoard();
    }

    changeTurn(){
        this.turn = (this.turn === 'white' ? 'black' : 'white');
        console.log("The turn belongs to " + this.turn);
    }

    getSquares(){
        return this.squares;
    }

    /* 
        Function to initially assign a null value to 
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
            let fwdMoves = pawnFwdMoves(piece.moveCount);
            let killMoves = piece.pieceType.killMoves;
            for(let i=0; i < fwdMoves.length; i++){
                // Reverse direction for black pieces
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
                // Reverse direction for black pieces
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
        if(this.squares[dstSquareId] !== null && this.squares[dstSquareId].color === piece.color){
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

            if(Math.abs(vertical) > 1){
                let intermediatePosition = [];
                intermediatePosition[0] = srcSquareNumeric[0];  // no change
                intermediatePosition[1] = (piece.color === 'white' ? srcSquareNumeric[1] + 1 : srcSquareNumeric[1] - 1);  // check the square directly in front of the pawn
                let intermediateSquare = this.getRegularPosition(intermediatePosition);
                if(this.squares[intermediateSquare] !== null){
                    return false;
                }
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

    /* 
        Check to see if the king belonging to the input value of color is in check
    */
    inCheck(color){

        // If color is white, check all black pieces to see if they can kill the king and vice versa

        // 1. Get the position of the king
        // 2. For each enemy piece
        //     - Does the array of valid moves for that piece contain the king's square?
        //        => Yes - return true
        //    return false

        let kingSquareId;
        let enemyPieces = [];


        for(const [squareId, piece] of Object.entries(this.squares)){

            if(piece === null){
                continue;
            }

            if(piece.color === color && piece.pieceType.name === 'king'){
                kingSquareId = squareId;
                continue;
            }

            if(piece.color !== color){
                piece.squareId = squareId;
                enemyPieces.push(piece);
            }
        }

        let enemyPiece;
        let enemyPieceValidMoves;

        for(let i=0; i < enemyPieces.length; i++){
            enemyPiece = enemyPieces[i];
            enemyPieceValidMoves = this.getValidMoves(enemyPiece.squareId);

            if(enemyPieceValidMoves.includes(kingSquareId)){
                return true;
            }
        }

        return false;
    }

    /* 
        Check if 'color' has been checkmated
    */
    isCheckMate(color){

    }

    /* 
        Check if 'color' has been stalemated
    */

    isStaleMate(color){

    }

    castle(rook, king){

    }

    /* 
    The king is already in check
    Does moving pieceToMove to newPosition remove the check on the king?
    */
    moveRemovesCheck(pieceToMove, newPosition){

        let currentPositionOfPiece = pieceToMove.squareId;
        let piecePresentlyInNewPosition = this.squares[newPosition];

        // Alter the board temporarily
        this.squares[currentPositionOfPiece] = null;
        this.squares[newPosition] = pieceToMove;

        // Perform the swap and run the inCheck function
        let retVal = !this.inCheck(pieceToMove.color);

        // Set the board back to its original state
        this.squares[newPosition] = piecePresentlyInNewPosition;
        this.squares[currentPositionOfPiece] = pieceToMove;


        return retVal;
    }

    /* 
    Check if moving the input piece would result in a check on its color's king
    TODO: The method is currently oversimplified. Need to consider where the piece is going 
          to be moved to because it may kill the piece causing the check
          **** maybe moveRemovesCheck() can handle this ???? ****

        ASSUMES THAT THE MOVE IS VALID
    */
    moveCreatesCheck(pieceToMove, newPosition = null){

        let retVal = false;

        // record the squareId of the piece
        let currentPosition = pieceToMove.squareId;

        // temporarily remove the piece from the board
        this.squares[currentPosition] = null;

        let piecePresentlyInNewPosition = null;

        // When a piece currently occupies the new position
        // Replace it with the piece that is being moved
        if(newPosition !== null  && this.squares[newPosition] !== null){
            piecePresentlyInNewPosition = this.squares[newPosition];
            this.squares[newPosition] = pieceToMove;
        }
       
        // Check if this board arrangement results in a check
        retVal = this.inCheck(pieceToMove.color);

        // Reset the board
        this.squares[currentPosition] = pieceToMove;
        this.squares[newPosition] = piecePresentlyInNewPosition;

        return retVal;  
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

        if(this.moveCreatesCheck(killingPiece, victimSquareId)){
            console.log("Cannot take piece. This moves puts your king into check");
            return;
        }

        if(killingPiece.pieceType.name === 'pawn'){
            killingPiece.moveCount++;
        }

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

        let dstSquareChildToReplace = [];
        let currentSquareChildToReplace = [];

        for(let i=0; i < dstSquareTableCell.childNodes.length; i++){
            if(dstSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE){
                dstSquareChildToReplace.push(dstSquareTableCell.childNodes[i]);
            }
        }

        for(let i=0; i < currentSquareTableCell.childNodes.length; i++){
            if(currentSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE){
                currentSquareChildToReplace.push(currentSquareTableCell.childNodes[i]);
            }
        }

        dstSquareTableCell.replaceChild(currentSquareButton, dstSquareChildToReplace[0]);
        currentSquareTableCell.appendChild(dstSquareButton);

        // Turn the victim piece into an empty button
        dstSquareButton.removeAttribute("id");
        dstSquareButton.classList.remove("piece");
        dstSquareButton.classList.remove(victimSquareId);
        dstSquareButton.classList.add("empty");
        dstSquareButton.classList.add(killingSquareId);
        dstSquareButton.innerHTML = null;

        
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
        // Make a deep copy of each piece - important for determining available moves for pawns
        this.pieceType = Object.assign({}, pieces.find(piece => piece.name === pieceType));
        // this.pieceType = pieces.find(piece => piece.name === pieceType);
        this.color = color;
        this.squareId = null;
        this.moveCount = 0; // Add the move count here so each piece keeps its own separate count (mainly for pawns)
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

const boardPieces = [...document.querySelectorAll(".piece, .empty")];

const board = new Board();


// Respond to click events on each button
boardPieces.forEach(button => {
    button.addEventListener('click', (eventObject) => {
        
        board.inCheck('white');

        /* 
        The selected element field of the board is used to track what 
        piece was clicked.
        */

        let squareId = eventObject.target.classList[1];
        let clickedPiece = board.getSquares()[squareId];
        if(clickedPiece !== null){

            clickedPiece.squareId = squareId;
        }
        let parentElementOfButton = document.querySelector("." + squareId);

        // Need to get valid moves of previous (if there was a previous)

        let validMoves;
        if(clickedPiece !== null){
            validMoves = board.getValidMoves(squareId);
        }else{
            validMoves = [];
        }
        
        // Case 1 - No element currently selected
        if(board.selectedElement === null){
            if(clickedPiece === null){
                return;
            }

            /* 
                Exit without highlighting if it is not that piece's turn
            */
            if(clickedPiece.color !== board.turn){
                return;
            }

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


        // Case 3 - A piece is already selected and the user clicked on an empty square
        }else if(board.squares[squareId] === null){

            // Get previously selected button and valid moves of the previous button
            let previousParentElement = document.querySelector("." + board.selectedElement.squareId);
            let validMovesOfPrevious = board.getValidMoves(board.selectedElement.squareId);

            // Check if currently in check and the move does not remove check
            if(board.inCheck(board.selectedElement.color) && !board.moveRemovesCheck(board.selectedElement, squareId)){
                console.log("You cannot complete this move because it does not remove the check");
                return;
            }
            
            // Check if moving piece creates check on king
            // TODO: Make sure turns are maintained
            if(!board.inCheck(board.selectedElement.color) && board.moveCreatesCheck(board.selectedElement, squareId)){
                console.log("Cannot move piece to empty square. This moves puts your king into check");
                return;
            }

            if(board.selectedElement.pieceType.name === 'pawn'){
                board.selectedElement.moveCount++;
            }

            if(validMovesOfPrevious.includes(squareId)){
                
                highlightElement(parentElementOfButton, null);  // BAK
                highlightElement(previousParentElement, null);  // BAK
                
                highlightElement(previousParentElement, null);
                validMovesOfPrevious.forEach((square) => {
                    let dstSqaure = document.querySelector('.' + square);
                    highlightElement(dstSqaure, null);
                });
            }

                // Determine the square id of the previously clicked piece
                let pieceSquareId = board.selectedElement.squareId.slice();

                // Update the square id of the piece to be the square id of the square it is moving to
                board.selectedElement.squareId = squareId;

                // Get table cell (<td>) and button elements for destination (empty) square
                let dstSquareTableCell = document.getElementsByClassName(squareId)[0];
                let dstSquareButton = document.getElementsByClassName(squareId)[1];

                 // Get table cell (<td>) and button elements for piece square
                let pieceSquareTableCell = document.getElementsByClassName(pieceSquareId)[0];
                let pieceSquareButton = document.getElementsByClassName(pieceSquareId)[1];

                // Need to replace the children of the table cells

                let dstSquareChildToReplace = [];
                let pieceSquareChildToReplace = [];

                // Get the 
                for(let i=0; i < dstSquareTableCell.childNodes.length; i++){
                    if(dstSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE){
                        dstSquareChildToReplace.push(dstSquareTableCell.childNodes[i]);
                    }
                }

                for(let i=0; i < pieceSquareTableCell.childNodes.length; i++){
                    if(pieceSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE){
                        pieceSquareChildToReplace.push(pieceSquareTableCell.childNodes[i]);
                    }
                }

                // Replace the empty square's button with the piece's button
                dstSquareTableCell.replaceChild(pieceSquareButton, dstSquareChildToReplace[0]);
                // Replace the piece's button with the empty square's button
                // The previous operation should have remove the child button from the piece square
                // which it why it is an appendChild and not a replaceChild
                pieceSquareTableCell.appendChild(dstSquareButton);


                // Swap the square ID's of the two buttons
                dstSquareButton.classList.remove(squareId);
                dstSquareButton.classList.add(pieceSquareId);

                pieceSquareButton.classList.remove(pieceSquareId);
                pieceSquareButton.classList.add(squareId);

                // Update the squares object that tracks every square
                board.squares[squareId] = board.squares[pieceSquareId];
                board.squares[pieceSquareId] = null;


                board.selectedElement = null;  // BAK

                // Change the turn - move executed
                board.changeTurn();
                return;

        }
        // Case 4 - An element is already selected and the user clicked on a different element
        else{

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

            
            if(clickedPiece.color !== board.turn && board.selectedElement.color !== board.turn){
                return;
            }
    

            if(validMovesOfPrevious.includes(squareId)){
                
                highlightElement(parentElementOfButton, null);  // BAK
                highlightElement(previousParentElement, null);  // BAK
                board.takePiece(board.selectedElement, clickedPiece);
                
                // Change the turn - piece has been taken
                board.changeTurn();

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
