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

        // Get <button> of pawn to be removed
        const takenButton = document.getElementsByClassName(neighborSquare)[1];

        takenButton.classList.add("empty");
        takenButton.classList.remove("piece");
        takenButton.removeAttribute("id");
        takenButton.innerHTML = null;
    }

    displayTakenPiece(victimPiece) {
        const takenPieceIcon = document.createElement('span');
        takenPieceIcon.innerHTML = victimPiece.getSymbol();

        if (victimPiece.color === 'white') {
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        } else {
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
        const board = document.querySelector(".game");
        const promoMenu = document.querySelector(`.${color}-promotion-menu`);

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
        const symbol = piecesToSymbols[piece.type][piece.color];
        const squareButton = document.querySelector(`button.${squareId}`)
        squareButton.innerHTML = symbol;
    }

    hidePromotionMenu(color) {
        const board = document.querySelector(".game");
        const promoMenu = document.querySelector(`.${color}-promotion-menu`);
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