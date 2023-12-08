import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";
import { createPiece } from "./Pieces/PieceFactory.js"

const boardSetup = new BoardSetup();
const board = new Board();

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