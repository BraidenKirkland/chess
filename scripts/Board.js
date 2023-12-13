import { createPiece } from "./Pieces/PieceFactory.js"
import { MoveValidator } from "./MoveValidator.js";
import { getNumericPosition, getRegularPosition, saveGameState } from "./helpers.js";
import { GameUIManager } from "./GameUIManager.js";

export class Board {

    constructor() {
        this.moveValidator = new MoveValidator();
        this.gameUiManager = new GameUIManager();

        // Keep track of each square on the board
        this.squares = {};
        
        this.setUpGame();
        this.gameUiManager.indicateTurn(this.turn);

        this.gameUiManager.setupEventListeners(this.handleButtonClick.bind(this));
        this.gameUiManager.setupPromotionEventListeners(this.handlePromotionSelection.bind(this));
    }

    setUpGame() {
        if (! localStorage.getItem('existingGameState')) {
            this.initializeNewGame();
            return;
        }

        this.retrieveGameState();
        this.gameUiManager.addCorrectButtonsToBoard(this.squares);
        this.gameUiManager.showTakenPiecesAfterGameLoad(this.whitePiecesKilled, this.blackPiecesKilled);
    }

    initializeNewGame() {
        // arrays to track pieces as they are killed
        this.whitePiecesKilled = [];
        this.blackPiecesKilled = [];
        this.selectedElement = null;
        this.turn = 'white';

        // Keep count of how many moves have been made throughout the entire game
        this.numMovesMade = 0;
        this.initializeBoard();
    }

    changeTurn() {
        this.turn = (this.turn === 'white' ? 'black' : 'white');

        saveGameState(this);

        if(this.moveValidator.inCheck(this.turn, this.squares, this.numMovesMade)) {
            const kingPosition = this.moveValidator.getKingPosition(this.turn, this.squares);
             this.gameUiManager.shakePiece(kingPosition);
        }

        this.gameUiManager.indicateTurn(this.turn);
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
        const piece = createPiece(color, pieceType);
        this.squares[position] = piece;
        piece.squareId = position;
    }

    castle(rook, king) {
        if (!this.moveValidator.castlingAllowed(rook, king, this.squares, this.numMovesMade)) {
            this.selectedElement = null;
            return;
        }

        const [newKingPosition, newRookPosition] = this.getNewKingAndRookPositions(rook, king);

        // Move king and rook to new positions
        this.movePieceToEmpty(king, newKingPosition);
        this.movePieceToEmpty(rook, newRookPosition);
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
        const victimPiece = this.squares[neighborSquare];
        this.movePieceToEmpty(takingPawn, diagonalSquare);
        this.squares[neighborSquare] = null;
        this.gameUiManager.updateBoardAfterEnPassantTake(takingPawn, neighborSquare);
        this.gameUiManager.displayTakenPiece(victimPiece, this.whitePiecesKilled, this.blackPiecesKilled);
    }

    getNeighborSquareForEnPassant(takingPawn, diagonalSquare) {
        if (takingPawn.color === 'white') {
            return diagonalSquare[0] + String((Number(diagonalSquare[1]) - 1));
        }

        return diagonalSquare[0] + String((Number(diagonalSquare[1]) + 1));
    }


    movePieceToEmpty(pieceToMove, newPosition) {
        const squareIdOfPiece = pieceToMove.squareId.slice();

        this.gameUiManager.updateSquareAfterMoveToEmptySquare(newPosition, squareIdOfPiece);
        this.squares[newPosition] = pieceToMove;
        this.squares[squareIdOfPiece] = null;
        this.numMovesMade++;
        this.selectedElement = null;

        pieceToMove.squareId = newPosition;
        pieceToMove.moveCount++;
        pieceToMove.numberOfMostRecentMove = this.numMovesMade;

        if(this.handlePromotion(pieceToMove, newPosition, squareIdOfPiece)) {
            return;
        }
    }

    handlePromotion(pieceToMove, newPosition, squareIdOfPiece) {
        if (pieceToMove.type === 'pawn') {
            const verticalDistance = Math.abs(Number(newPosition[1]) - Number(squareIdOfPiece[1]));
            pieceToMove.ranksAdvanced += verticalDistance;

            if (pieceToMove.canPromote()) {
                this.gameUiManager.showPromotionMenu(pieceToMove.color)
                return true;
            }
        }

        return false;
    }

    /* Method to swap the killing piece with the piece being killed. */
    takePiece(killingPiece, victimPiece) {
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

        this.gameUiManager.updateBoardAfterTake(victimSquareId, killingSquareId);
        this.gameUiManager.displayTakenPiece(victimPiece, this.whitePiecesKilled, this.blackPiecesKilled);

        if (killingPiece.canPromote()) {
            this.gameUiManager.showPromotionMenu(killingPiece.color)

            return true;
        }

        this.changeTurn();

        return true
    }

    handleButtonClick(eventObject) {
        eventObject.stopPropagation();

        const squareId = this.getClickedSquareId(eventObject);
        const clickedPiece = this.getClickedPiece(squareId);
        const parentElementOfButton = this.gameUiManager.getParentElementOfButton(squareId);
        const validMoves = this.getValidMovesForPiece(clickedPiece, squareId);

        this.processClickActions(clickedPiece, squareId, parentElementOfButton, validMoves);
        this.performGameOverCheck();
    }

