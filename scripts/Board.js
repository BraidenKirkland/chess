import { createPiece } from "./Pieces/PieceFactory.js"
import { MoveValidator } from "./MoveValidator.js";
import { getNumericPosition, getRegularPosition } from "./helpers.js";
import { UIManager } from "./UIManager.js";

export class Board {

    constructor() {
        this.moveValidator = new MoveValidator();
        this.uiManager = new UIManager();
        this.uiManager.setupEventListeners(this.handleButtonClick.bind(this));
        this.uiManager.setupPromotionEventListeners(this.handlePromotionSelection.bind(this));

        // arrays to track pieces as they are killed
        this.whitePiecesKilled = [];
        this.blackPiecesKilled = [];
        this.selectedElement = null;
        this.turn = 'white';

        // Keep count of how many moves have been made throughout the entire game
        this.numMovesMade = 0;

        // Keep track of each square on the board
        this.squares = {};
        this.initializeBoard();
    }

    changeTurn() {
        this.turn = (this.turn === 'white' ? 'black' : 'white');
    }

    initializeBoard() {
        this.initializeBoardSquares();
        this.addPiecesToBoard();
    }

    // Function to initially assign a null value to every square on the board.
    initializeBoardSquares() {
        const letters = 'abcdefgh';
        const numbers = '12345678';

        for (const letter of letters) {
            for (const number of numbers) {
                this.squares[letter + number] = null;
            }
        }
    }

    addPiecesToBoard() {
        this.addPiecesOfColor('black');
        this.addPiecesOfColor('white');
    }

    addPiecesOfColor(color) {
        const allPieces = [...document.querySelectorAll(`button[id$="${color}"]`)];
        allPieces.forEach(piece => {
            this.addPiece(piece, color);
        });
    }

    addPiece(pieceElement, color) {
        const position = [...pieceElement.classList][1];
        const pieceType = pieceElement.id.split('-')[0].replace(/\d/g, '');
        this.squares[position] = createPiece(color, pieceType);
    }

    castle(rook, king) {
        if (!this.moveValidator.castlingAllowed(rook, king, this.squares, this.numMovesMade)) {
            this.selectedElement = null;
            return;
        }

        const [newKingPosition, newRookPosition] = this.getNewKingAndRookPositions(rook, king);

        // Move king and rook to new positions
        this.movePieceToEmpty(king, newKingPosition, true);
        this.movePieceToEmpty(rook, newRookPosition, true);
        this.changeTurn();
    }

    getNewKingAndRookPositions(rook, king) {
        const kingNumericPosition = getNumericPosition(king.squareId);
        const horizontalOffset = kingNumericPosition[0] - getNumericPosition(rook.squareId)[0];
        const kingMovementUnits = horizontalOffset > 0 ? -2 : 2;
        const rookUnitsRelativeToKing = horizontalOffset > 0 ? 1 : -1;

        // Calculate new positions for king and rook
        kingNumericPosition[0] += kingMovementUnits;
        const newKingPosition = getRegularPosition(kingNumericPosition);
        const newRookPosition = getRegularPosition([kingNumericPosition[0] + rookUnitsRelativeToKing, kingNumericPosition[1]]);

        return [newKingPosition, newRookPosition];
    }

    enPassantTake(takingPawn, diagonalSquare) {
        const neighborSquare = this.getNeighborSquareForEnPassant(takingPawn, diagonalSquare);
        this.movePieceToEmpty(takingPawn, diagonalSquare);
        this.squares[neighborSquare] = null;
        this.uiManager.updateBoardAfterEnPassantTake(takingPawn, neighborSquare);
    }

    getNeighborSquareForEnPassant(takingPawn, diagonalSquare) {
        if (takingPawn.color === 'white') {
            return diagonalSquare[0] + String((Number(diagonalSquare[1]) - 1));
        }

        return diagonalSquare[0] + String((Number(diagonalSquare[1]) + 1));
    }


    movePieceToEmpty(pieceToMove, newPosition, castling = false) {
        const squareIdofPiece = pieceToMove.squareId.slice();

        this.uiManager.updateSquareAfterMoveToEmptySquare(newPosition, squareIdofPiece);
        this.squares[newPosition] = pieceToMove;
        this.squares[squareIdofPiece] = null;
        this.numMovesMade++;
        this.selectedElement = null;

        pieceToMove.squareId = newPosition;
        pieceToMove.moveCount++;
        pieceToMove.numberOfMostRecentMove = this.numMovesMade;

        this.handlePromotion(pieceToMove, newPosition, squareIdofPiece);
        this.changeTurn();
    }

