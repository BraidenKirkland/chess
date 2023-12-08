import { piecesToSymbols } from "./helpers.js";

export class UIManager {
    
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
    }

    updateBoardAfterEnPassantTake(takingPawn, neighborSquare) {
        let takenPieceIcon = document.createElement('span');
        let colorTaken = takingPawn.color === 'black' ? 'white' : 'black';
        takenPieceIcon.innerHTML = piecesToSymbols['pawn'][colorTaken];

        // Updating UI for taken pieces list
        if (takingPawn.color === 'white') {
            document.getElementsByClassName('taken-pieces-black-list')[0].appendChild(takenPieceIcon);
        } else {
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        }

        // Get <button> of pawn to be removed
        let takenButton = document.getElementsByClassName(neighborSquare)[1];

        takenButton.classList.add("empty");
        takenButton.classList.remove("piece");
        takenButton.removeAttribute("id");
        takenButton.innerHTML = null;
    }

    displayTakenPiece(victimPiece, whitePiecesKilled, blackPiecesKilled) {
        let takenPieceIcon = document.createElement('span');
        takenPieceIcon.innerHTML = piecesToSymbols[victimPiece.type][victimPiece.color];

        if (victimPiece.color === 'white') {

            whitePiecesKilled.push(victimPiece)
            document.getElementsByClassName('taken-pieces-white-list')[0].appendChild(takenPieceIcon);
        } else {
            blackPiecesKilled.push(victimPiece);
            document.getElementsByClassName('taken-pieces-black-list')[0].appendChild(takenPieceIcon);
        }
    }

    updateSquareAfterMoveToEmptySquare(newPosition, squareIdofPiece) {
        // Get table cell (<td>) and button elements for destination (empty) square
        let dstSquareTableCell = document.getElementsByClassName(newPosition)[0];
        let dstSquareButton = document.getElementsByClassName(newPosition)[1];

        // Get table cell (<td>) and button elements for piece square
        let pieceSquareTableCell = document.getElementsByClassName(squareIdofPiece)[0];
        let pieceSquareButton = document.getElementsByClassName(squareIdofPiece)[1];

        // Need to replace the children of the table cells
        let dstSquareChildToReplace = [];
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
}