
class Piece{

    constructor(currentPosition, pieceType, color){
        this.currentPosition = currentPosition;
        this.pieceType = pieceType;
        this.color = color;
        this.state = 'alive';
    }

    availableMoves(){

        return [];
    }

}


class Board {

    constructor(){
        this.availableWhitePieces = [];
        this.availableBlackPieces = [];
        this.addPieces();
    }

    addPieces(){
        const allBlackPieces = [...document.querySelectorAll('button[id$="black"]')];
        allBlackPieces.forEach(piece => {
            // Get position of piece from element class
            let position = [...piece.classList][1];
            // Extract piece info from element id
            let pieceType = piece.id.split('-')[0].splice(0,-1);
            availableBlackPieces.push(new Piece(position, pieceType))
        })

        //console.log([...allBlackPieces[0].classList]);
    }

}

// move format [left-right, up-down]

const king = {
    // left, right, up, down, up and right, up and left, down and left, down and right
    moves: [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]]
}

const queen = {
    moves: [[-1, 0], [1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]]
}

const bishop = {
    moves: [[1, 1], [1, -1], [-1, -1], [-1, 1]]
}

const knight = {
    moves: [[-2, 1], [-2, -1], [-1, 2], [-1, -2], [2, 1], [2, -1], [1, 2], [1, -2]]
}

const rook = {
    moves: [[-1, 0], [1, 0], [0, 1], [0, -1]]
}

const pawn = {
    moves: [[0, 2], [0, 1]],
    killMoves: [[-1, 1], [1, 1]]
}




const boardPositions = [...document.querySelectorAll('td')].reverse();

let letters = 'hgfedcba';
let numbers = '12345678';

for (let i = 0; i < 8; i++) {
    let num = 1;

    for (let j = 0; j < 8; j++) {

    }
}

let rowIndex = 0;
let letter, number;
boardPositions.forEach((element, index) => {
    letter = letters[index % 8];
    if (index < 8) {
        number = '1';
    } else if (index < 16) {
        number = '2';
    } else if (index < 24) {
        number = '3';
    } else if (index < 32) {
        number = '4';
    } else if (index < 40) {
        number = '5';
    } else if (index < 48) {
        number = '6';
    } else if (index < 56) {
        number = '7';
    } else {
        number = '8';
    }

    element.classList.add(letter + number);
    if(element.firstElementChild != null){
        element.firstElementChild.classList.add(letter + number);
    }
});

const boardPieces = [...document.querySelectorAll(".piece")];

const board = new Board();

boardPieces.forEach(button => {
    button.addEventListener('click', () => {

    });
});