    handlePromotion(pieceToMove, newPosition, squareIdofPiece) {
        if (pieceToMove.type === 'pawn') {
            const verticalDistance = Math.abs(Number(newPosition[1]) - Number(squareIdofPiece[1]));
            pieceToMove.ranksAdvanced += verticalDistance;

            if (pieceToMove.canPromote()) {
                this.uiManager.showPromotionMenu(pieceToMove.color)
            }
        }
    }

    /* 
    Method to swap the killing piece with the piece being killed.
    */
    takePiece(killingPiece, victimPiece) {
        // Get the current square id of each piece
        const victimSquareId = victimPiece.squareId.slice();
        const killingSquareId = killingPiece.squareId.slice();

        this.numMovesMade++;
        this.squares[victimSquareId] = killingPiece;
        this.squares[killingSquareId] = null;
        killingPiece.squareId = victimSquareId;
        killingPiece.numberOfMostRecentMove = this.numMovesMade;
        killingPiece.killCount++;
        killingPiece.moveCount++;
        killingPiece.ranksAdvanced++;

        this.uiManager.updateBoardAfterTake(victimSquareId, killingSquareId);
        this.uiManager.displayTakenPiece(victimPiece, this.whitePiecesKilled, this.blackPiecesKilled);

        if (killingPiece.canPromote()) {
            this.uiManager.showPromotionMenu(killingPiece.color)
        }

        this.changeTurn();

        return true
    }

    handleButtonClick(eventObject) {
        eventObject.stopPropagation();

        const squareId = this.getClickedSquareId(eventObject);
        const clickedPiece = this.getClickedPiece(squareId);
        const parentElementOfButton = this.uiManager.getParentElementOfButton(squareId);
        const validMoves = this.getValidMovesForPiece(clickedPiece, squareId);

        this.processClickActions(clickedPiece, squareId, parentElementOfButton, validMoves);

        const [checkmate, stalemate] = this.checkMateOrStaleMate();

        if(checkmate || stalemate) {
            const winningColor = this.moveValidator.opposingColor(this.turn);
            this.uiManager.showGameOverMenu(winningColor, checkmate);
        }
    }

    checkMateOrStaleMate() {
        const checkmate = this.moveValidator.isCheckMate(this.turn, this.squares, this.numMovesMade);
        const stalemate = this.moveValidator.isStaleMate(this.turn, this.squares, this.numMovesMade);

        return [checkmate, stalemate];
    }

    isGameOver() {
        return this.moveValidator.isCheckMate(this.turn, this.squares, this.numMovesMade) 
        || this.moveValidator.isStaleMate(this.turn, this.squares, this.numMovesMade);
    }

    getClickedSquareId(eventObject) {
        return eventObject.target.classList[1];
    }

    getClickedPiece(squareId) {
        const clickedPiece = this.squares[squareId];
        if (clickedPiece !== null) {
            clickedPiece.squareId = squareId;
        }
        return clickedPiece;
    }

    getValidMovesForPiece(clickedPiece, squareId) {
        if (!clickedPiece) {
            return [];
        }

        return this.moveValidator.getValidMoves(squareId, this.squares, this.numMovesMade);
    }

    processClickActions(clickedPiece, squareId, parentElementOfButton, validMoves) {
        if (this.selectedElement === null) {
            this.handleNoPieceSelected(clickedPiece, parentElementOfButton, validMoves);
        } else if (squareId === this.selectedElement.squareId) {
            this.handleClickOnSelectedPiece(parentElementOfButton, validMoves);
        } else if (this.squares[squareId] === null) {
            this.handleClickOnEmptySquare(parentElementOfButton, squareId);
        } else {
            this.handleClickOnDifferentPiece(clickedPiece, squareId, parentElementOfButton, validMoves);
        }
    }

