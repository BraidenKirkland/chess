import { piecesToSymbols } from "./helpers.js";
import { populateGameOverMenu } from './helpers.js';

export class GameUIManager {
    getBoardPieces() {
        return [...document.querySelectorAll(".piece, .empty")];
    }

    highlightElement = (element, color) => {
        element.style.backgroundColor = color;
    }

    addHighlightToElements(moveList) {
        moveList.forEach(squareId => {
            this.highlightSquare(squareId, 'yellow');
        });
    }

    removeHighlightFromElements(moveList) {
        moveList.forEach(squareId => {
            this.resetHighlight(squareId);
        });
    }

    highlightSquare(squareId, color) {
        const square = document.querySelector('.' + squareId);
        if (square) {
            square.style.backgroundColor = color;
        }
    }

    addHighlightToSquares(moveList) {
        moveList.forEach(squareId => {
            this.highlightSquare(squareId, 'yellow');
        });
    }

    resetHighlight(squareId) {
        this.highlightSquare(squareId, ''); // Resetting the color
    }

    getParentElementOfButton(squareId) {
        return document.querySelector("." + squareId);
    }

    updateBoardAfterTake(victimSquareId, killingSquareId) {
        const dstSquareTableCell = document.querySelector(`td.${victimSquareId}`);
        const dstSquareButton = document.querySelector(`button.${victimSquareId}`);
        const currentSquareTableCell = document.querySelector(`td.${killingSquareId}`);
        const currentSquareButton = document.querySelector(`button.${killingSquareId}`);

        // Update the square id in the button's class
        currentSquareButton.classList.remove(killingSquareId)
        currentSquareButton.classList.add(victimSquareId);

        dstSquareTableCell.replaceChild(currentSquareButton, dstSquareButton);
        currentSquareTableCell.appendChild(dstSquareButton);

        // Turn the victim piece button into an empty button
        this.setButtonStateToEmpty(dstSquareButton) 
        dstSquareButton.classList.remove(victimSquareId);
        dstSquareButton.classList.add(killingSquareId);
    }

    updateBoardAfterEnPassantTake(takingPawn, neighborSquareId) {
        const takenPieceIcon = document.createElement('span');
        const colorTaken = takingPawn.color === 'black' ? 'white' : 'black';
        takenPieceIcon.innerHTML = piecesToSymbols['pawn'][colorTaken];

        // Get <button> of pawn to be removed
        const takenButton = document.querySelector(`button.${neighborSquareId}`);
        this.setButtonStateToEmpty(takenButton);
    }

    setButtonStateToEmpty(button) {
        button.removeAttribute("id");
        button.classList.remove("piece");
        button.classList.add("empty");
        button.innerHTML = null;
    }

    displayTakenPiece(victimPiece) {
        const takenPieceIcon = document.createElement('span');
        takenPieceIcon.innerHTML = victimPiece.getSymbol();

        if (victimPiece.color === 'white') {
            document.querySelector('.taken-pieces-white-list').appendChild(takenPieceIcon);
        } else {
            document.querySelector('.taken-pieces-black-list').appendChild(takenPieceIcon);
        }
    }

    showTakenPiecesAfterGameLoad(whitePiecesKilled, blackPiecesKilled) {
        const takenWhitePiecesList = document.querySelector('.taken-pieces-white-list');
        const takenBlackPiecesList = document.querySelector('.taken-pieces-black-list');
        this.addTakenPiecesBackToUi(takenWhitePiecesList, whitePiecesKilled);
        this.addTakenPiecesBackToUi(takenBlackPiecesList, blackPiecesKilled);
    }

    addTakenPiecesBackToUi(takenPiecesList, piecesTaken) {
        piecesTaken.forEach(pieceSymbol => {
            const takenPieceIcon = document.createElement('span');
            takenPieceIcon.innerHTML = pieceSymbol;
            takenPiecesList.appendChild(takenPieceIcon);
        })
    }

