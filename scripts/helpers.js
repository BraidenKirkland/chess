import { createPiece } from "./Pieces/PieceFactory.js"
import { BoardSetup } from "./BoardSetup.js";
import { Board } from "./Board.js";

export const getNumericPosition = (regularPosition) => {
    const letters = 'abcdefgh';
    const numbers = '12345678';

    return [letters.indexOf(regularPosition[0]), numbers.indexOf(regularPosition[1])];
}

/* e.g. 00 -> a1 , 77 -> h8 */
export const getRegularPosition = (numericPosition) => {
    const letters = 'abcdefgh';
    const numbers = '12345678';

    return String(letters[Number(numericPosition[0])] + numbers[Number(numericPosition[1])]);
}

export const piecesToSymbols = {
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

export const saveGameState = (board) => {
    const plainSquaresObject = createPlainSquaresObject(board.squares);

    const gameState = {
        turn: board.turn,
        numMovesMade: board.numMovesMade,
        squares: plainSquaresObject,
        whitePiecesKilled: board.whitePiecesKilled,
        blackPiecesKilled: board.blackPiecesKilled,
        selectedElementSquare: board.selectedElement ? board.selectedElement.squareId : null // You might need to handle serialization for this
    };

    localStorage.setItem('existingGameState', JSON.stringify(gameState));
}

export const retrieveGameState = (board) => {
    const gameState = JSON.parse(localStorage.getItem('existingGameState'));
    const loadedSquares = gameState.squares;

    board.squares = {};
    for (const [position, pieceData] of Object.entries(loadedSquares)) {
        if(pieceData) {
            board.squares[position] = revivePiece(pieceData);
        }else {
            board.squares[position] = null;
        }
    }

    board.turn = gameState.turn;
    board.numMovesMade = gameState.numMovesMade;
    board.whitePiecesKilled = gameState.whitePiecesKilled;
    board.blackPiecesKilled = gameState.blackPiecesKilled;
    board.selectedElement = null;
    if(gameState.selectedElementSquare) {
        board.selectedElement = board.squares[gameState.selectedElementSquare]
    }
}

const createPlainSquaresObject = (squares) => {
    const plainSquaresObject = {};
    for (const [position, piece] of Object.entries(squares)) {
        if (piece) {
            plainSquaresObject[position] = createPlainPieceObject(piece);
        } else {
            plainSquaresObject[position] = null;
        }
    }

    return plainSquaresObject;
}

const createPlainPieceObject = (piece) => {
    if(!piece) {
        return null;
    }

    return {
        color: piece.color,
        type: piece.type,
        moveCount: piece.moveCount,
        killCount: piece.killCount,
        ranksAdvanced: piece.ranksAdvanced,
        limitations: piece.limitations,
        squareId: piece.squareId,
        numberOfMostRecentMove: piece.numberOfMostRecentMove
    };
};

const revivePiece = (pieceData) => {
    const piece = createPiece(pieceData.color, pieceData.type);
    piece.moveCount =  pieceData.moveCount,
    piece.killCount =  pieceData.killCount,
    piece.ranksAdvanced =  pieceData.ranksAdvanced,
    piece.limitations =  pieceData.limitations,
    piece.squareId =  pieceData.squareId
    piece.numberOfMostRecentMove = pieceData.numberOfMostRecentMove

    return piece;
}

export const updateElementDisplay = (className, displayType) => {
    document.querySelector(`.${className}`).style.display = displayType;
}

export function createStartingChessBoard() {
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
                setPiece(row, col, button, pieceSymbols, pieceClass);
            } else {
                button.className = emptyClass;
            }
            tableCell.appendChild(button);
            tableRow.appendChild(tableCell);
        }

        boardElement.appendChild(tableRow);
    }
}

function setPiece(row, col, button, pieceSymbols, pieceClass) {
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

export const setUpNewGame = () => {
    localStorage.removeItem('existingGameState');
    setUpGame();
}

export const setUpGame = () => {
    clearTakenPieces();
    showGameAndHideWelcome();
    setUpBoard();
}

export const setUpBoard= () => {
    createStartingChessBoard();
    new BoardSetup();
    new Board();
}

export const showGameAndHideWelcome = () => {
    updateElementDisplay('game', 'flex');
    updateElementDisplay('start-game', 'none');
    updateElementDisplay('game-over', 'none');
}

export const clearTakenPieces = () => {
    document.querySelector('.taken-pieces-black-list').innerHTML = '';
    document.querySelector('.taken-pieces-white-list').innerHTML = '';
}

export const clearLocalStorageItem = (key) => {
    localStorage.removeItem(key);
}


