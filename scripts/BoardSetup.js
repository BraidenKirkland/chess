import { createChessBoard } from './helpers.js';

export class BoardSetup {

    constructor() {
        this.addClassesToBoardSquares();
        this.setupReset();
        this.setupResetFinal();
        this.setupResetQuit();
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

    setupReset() {
        // document.getElementById('reset').addEventListener('click', () => {
        //     document.getElementById("board").style.visibility = "hidden";
        //     document.getElementById('reset').style.visibility = "hidden";
        //     document.querySelector('.confirm-reset').style.visibility = "visible";
        // });
    }

    setupResetFinal() {
        // document.getElementById('final-reset').addEventListener('click', () => {
        //     localStorage.removeItem('existingGameState');
        // });
    }

    setupResetQuit() {
        // document.getElementById('quit-reset').addEventListener('click', () => {
        //     document.getElementById("board").style.visibility = "visible";
        //     document.getElementById('reset').style.visibility = "visible";
        //     document.querySelector('.confirm-reset').style.visibility = "hidden";
        // });

    }
}