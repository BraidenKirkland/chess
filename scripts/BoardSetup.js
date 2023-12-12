export class BoardSetup {

    constructor() {
        this.createStartingChessBoard();
        this.addClassesToBoardSquares();
    }

    addClassesToBoardSquares() {
        const letters = 'hgfedcba';
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

    createStartingChessBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = ''; // Clear existing board content

        const rows = 8;
        const cols = 8;
        const lightSquareClass = 'light-square';
        const darkSquareClass = 'dark-square';
        const pieceClass = 'piece';
        const emptyClass = 'empty';
        const pieceSymbols = {
            'rook': '&#9814;',
            'knight': '&#9816;',
            'bishop': '&#9815;',
            'queen': '&#9813;',
            'king': '&#9812;',
            'pawn': '&#9817;',
            'rookB': '&#9820;',
            'knightB': '&#9822;',
            'bishopB': '&#9821;',
            'queenB': '&#9819;',
            'kingB': '&#9818;',
            'pawnB': '&#9823;'
        };

        for (let row = 0; row < rows; row++) {
            const tableRow = document.createElement('tr');
            tableRow.className = row % 2 === 0 ? 'even-row' : 'odd-row';

            for (let col = 0; col < cols; col++) {
                const tableCell = document.createElement('td');
                tableCell.className = (row + col) % 2 === 0 ? darkSquareClass : lightSquareClass;

                const button = document.createElement('button');
                if (row === 0 || row === 7 || row === 1 || row === 6) {
                    this.setPiece(row, col, button, pieceSymbols, pieceClass);
                } else {
                    button.className = emptyClass;
                }
                tableCell.appendChild(button);
                tableRow.appendChild(tableCell);
            }

            boardElement.appendChild(tableRow);
        }
    }

    setPiece(row, col, button, pieceSymbols, pieceClass) {
        if (row === 0 || row === 7) {
            const isBlack = row === 0;
            const piecesOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
            button.className = pieceClass;
            button.innerHTML = isBlack ? pieceSymbols[piecesOrder[col] + 'B'] : pieceSymbols[piecesOrder[col]];
            button.id = `${piecesOrder[col]}${col + 1}-${isBlack ? 'black' : 'white'}`;
        } else if (row === 1 || row === 6) {
            const isBlack = row === 1;
            button.className = pieceClass;
            button.innerHTML = isBlack ? pieceSymbols['pawnB'] : pieceSymbols['pawn'];
            button.id = `pawn${col + 1}-${isBlack ? 'black' : 'white'}`;
        }
    }
}