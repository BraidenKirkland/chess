import { Board } from "./Board.js";
import { createPiece } from "./Pieces/PieceFactory.js"
// move format [left-right, up-down]

/* 
    Set backgroundColor of 'element' to 'color'
*/


// Store all board squares in an array
const boardPositions = [...document.querySelectorAll('td')].reverse();

let letters = 'hgfedcba';
let numbers = '12345678';

// Label each square with its position (as a html class)
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

    // add board position to <td> class list
    element.classList.add(letter + number);
    // add board position to <button> class list
    if (element.firstElementChild != null) {
        element.firstElementChild.classList.add(letter + number);
    }
});

const board = new Board();

document.getElementById('reset').addEventListener('click', () => {
    document.getElementById("board").style.visibility = "hidden";
    document.getElementById('reset').style.visibility = "hidden";
    document.querySelector('.confirm-reset').style.visibility = "visible";
});

document.getElementById('final-reset').addEventListener('click', () => {
    location.reload();
});

document.getElementById('quit-reset').addEventListener('click', () => {
    document.getElementById("board").style.visibility = "visible";
    document.getElementById('reset').style.visibility = "visible";
    document.querySelector('.confirm-reset').style.visibility = "hidden";
});

const promotionMenuPieces = [...document.querySelectorAll(".promo")];

promotionMenuPieces.forEach(button => {

    button.addEventListener('click', (eventObject) => {

        let importantClass = eventObject.target.classList[1];

        // TODO: Need to determine square landed on
        let lastPiece;
        for(const [squareId, piece] of Object.entries(board.squares)){
            if(board.squares[squareId] !== null){
                if(board.squares[squareId].numberOfMostRecentMove === board.numMovesMade){
                    lastPiece = board.squares[squareId];
                    break; 
                }
            }
        }

        // TODO: Replace the pawn on the square with the selected piece
        let squareId = lastPiece.squareId.slice();
        let currentSquareList = document.getElementsByClassName(squareId);
        let currentSquareTableCell = currentSquareList[0];
        let currentSquareButton = currentSquareList[1];

        const promotionPieces = {
            'queen-white': '&#9813',
            'queen-black': '&#9819',
            'rook-white': '&#9814',
            'rook-black': '&#9820',
            'bishop-white': '&#9815',
            'bishop-black': '&#9821',
            'knight-white': '&#9816',
            'knight-black': '&#9822'
        }

        let [typeOfPiece, colorOfPiece] = importantClass.split("-");

        currentSquareButton.innerHTML = promotionPieces[importantClass];
        board.squares[squareId] = createPiece(colorOfPiece, typeOfPiece);

        // TODO: Look into this further, I am not sure if it could cause problems
        currentSquareButton.removeAttribute("id");

        //TODO: Toggle the display for the board and selection menu

        let boardElement = document.getElementById("board");
        let promoMenu;
        if(colorOfPiece === 'white'){
            promoMenu = document.getElementsByClassName("white-promotion-menu")[0];
        }else{
            promoMenu = document.getElementsByClassName("black-promotion-menu")[0];
        }

        boardElement.style.visibility = "visible";
        promoMenu.style.visibility = "hidden";

    });
});