    updateSquareAfterMoveToEmptySquare(newPosition, squareIdOfPiece) {
        // Get table cell (<td>) and button elements for destination (empty) square
        const dstSquareTableCell = document.querySelector(`td.${newPosition}`);
        const dstSquareButton = document.querySelector(`button.${newPosition}`);

        // Get table cell (<td>) and button elements for piece square
        const pieceSquareTableCell = document.querySelector(`td.${squareIdOfPiece}`);
        const pieceSquareButton = document.querySelector(`button.${squareIdOfPiece}`);

        // Replace the empty square's button with the piece's button
        dstSquareTableCell.replaceChild(pieceSquareButton, dstSquareButton);
        pieceSquareTableCell.appendChild(dstSquareButton);

        // Update the class list of the destination square button
        dstSquareButton.classList.add(squareIdOfPiece);
        dstSquareButton.classList.remove(newPosition);

        // Update the class list of the piece square button
        pieceSquareButton.classList.add(newPosition);
        pieceSquareButton.classList.remove(squareIdOfPiece);
    }

    showHighlightingForClickedPieceAndMoves(parentElementOfButton, buttonColor, validMoves) {
        this.highlightElement(parentElementOfButton, buttonColor);
        this.addHighlightToElements(validMoves);
    }

    removeHighlightForPiece(parentElementOfButton, validMoves) {
        this.highlightElement(parentElementOfButton, null);
        this.removeHighlightFromElements(validMoves);
    }

    removeHighlightingWhenMovingPieceToEmptySquare(parentElementOfButton, previousParentElement, validMovesOfPrevious) {
        this.highlightElement(parentElementOfButton, null);
        this.highlightElement(previousParentElement, null);
        this.removeHighlightFromElements(validMovesOfPrevious);
    }

    setupEventListeners(handleClickCallback) {
        const boardPieces = this.getBoardPieces();
        boardPieces.forEach(button => {
            button.addEventListener('click', (event) => {
                handleClickCallback(event);
            });
        });
    }

    getBoardPieces() {
        return [...document.querySelectorAll(".piece, .empty")];
    }

    showPromotionMenu(color) {
        const game = document.querySelector(".game");
        const promoMenu = document.querySelector(`.${color}-promotion-menu`);
        game.style.visibility = "hidden";
        promoMenu.style.visibility = "visible";
    }

    addClassesToBoardSquares() {
        const letters = 'abcdefgh';
        const numbers = '12345678';
        const boardPositions = [...document.querySelectorAll('td')].reverse();

        boardPositions.forEach((element, index) => {
            const letter = letters[index % 8];
            const number = numbers[Math.floor(index / 8)];

            // Add board position to <td> class list
            element.classList.add(letter + number);

            // Add board position to <button> class list
            if (element.firstElementChild) {
                element.firstElementChild.classList.add(letter + number);
            }
        });
    }

    setupPromotionEventListeners(promotionCallback) {
        const promotionMenuPieces = [...document.querySelectorAll(".promo")];
        promotionMenuPieces.forEach(button => {
            button.addEventListener('click', event => {
                const pieceTypeAndColorClass = event.target.classList[1];
                const [typeOfPiece, colorOfPiece] = pieceTypeAndColorClass.split("-");

                promotionCallback(typeOfPiece, colorOfPiece);
            });
        });
    }

    updateSquareWithPromotedPiece(squareId, piece) {
        const symbol = piece.getSymbol();
        const squareButton = document.querySelector(`button.${squareId}`)
        squareButton.innerHTML = symbol;
    }

    hidePromotionMenu(color) {
        const game = document.querySelector(".game");
        const promoMenu = document.querySelector(`.${color}-promotion-menu`);
        game.style.visibility = "visible";
        promoMenu.style.visibility = "hidden";
    }

    shakePiece(squareId) {
        const kingElement = document.querySelector(`.${squareId}`);
        kingElement.classList.add('shake');

        setTimeout(() => {
            kingElement.classList.remove('shake');
        }, 1500);
    }
    
    showGameOverMenu(winningColor, checkmate, stalemate) {
        populateGameOverMenu(winningColor, checkmate, stalemate);
    }

    indicateTurn(turn) {
        if(turn === 'white') {
            document.querySelector('.turn').textContent = "White's Turn";
            return;
        }

        document.querySelector('.turn').textContent = "Black's Turn";
    }

    addCorrectButtonsToBoard(squares) {
        for (const [squareId, piece] of Object.entries(squares)) {
            
            // Get the outer <td> element
            const squareElement = document.querySelector(`td.${squareId}`);

            // Add the correct button as the innerHtml for the <td> element
            if (piece) {
                squareElement.innerHTML = `<button class="piece ${squareId}">${piece.getSymbol()}</button>`;
            } else {
                squareElement.innerHTML = `<button class="empty ${squareId}"></button>`;
            }
        }
    }
}