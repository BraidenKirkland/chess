import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";
import {createChessBoard, setUpGame, showGameAndHideWelcome, clearTakenPieces} from './helpers.js';

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('existingGameState')) {
        showGameAndHideWelcome();
        // return;
    }

    createChessBoard();
    new BoardSetup();
    let board = new Board();
});

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
    setUpGame();
});

document.getElementById('newGameButton').addEventListener('click', () => {
    setUpGame();
});

document.getElementById('final-reset').addEventListener('click', () => {
    document.querySelector('.confirm-reset').style.visibility = 'hidden';
    document.getElementById('board').style.visibility = 'visible';
    document.getElementById('reset').style.visibility = 'visible';
    setUpGame();
});

document.getElementById('quit-reset').addEventListener('click', () => {
    document.getElementById("board").style.visibility = "visible";
    document.getElementById('reset').style.visibility = "visible";
    document.querySelector('.confirm-reset').style.visibility = "hidden";

    clearTakenPieces()
    createChessBoard();
    new BoardSetup();
    new Board();
});

document.getElementById('reset').addEventListener('click', () => {
    document.getElementById("board").style.visibility = "hidden";
    document.getElementById('reset').style.visibility = "hidden";
    document.querySelector('.confirm-reset').style.visibility = "visible";
});

function quitReset() {
    // 
}