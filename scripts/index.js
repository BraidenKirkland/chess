import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";
import {createChessBoard, setUpGame, setUpBoard, setUpNewGame, showGameAndHideWelcome, clearTakenPieces} from './helpers.js';

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('existingGameState')) {
        showGameAndHideWelcome();
    }

    createChessBoard();
    new BoardSetup();
    new Board();
});

document.getElementById('startGameButton').addEventListener('click', () => {
    setUpNewGame();
});

document.getElementById('newGameButton').addEventListener('click', () => {
    setUpNewGame();
});

document.getElementById('final-reset').addEventListener('click', () => {
    document.querySelector('.confirm-reset').style.visibility = 'hidden';
    document.getElementById('board').style.visibility = 'visible';
    document.getElementById('reset').style.visibility = 'visible';
    setUpNewGame();
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