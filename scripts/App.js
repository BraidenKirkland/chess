import { ButtonUIManager } from "./ButtonUIManager.js";
import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";
import { 
    setUpNewGame, 
    showGameAndHideWelcome, 
    clearTakenPieces,
    populateGameOverMenu
} from './helpers.js';

export class App {
    constructor() {
        this.buttonUiManager = new ButtonUIManager();
        this.setupButtonAndRefreshEventListeners();
    }

    setupButtonAndRefreshEventListeners() {
        document.addEventListener('DOMContentLoaded', function () {
            if(localStorage.getItem('gameOver')) {
                const {winningColor, checkmate, stalemate} = JSON.parse(localStorage.getItem('gameOver'));
                populateGameOverMenu(winningColor, checkmate, stalemate);
                
                return;
            }

            if (localStorage.getItem('existingGameState')) {
                showGameAndHideWelcome();
            }

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
            this.buttonUiManager.hideResetModalAndShowBoard();
            setUpNewGame();
        });

        document.getElementById('quit-reset').addEventListener('click', () => {
            this.buttonUiManager.hideResetModalAndShowBoard();

            clearTakenPieces()
            new BoardSetup();
            new Board();
        });

        document.getElementById('reset').addEventListener('click', () => {
            this.buttonUiManager.showResetModal();
        });
    }
}