    performGameOverCheck() {
        const [checkmate, stalemate, draw] = this.checkmateStalemateOrDraw();

        if (checkmate || stalemate || draw) {
            const winningColor = this.moveValidator.opposingColor(this.turn);
            this.gameUiManager.showGameOverMenu(winningColor, checkmate, stalemate);
            const gameOverInfo = {
                winningColor: winningColor,
                checkmate: checkmate,
                stalemate: stalemate,
            };

            localStorage.setItem('gameOver', JSON.stringify(gameOverInfo));
        }
    }

    checkmateStalemateOrDraw() {
        const checkmate = this.moveValidator.isCheckMate(this.turn, this.squares, this.numMovesMade);
        const stalemate = this.moveValidator.isStaleMate(this.turn, this.squares, this.numMovesMade);
        const draw      = this.moveValidator.isDraw(this);

        return [checkmate, stalemate, draw];
    }

    getClickedSquareId(eventObject) {
        // The second class represents the square id
        return eventObject.target.classList[1];
    }

    getClickedPiece(squareId) {
        const clickedPiece = this.squares[squareId];
        if (clickedPiece) {
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
        this.gameUiManager.showHighlightingForClickedPieceAndMoves(parentElementOfButton, 'pink', validMoves);
    }

    handleClickOnSelectedPiece(parentElementOfButton, validMoves) {
        // Remove highlighting
        this.gameUiManager.removeHighlightForPiece(parentElementOfButton, validMoves);

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

        this.gameUiManager.removeHighlightingWhenMovingPieceToEmptySquare(parentElementOfButton, previousParentElement, validMovesOfPrevious);

        // Perform en Passant if it is allowed
        if (this.selectedElement.type === 'pawn' && this.moveValidator.enPassantAllowed(this.selectedElement, squareId, this.squares, this.numMovesMade)) {
            this.enPassantTake(this.selectedElement, squareId);
        } else {
            this.movePieceToEmpty(this.selectedElement, squareId);
        }

        this.changeTurn();
    }

    handleClickOnDifferentPiece(clickedPiece, squareId, parentElementOfButton, validMoves) {
        const previousParentElement = document.querySelector("." + this.selectedElement.squareId);
        const validMovesOfPrevious = this.moveValidator.getValidMoves(this.selectedElement.squareId, this.squares, this.numMovesMade);

        if (clickedPiece.color !== this.turn && !validMovesOfPrevious.includes(squareId)) {
            return;
        }

        this.gameUiManager.removeHighlightForPiece(previousParentElement, validMovesOfPrevious)
        this.gameUiManager.showHighlightingForClickedPieceAndMoves(parentElementOfButton, 'pink', validMoves);

        // Check if the user indicated they wanted to castle and if so perform the castle if it is valid
        if (this.isCastlingMove(clickedPiece)) {
            if (this.selectedElement.type === 'rook') {
                this.castle(this.selectedElement, clickedPiece);
            } else {
                this.castle(clickedPiece, this.selectedElement);
            }

            this.gameUiManager.removeHighlightForPiece(parentElementOfButton, validMoves)

            return;
        }
        
        if (validMovesOfPrevious.includes(squareId)) {
            if (this.takePiece(this.selectedElement, clickedPiece)) {
                this.gameUiManager.removeHighlightForPiece(parentElementOfButton, validMoves)
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
               clickedPieceType != previousPieceType &&
               this.selectedElement.color === clickedPiece.color;
    }

    promotePiece(squareId, newPieceType, color) {
        const promotedPiece = createPiece(color, newPieceType);
        promotedPiece.squareId = squareId;

        this.squares[squareId] = promotedPiece;
        this.gameUiManager.updateSquareWithPromotedPiece(squareId, promotedPiece);
        this.gameUiManager.hidePromotionMenu(color);

        this.changeTurn();
    }

    handlePromotionSelection(typeOfPiece, colorOfPiece) {
        const lastPiece = this.getLastPieceMoved();
        if (lastPiece && lastPiece.canPromote()) {
            this.promotePiece(lastPiece.squareId, typeOfPiece, colorOfPiece);
        }
    }

    getLastPieceMoved() {
        for (const [squareId, piece] of Object.entries(this.squares)) {
            if (piece && piece.numberOfMostRecentMove === this.numMovesMade) {
                return piece;
            }
        }

        return null;
    }

    retrieveGameState() {
        const gameState = JSON.parse(localStorage.getItem('existingGameState'));
        this.repopulateSquaresObject(gameState);

        this.turn = gameState.turn;
        this.numMovesMade = gameState.numMovesMade;
        this.whitePiecesKilled = gameState.whitePiecesKilled;
        this.blackPiecesKilled = gameState.blackPiecesKilled;
        this.selectedElement = null;
        if (gameState.selectedElementSquare) {
            this.selectedElement = this.squares[gameState.selectedElementSquare]
        }
    }

    repopulateSquaresObject(gameState) {
        for (const [position, pieceData] of Object.entries(gameState.squares)) {
            if (pieceData) {
                this.squares[position] = this.revivePiece(pieceData);
            } else {
                this.squares[position] = null;
            }
        }
    }

    revivePiece(pieceData) {
        const piece = createPiece(pieceData.color, pieceData.type);

        piece.moveCount = pieceData.moveCount;
        piece.killCount = pieceData.killCount;
        piece.ranksAdvanced = pieceData.ranksAdvanced;
        piece.limitations = pieceData.limitations;
        piece.squareId = pieceData.squareId;
        piece.numberOfMostRecentMove = pieceData.numberOfMostRecentMove;

        return piece;
    }
}
