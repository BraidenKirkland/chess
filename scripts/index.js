import { Board } from "./Board.js";
import { BoardSetup } from "./BoardSetup.js";
import { createPiece } from "./Pieces/PieceFactory.js"

const boardSetup = new BoardSetup();
const board = new Board();

const promotionMenuPieces = [...document.querySelectorAll(".promo")];

promotionMenuPieces.forEach(button => {
    button.addEventListener('click', eventObject => {
        const importantClass = eventObject.target.classList[1];
        const [typeOfPiece, colorOfPiece] = importantClass.split("-");

        // Find the last moved piece
        let lastPiece;
        for (const [squareId, piece] of Object.entries(board.squares)) {
            if (piece && piece.numberOfMostRecentMove === board.numMovesMade) {
                lastPiece = { squareId, piece };
                break;
            }
        }

        if (lastPiece && lastPiece.piece.canPromote()) {
            board.promotePiece(lastPiece.squareId, typeOfPiece, colorOfPiece);
        }
    });
});