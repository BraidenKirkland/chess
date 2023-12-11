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
}