    handleNoPieceSelected(clickedPiece, parentElementOfButton, validMoves) {
        // No element was currently selected and an empty square was clicked on
        if (! clickedPiece) {
            return;
        }

        // Exit without highlighting if it is not that piece's turn
        if (clickedPiece.color !== this.turn) {
            return;
        }

        // Store the piece that was clicked on (to be used next click)
        this.selectedElement = clickedPiece;

        // Highlight square of clicked piece and its valid moves
        this.uiManager.showHighlightingForClickedPieceAndMoves(parentElementOfButton, 'pink', validMoves);
    }

    handleClickOnSelectedPiece(parentElementOfButton, validMoves) {
        // Remove highlighting
        this.uiManager.removeHighlightForPiece(parentElementOfButton, validMoves);

        // indicate no element selected
        this.selectedElement = null;
    }

    handleClickOnEmptySquare(parentElementOfButton, squareId) {
        // Get previously selected button and valid moves of the previous button
        const previousParentElement = document.querySelector("." + this.selectedElement.squareId);
        const validMovesOfPrevious = this.moveValidator.getValidMoves(this.selectedElement.squareId, this.squares, this.numMovesMade);

        // If the move is valid, remove highlighting
        if (! validMovesOfPrevious.includes(squareId)) {
            return;
        }

        this.uiManager.removeHighlightingWhenMovingPieceToEmptySquare(parentElementOfButton, previousParentElement, validMovesOfPrevious);

        // Perform en Passant if it is allowed
        if (this.selectedElement.type === 'pawn' && this.moveValidator.enPassantAllowed(this.selectedElement, squareId, this.squares, this.numMovesMade)) {
            this.enPassantTake(this.selectedElement, squareId);
        } else {
            this.movePieceToEmpty(this.selectedElement, squareId);
        }
    }

    handleClickOnDifferentPiece(clickedPiece, squareId, parentElementOfButton, validMoves) {
        const previousParentElement = document.querySelector("." + this.selectedElement.squareId);
        const validMovesOfPrevious = this.moveValidator.getValidMoves(this.selectedElement.squareId, this.squares, this.numMovesMade);

        if (clickedPiece.color !== this.turn && !validMovesOfPrevious.includes(squareId)) {
            return;
        }

        this.uiManager.removeHighlightForPiece(previousParentElement, validMovesOfPrevious)
        this.uiManager.showHighlightingForClickedPieceAndMoves(parentElementOfButton, 'pink', validMoves);

        // Check if the user indicated they wanted to castle and if so perform the castle if it is valid
        if (this.isCastlingMove(clickedPiece)) {
            if (this.selectedElement.type === 'rook') {
                this.castle(this.selectedElement, clickedPiece);
            } else {
                this.castle(clickedPiece, this.selectedElement);
            }

            this.uiManager.removeHighlightForPiece(parentElementOfButton, validMoves)

            return;
        }
        
        if (validMovesOfPrevious.includes(squareId)) {
            if (this.takePiece(this.selectedElement, clickedPiece)) {
                this.uiManager.removeHighlightForPiece(parentElementOfButton, validMoves)
            }

            this.selectedElement = null;  // BAK

            return;
        }

        if (this.squares[squareId] === null) {
            this.selectedElement = null;
            return;
        }

        this.selectedElement = clickedPiece;
    }

    isCastlingMove(clickedPiece) {
        const clickedPieceType = clickedPiece.type;
        const previousPieceType = this.selectedElement.type;
        const castlingPieces = ['rook', 'king'];
        return castlingPieces.includes(clickedPieceType) && 
               castlingPieces.includes(previousPieceType) && 
               clickedPieceType != previousPieceType;
    }

    promotePiece(squareId, newPieceType, color) {
        const promotedPiece = createPiece(color, newPieceType);
        this.squares[squareId] = promotedPiece;

        this.uiManager.updateSquareWithPromotedPiece(squareId, promotedPiece);
        this.uiManager.hidePromotionMenu(color);
    }

    handlePromotionSelection(typeOfPiece, colorOfPiece) {
        // Find the last moved piece
        let lastPiece;
        for (const [squareId, piece] of Object.entries(this.squares)) {
            if (piece && piece.numberOfMostRecentMove === this.numMovesMade) {
                lastPiece = { squareId, piece };
                break;
            }
        }

        if (lastPiece && lastPiece.piece.canPromote()) {
            this.promotePiece(lastPiece.squareId, typeOfPiece, colorOfPiece);
        }
    }
}
