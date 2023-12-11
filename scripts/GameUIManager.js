import { piecesToSymbols } from "./helpers.js";
import { setUpGame } from './helpers.js';

export class GameUIManager {

    constructor() {
        this.setUpButtonEventListeners();
    }
    
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
        const dstSquareList = document.getElementsByClassName(victimSquareId);
        const dstSquareTableCell = dstSquareList[0];
        const dstSquareButton = dstSquareList[1];

        const currentSquareList = document.getElementsByClassName(killingSquareId);
        const currentSquareTableCell = currentSquareList[0];
        const currentSquareButton = currentSquareList[1];

        // Update the square id in the button's class
        currentSquareButton.classList.remove(killingSquareId)
        currentSquareButton.classList.add(victimSquareId);

        const dstSquareChildToReplace = [];
        const currentSquareChildToReplace = [];

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
    }

    updateBoardAfterEnPassantTake(takingPawn, neighborSquare) {
        const takenPieceIcon = document.createElement('span');
        const colorTaken = takingPawn.color === 'black' ? 'white' : 'black';
        takenPieceIcon.innerHTML = piecesToSymbols['pawn'][colorTaken];

        // Updating UI for taken pieces list
        if (takingPawn.color === 'white') {
            document.getElementsByClassName('taken-pieces-black-list')[0].appendChild(takenPieceIcon);
        } else {
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        }

        // Get <button> of pawn to be removed
        const takenButton = document.getElementsByClassName(neighborSquare)[1];

        takenButton.classList.add("empty");
        takenButton.classList.remove("piece");
        takenButton.removeAttribute("id");
        takenButton.innerHTML = null;
    }

    displayTakenPiece(victimPiece, whitePiecesKilled, blackPiecesKilled) {
        const takenPieceIcon = document.createElement('span');
        takenPieceIcon.innerHTML = piecesToSymbols[victimPiece.type][victimPiece.color];

        if (victimPiece.color === 'white') {

            whitePiecesKilled.push(victimPiece.getSymbol())
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        } else {
            blackPiecesKilled.push(victimPiece.getSymbol());
            document.getElementsByClassName('taken-pieces-black-list')[0].appendChild(takenPieceIcon);
        }
    }

    showTakenPiecesAfterGameLoad(whitePiecesKilled, blackPiecesKilled) {
        const takenWhitePiecesList = document.getElementsByClassName('taken-pieces-white-list')[0];
        whitePiecesKilled.forEach(pieceSymbol => {
            const takenPieceIcon = document.createElement('span');
            takenPieceIcon.innerHTML = pieceSymbol;
            takenWhitePiecesList.appendChild(takenPieceIcon);
        });

        const takenBlackPiecesList = document.getElementsByClassName('taken-pieces-black-list')[0];
        blackPiecesKilled.forEach(pieceSymbol => {
            const takenPieceIcon = document.createElement('span');
            takenPieceIcon.innerHTML = pieceSymbol;
            takenBlackPiecesList.appendChild(takenPieceIcon);
        })
    }

    updateSquareAfterMoveToEmptySquare(newPosition, squareIdofPiece) {
        // Get table cell (<td>) and button elements for destination (empty) square
        const dstSquareTableCell = document.getElementsByClassName(newPosition)[0];
        const dstSquareButton = document.getElementsByClassName(newPosition)[1];

        // Get table cell (<td>) and button elements for piece square
        const pieceSquareTableCell = document.getElementsByClassName(squareIdofPiece)[0];
        const pieceSquareButton = document.getElementsByClassName(squareIdofPiece)[1];

        // Need to replace the children of the table cells
        const dstSquareChildToReplace = [];
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
        const board = document.getElementById("board");
        const promoMenu = document.getElementsByClassName(`${color}-promotion-menu`)[0]

        board.style.visibility = "hidden";
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

            // Add board position to <button> class list, if it exists
            if (element.firstElementChild) {
                element.firstElementChild.classList.add(letter + number);
            }
        });
    }

    setupPromotionEventListeners(promotionCallback) {
        const promotionMenuPieces = [...document.querySelectorAll(".promo")];

        promotionMenuPieces.forEach(button => {
            button.addEventListener('click', event => {
                const importantClass = event.target.classList[1];
                const [typeOfPiece, colorOfPiece] = importantClass.split("-");

                // Invoke the callback function with the necessary information
                promotionCallback(typeOfPiece, colorOfPiece);
            });
        });
    }

    updateSquareWithPromotedPiece(squareId, piece) {
        const symbol = piecesToSymbols[piece.type][piece.color];
        const squareButton = document.getElementsByClassName(squareId)[1];
        squareButton.innerHTML = symbol;
    }

    hidePromotionMenu(color) {
        const board = document.getElementById("board");
        const promoMenu = document.getElementsByClassName(`${color}-promotion-menu`)[0];
        board.style.visibility = "visible";
        promoMenu.style.visibility = "hidden";
    }

    shakePiece(squareId) {
        const kingElement = document.querySelector(`.${squareId}`);
        kingElement.classList.add('shake');

        setTimeout(() => {
            kingElement.classList.remove('shake');
        }, 1500);
    }
    
    showGameOverMenu(winningColor, checkmate) {
        document.querySelector('.game-over').style.display = 'block';
        document.querySelector('.game').style.display = 'none';

        const reasonForGameOver = checkmate ? 'Checkmate' : 'Stalemate';

        if(checkmate) {
            const capitalizedWinningColor = winningColor.charAt(0).toUpperCase() + winningColor.slice(1);
            document.querySelector('.winner-color').innerText = `${capitalizedWinningColor} Wins!`;
            document.querySelector('.winner-king').innerHTML = '&#9812';
        }

        document.querySelector('.game-over-type').innerText = reasonForGameOver + '!';
    }

    setUpButtonEventListeners() {
        
    }
}