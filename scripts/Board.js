import { createPiece } from "./Pieces/PieceFactory.js"
import { MoveValidator } from "./MoveValidator.js";
import { 
    highlightElement, 
    addHighlightToElements, 
    removeHighlightFromElements,
    getNumericPosition,
    getRegularPosition
} from "./helpers.js";

import { UIManager } from "./UIManager.js";

const piecesToSymbols = {
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

export class Board {

    constructor() {
        this.moveValidator = new MoveValidator();
        this.uiManager = new UIManager();
        // arrays to track pieces as they are killed
        this.whitePiecesKilled = [];
        this.blackPiecesKilled = [];
        this.selectedElement = null;
        this.turn = 'white';

        // Keep count of how many moves have been made throughout the entire game
        this.numMovesMade = 0;

        /*  
        keep track of each square on the board
        */
        this.squares = {};
        this.createSquares();
        this.addPiecesToBoard();
        this.boardPieces = [...document.querySelectorAll(".piece, .empty")];

        this.addEventListenersForPieces();
    }

    changeTurn() {
        this.turn = (this.turn === 'white' ? 'black' : 'white');
    }

    getSquares() {
        return this.squares;
    }

    /* 
        Function to initially assign a null value to 
        every square on the this.
    */
    createSquares() {
        const letters = 'abcdefgh';
        const numbers = '12345678';

        for (let i = 0; i < letters.length; i++) {
            for (let j = 0; j < numbers.length; j++) {
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
            this.squares[position] = createPiece('black', pieceType);
        });

        const allWhitePieces = [...document.querySelectorAll('button[id$="white"]')];
        allWhitePieces.forEach(piece => {

            // Get position of piece from element class
            let position = [...piece.classList][1];
            // Extract piece info from element id
            let pieceType = piece.id.split('-')[0].replace(/\d/g, '');
            // mark this position as occupied by a white piece
            this.squares[position] = createPiece('white', pieceType);
        });
    }

    castle(rook, king) {
        if (!this.moveValidator.castlingAllowed(rook, king, this.squares, this.numMovesMade)) {
            return;
        }

        let kingNumericPosition = getNumericPosition(king.squareId);
        let horizontalOffset = kingNumericPosition[0] - getNumericPosition(rook.squareId)[0];
        let kingMovementUnits = horizontalOffset > 0 ? -2 : 2;
        let rookUnitsRelativeToKing = horizontalOffset > 0 ? 1 : -1;

        // Calculate new positions for king and rook
        kingNumericPosition[0] += kingMovementUnits;
        let newKingPosition = getRegularPosition(kingNumericPosition);
        let newRookPosition = getRegularPosition([kingNumericPosition[0] + rookUnitsRelativeToKing, kingNumericPosition[1]]);

        // Move king and rook to new positions
        this.movePieceToEmpty(king, newKingPosition, true);
        this.movePieceToEmpty(rook, newRookPosition, true);
        this.changeTurn();
    }


    enPassantTake(takingPawn, diagonalSquare) {

        let takenPieceIcon = document.createElement('span');
        let colorTaken = takingPawn.color === 'black' ? 'white' : 'black';
        takenPieceIcon.innerHTML = piecesToSymbols['pawn'][colorTaken];

        let neighborSquare;
        if (takingPawn.color === 'white') {
            neighborSquare = diagonalSquare[0] + String((Number(diagonalSquare[1]) - 1));
            document.getElementsByClassName('taken-pieces-black-list')[0].appendChild(takenPieceIcon);
        } else {
            neighborSquare = diagonalSquare[0] + String((Number(diagonalSquare[1]) + 1));
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        }

        this.movePieceToEmpty(takingPawn, diagonalSquare);

        // Get <td> and <button> of pawn to be removed
        let takenTableCell = document.getElementsByClassName(neighborSquare)[0];
        let takenButton = document.getElementsByClassName(neighborSquare)[1];

        takenButton.classList.add("empty");
        takenButton.classList.remove("piece");
        takenButton.removeAttribute("id");
        takenButton.innerHTML = null;

        this.squares[neighborSquare] = null;
    }

    movePieceToEmpty(pieceToMove, newPosition, castling = false) {

        // Make a copy using slice()
        let squareIdofPiece = pieceToMove.squareId.slice();

        // TODO: Check the list of valid moves
        let validMoves = this.moveValidator.getValidMoves(squareIdofPiece, this.squares, this.numMovesMade);

        if (!validMoves.includes(newPosition) && !castling) {
            return;
        }

        // Get table cell (<td>) and button elements for destination (empty) square
        let dstSquareTableCell = document.getElementsByClassName(newPosition)[0];
        let dstSquareButton = document.getElementsByClassName(newPosition)[1];

        // Get table cell (<td>) and button elements for piece square
        let pieceSquareTableCell = document.getElementsByClassName(squareIdofPiece)[0];
        let pieceSquareButton = document.getElementsByClassName(squareIdofPiece)[1];

        // Need to replace the children of the table cells

        let dstSquareChildToReplace = [];
        let pieceSquareChildToReplace = [];

        for (let i = 0; i < dstSquareTableCell.childNodes.length; i++) {
            if (dstSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                dstSquareChildToReplace.push(dstSquareTableCell.childNodes[i]);
            }
        }

        // Replace the empty square's button with the piece's button
        dstSquareTableCell.replaceChild(pieceSquareButton, dstSquareChildToReplace[0]);
        pieceSquareTableCell.appendChild(dstSquareButton);

        // Update the class list of the destination square button
        dstSquareButton.classList.add(squareIdofPiece);
        dstSquareButton.classList.remove(newPosition);

        // Update the class list of the piece square button
        pieceSquareButton.classList.add(newPosition);
        pieceSquareButton.classList.remove(squareIdofPiece);

        // Update the squares object
        this.squares[newPosition] = pieceToMove;
        pieceToMove.squareId = newPosition;
        this.squares[squareIdofPiece] = null;

        this.selectedElement = null;

        pieceToMove.moveCount++;
        this.numMovesMade++;
        pieceToMove.numberOfMostRecentMove = this.numMovesMade;

        // TODO: Need to determine if the pawn moved two squares forward or one square forward
        if (pieceToMove.type === 'pawn') {

            let verticalDistance = Math.abs(Number(newPosition[1]) - Number(squareIdofPiece[1]));
            pieceToMove.ranksAdvanced += verticalDistance;

            if (pieceToMove.canPromote()) {
                pieceToMove.promote();
            }

        }

        // TODO: Check for pawn promotion


        this.changeTurn();
    }

    /* 
    Method to swap the killing piece with the piece being killed.
    TODO: Remove old highlight from the piece that was killed
    */
    takePiece(killingPiece, victimPiece) {

        // Get the current square id of each piece
        let victimSquareId = victimPiece.squareId.slice();
        let killingSquareId = killingPiece.squareId.slice();

        if (this.moveValidator.moveCreatesCheck(killingPiece, this.squares, victimSquareId, this.numMovesMade)) {
            return;
        }

        if (killingPiece.type === 'pawn') {
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

        for (let i = 0; i < dstSquareTableCell.childNodes.length; i++) {
            if (dstSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                dstSquareChildToReplace.push(dstSquareTableCell.childNodes[i]);
            }
        }

        for (let i = 0; i < currentSquareTableCell.childNodes.length; i++) {
            if (currentSquareTableCell.childNodes[i].nodeType === Node.ELEMENT_NODE) {
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

        let takenPieceIcon = document.createElement('span');
        takenPieceIcon.innerHTML = piecesToSymbols[victimPiece.type][victimPiece.color];

        if (victimPiece.color === 'white') {
    
            this.whitePiecesKilled.push(victimPiece)
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        } else {
            this.blackPiecesKilled.push(victimPiece);
            document.getElementsByClassName('taken-pieces-black-list')[0].appendChild(takenPieceIcon);
        }

        this.numMovesMade++;
        killingPiece.numberOfMostRecentMove = this.numMovesMade;
        killingPiece.killCount++;
        killingPiece.moveCount++;

        if (killingPiece.type === 'pawn') {
            killingPiece.ranksAdvanced++;

            if (killingPiece.canPromote()) {
                killingPiece.promote();
            }
        }
    }

    addEventListenersForPieces() {
        // Respond to click events on each button
        this.boardPieces.forEach(button => {
            button.addEventListener('click', (eventObject) => {
                eventObject.stopPropagation();
                
                if (this.moveValidator.isCheckMate(this.turn, this.squares, this.numMovesMade)) {
                    return;
                }

                if (this.moveValidator.isStaleMate(this.turn, this.squares, this.numMovesMade)) {
                    return;
                }

                // Get ID of the clicked square
                let squareId = eventObject.target.classList[1];

                // Determine if the square clicked contains a piece
                let clickedPiece = this.getSquares()[squareId];
                if (clickedPiece !== null) {
                    clickedPiece.squareId = squareId;
                }


                // This is the <td> which is the parent of the button that was clicked
                let parentElementOfButton = document.querySelector("." + squareId);

                // Need to get valid moves of previous (if there was a previous)

                // Get validMoves of the clicked piece, if it was a piece
                let validMoves = [];
                if (clickedPiece !== null) {
                    validMoves = this.moveValidator.getValidMoves(squareId, this.squares, this.numMovesMade);
                }

                if (clickedPiece && this.moveValidator.inCheck(clickedPiece.color, this.squares, this.numMovesMade)) {
                    validMoves = validMoves.filter(move => this.moveValidator.moveRemovesCheck(clickedPiece, move, this.squares, this.numMovesMade));
                } else if (clickedPiece && !this.moveValidator.inCheck(clickedPiece.color, this.squares, this.numMovesMade)) {
                    validMoves = validMoves.filter(move => !this.moveValidator.moveCreatesCheck(clickedPiece, this.squares, move, this.numMovesMade));
                }

                // Case 1 - No element currently selected
                if (this.selectedElement === null) {
                    this.handleNoPieceSelected(clickedPiece, parentElementOfButton, validMoves);

                    // Case 2 - User clicked on the element already selected
                } else if (squareId === this.selectedElement.squareId) {
                    this.handleClickOnSelectedPiece(parentElementOfButton, validMoves)

                    // Case 3 - A piece is already selected and the user clicked on an empty square
                } else if (this.squares[squareId] === null) {
                    this.handleClickOnEmptySquare(parentElementOfButton, squareId) 
                }

                // Case 4 - An element is already selected and the user clicked on a different element
                else {
                    this.handleClickOnDifferentPiece(clickedPiece, squareId, parentElementOfButton, validMoves)
                }
            });
        });
    }

    handleNoPieceSelected(clickedPiece, parentElementOfButton, validMoves) {
        // No element was currently selected and an empty square was clicked on
        if (clickedPiece === null) {
            return;
        }

        // Exit without highlighting if it is not that piece's turn
        if (clickedPiece.color !== this.turn) {
            return;
        }

        // Store the piece that was clicked on (to be used next click)
        this.selectedElement = clickedPiece;

        // Highlight square of clicked piece and its valid moves
        highlightElement(parentElementOfButton, 'pink');
        addHighlightToElements(validMoves);
    }

    handleClickOnSelectedPiece(parentElementOfButton, validMoves) {
        // Remove highlighting
        highlightElement(parentElementOfButton, null);
        removeHighlightFromElements(validMoves);

        // indicate no element selected
        this.selectedElement = null;
    }

    handleClickOnEmptySquare(parentElementOfButton, squareId) {
        // Get previously selected button and valid moves of the previous button
        let previousParentElement = document.querySelector("." + this.selectedElement.squareId);
        let validMovesOfPrevious = this.moveValidator.getValidMoves(this.selectedElement.squareId, this.squares, this.numMovesMade);

        // Check if currently in check and if the move does not remove check
        if (this.moveValidator.inCheck(this.selectedElement.color, this.squares, this.numMovesMade) && !this.moveValidator.moveRemovesCheck(this.selectedElement, squareId, this.squares, this.numMovesMade)) {
            return;
        }

        // Check if moving piece creates check on king
        // TODO: Make sure turns are maintained
        if (!this.moveValidator.inCheck(this.selectedElement.color, this.squares, this.numMovesMade) && this.moveValidator.moveCreatesCheck(this.selectedElement, this.squares, squareId, this.numMovesMade)) {
            return;
        }

        // TODO: Possible check en Passant here??

        // If the move is valid, remove highlighting
        if (validMovesOfPrevious.includes(squareId)) {
            highlightElement(parentElementOfButton, null);
            highlightElement(previousParentElement, null);
            removeHighlightFromElements(validMovesOfPrevious);
        }

        // Move the piece to the empty square

        // Perform en Passant if it is allowed
        if (this.selectedElement.type === 'pawn' && this.moveValidator.enPassantAllowed(this.selectedElement, squareId, this.squares, this.numMovesMade)) {
            this.enPassantTake(this.selectedElement, squareId);
        } else {
            this.movePieceToEmpty(this.selectedElement, squareId);
        }

        return;
    }

    handleClickOnDifferentPiece(clickedPiece, squareId, parentElementOfButton, validMoves) {
        /* 
                        Check if the move is valid
                        If the move is valid
                            - move the piece there
                            - remove the highlighting
                    */
        let previousParentElement = document.querySelector("." + this.selectedElement.squareId);

        // Get the valid moves of the previously clicked element
        let validMovesOfPrevious = this.moveValidator.getValidMoves(this.selectedElement.squareId, this.squares, this.numMovesMade);

        // TODO: Possibly remove this?? -> not sure if this condition is even possible
        if (this.selectedElement.color !== this.turn) {
            return;
        }

        // Check if the user indicated they wanted to castle and if so perform the castle

        let clickedPieceType = clickedPiece.type;
        let previousPieceType = this.selectedElement.type;
        let castlingPieces = ['rook', 'king'];
        if (castlingPieces.includes(clickedPieceType) && castlingPieces.includes(previousPieceType)) {
            if (this.moveValidator.inCheck(clickedPiece.color, this.squares, this.numMovesMade)) {
                return;
            }
            if (previousPieceType !== clickedPieceType) {
                if (previousPieceType === 'rook') {
                    this.castle(this.selectedElement, clickedPiece);
                } else {
                    this.castle(clickedPiece, this.selectedElement);
                }
            }

            // Remove highlighting
            highlightElement(previousParentElement, null);
            removeHighlightFromElements(validMovesOfPrevious);

            return;
        }

        if (validMovesOfPrevious.includes(squareId)) {

            highlightElement(parentElementOfButton, null);  // BAK
            this.takePiece(this.selectedElement, clickedPiece);

            // Change the turn - piece has been taken
            // TODO: Confirm that a piece has actually been taken before calling this function
            this.changeTurn();

            highlightElement(previousParentElement, null);
            removeHighlightFromElements(validMovesOfPrevious);

            this.selectedElement = null;  // BAK
            return;
        }

        // Clicked on the opposing color's piece that is not in a position to be taken
        if (clickedPiece.color !== this.turn) {
            return;
        }

        // Remove highlighting from the previously clicked element and its valid move squares
        highlightElement(previousParentElement, null);
        removeHighlightFromElements(validMovesOfPrevious);

        if (this.squares[squareId] == null) {
            this.selectedElement = null;
            return;
        }

        this.selectedElement = clickedPiece;

        highlightElement(parentElementOfButton, 'yellow');
        addHighlightToElements(validMoves);
    }
}
