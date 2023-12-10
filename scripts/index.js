import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";


document.getElementById('startGameButton').addEventListener('click', () => {

    document.querySelector('.game').style.display = 'flex';
    document.querySelector('.start-game').style.display = 'none';

    const boardSetup = new BoardSetup();
    const board = new Board();
})