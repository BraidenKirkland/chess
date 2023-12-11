import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";
import {createChessBoard, updateElementDisplay} from './helpers.js';

// document.addEventListener('DOMContentLoaded', function () {
//     if (localStorage.getItem('existingGameState')) {
//         showGameAndHideWelcome();
//         return;
//     }

//     const boardSetup = new BoardSetup();
//     const board = new Board();
// });

// document.getElementById('startGameButton').addEventListener('click', () => {
//     clearStorage();
//     startGame();

// });

// document.getElementById('newGameButton').addEventListener('click', () => {
//     clearStorage();
//     startGame();
// });

// const startGame = () => {
//     showGameAndHideWelcome();

//     const boardSetup = new BoardSetup();
//     const board = new Board();
// }

// const clearStorage = () => {
//     localStorage.removeItem('existingGameState');
// }

// const boardSetup = new BoardSetup();
// let board;

document.getElementById('startGameButton').addEventListener('click', () => {
    showGameAndHideWelcome();
    createChessBoard();
    new BoardSetup();
    const board = new Board();
});

document.getElementById('newGameButton').addEventListener('click', () => {
    localStorage.removeItem('existingGameState');
    showGameAndHideWelcome();
    createChessBoard();
    new BoardSetup();
    new Board();
});

const showGameAndHideWelcome = () => {
    updateElementDisplay('game', 'flex');
    updateElementDisplay('start-game', 'none');
    updateElementDisplay('game-over', 'none');
}
