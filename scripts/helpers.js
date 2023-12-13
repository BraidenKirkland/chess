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

export const updateElementDisplay = (className, displayType) => {
    document.querySelector(`.${className}`).style.display = displayType;
}

export const setUpNewGame = () => {
    localStorage.removeItem('gameOver');
    localStorage.removeItem('existingGameState');
    setUpGame();
}

export const setUpGame = () => {
    clearTakenPieces();
    showGameAndHideWelcome();
    setUpBoard();
}

export const setUpBoard= () => {
    new BoardSetup();
    new Board();
}

export const showGameAndHideWelcome = () => {
    updateElementDisplay('start-game', 'none');
    updateElementDisplay('game-over', 'none');
    updateElementDisplay('game', 'flex');
}

export const clearTakenPieces = () => {
    document.querySelector('.taken-pieces-black-list').innerHTML = '';
    document.querySelector('.taken-pieces-white-list').innerHTML = '';
}

export const populateGameOverMenu = (winningColor, checkmate, stalemate) => {
    updateElementDisplay('game-over', 'block');
    updateElementDisplay('game', 'none');
    updateElementDisplay('start-game', 'none');

    let reasonForGameOver;
    if (checkmate) {
        reasonForGameOver = 'Checkmate';
    } else if (stalemate) {
        reasonForGameOver = 'Stalemate';
    } else {
        reasonForGameOver = 'Draw';
    }

    if (checkmate) {
        const capitalizedWinningColor = winningColor.charAt(0).toUpperCase() + winningColor.slice(1);
        document.querySelector('.winner-color').innerText = `${capitalizedWinningColor} Wins!`;
        document.querySelector('.winner-king').innerHTML = '&#9812';
    }

    document.querySelector('.game-over-type').innerText = reasonForGameOver + '!';   
}