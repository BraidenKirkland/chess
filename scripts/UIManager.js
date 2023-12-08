

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
}