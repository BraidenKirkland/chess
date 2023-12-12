export class BoardSetup {

    constructor() {
        this.createStartingChessBoard();
        this.addClassesToBoardSquares();
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

        this.addLetterRowToBoard(boardElement);

        for (let row = 0; row < rows; row++) {
            const tableRow = document.createElement('tr');
            tableRow.className = row % 2 === 0 ? 'even-row' : 'odd-row';

            this.addNumberCellToBoardRow(tableRow, rows - row);

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
            this.addNumberCellToBoardRow(tableRow, rows - row);
            boardElement.appendChild(tableRow);
        }
        this.addLetterRowToBoard(boardElement);
    }

    addLetterRowToBoard(boardElement) {
        const letters = 'abcdefgh';
        const letterRow = document.createElement('tr');
        letterRow.classList.add('label-row')

        letterRow.appendChild(document.createElement('td'))

        for(const letter of letters) {
            const letterCell = document.createElement('td')
            letterCell.classList.add('label-cell');
            letterCell.classList.add('letter');
            letterCell.textContent = letter;
            letterRow.appendChild(letterCell);
        }

        boardElement.appendChild(letterRow);
    }

    addNumberCellToBoardRow(boardRow, value) {
        const numberCell = document.createElement('td');
        numberCell.classList.add('label-cell');
        numberCell.classList.add('number');;
        numberCell.textContent = String(value);
        boardRow.appendChild(numberCell);
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

    addClassesToBoardSquares() {
        const letters = 'hgfedcba';
        const numbers = '12345678';
        const boardPositions = [...document.querySelectorAll('.light-square, .dark-square')].reverse();

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