import { getNumericPosition, getRegularPosition } from "./helpers.js";

export class MoveValidator {
    
    validMove(srcSquareId, dstSquareId, piece, squares, numMovesMade) {

        // Cannot move to the square if it is occupied by a same color piece
        if (squares[dstSquareId] !== null && squares[dstSquareId].color === piece.color) {
            return false;
        }

        // The one and only check for the knight has already been passed
        // This is because there is no need to check intermediate squares
        if (piece.type === 'knight') {
            return true;
        }

        // Get the numeric id's of the source and destination squares
        let srcSquareNumeric = [Number(getNumericPosition(srcSquareId)[0]), Number(getNumericPosition(srcSquareId)[1])];
        let dstSquareIdNumeric = [Number(getNumericPosition(dstSquareId)[0]), Number(getNumericPosition(dstSquareId)[1])];

        // Calculate the horizontal and vertical offsets
        let horizontal = dstSquareIdNumeric[0] - srcSquareNumeric[0];
        let vertical = dstSquareIdNumeric[1] - srcSquareNumeric[1];

        let difference = [horizontal, vertical];
        let verticalCounter = 1, horizontalCounter = 1;

        // Check if destination square is below the current square
        if (vertical < 0) {
            verticalCounter = -1;
        }

        // Check if destination square is to the left of the current square
        if (horizontal < 0) {
            horizontalCounter = -1;
        }

        // Check if the move is purely horizontal or vertical
        if (vertical === 0) {
            verticalCounter = 0;
        }
        if (horizontal === 0) {
            horizontalCounter = 0;
        }

        /* 
            Special case for pawns
            If the move has a horizontal component, then it must be a kill move.
            This is only allowed if the destination square is occupied by an enemy piece
         */

        // TODO: Possible check en Passant here??
        if (piece.type === 'pawn' && horizontal !== 0) {
            let dstSquare = getRegularPosition(dstSquareIdNumeric);
            // The move is not allowd if the destination square has no piece or a piece of the same color

            if (squares[dstSquare] === null && this.enPassantAllowed(piece, dstSquare, squares, numMovesMade)) {
                return true;
            } else if (squares[dstSquare] === null || squares[dstSquare].color === piece.color) {
                return false;
            }

            return true;
        }

        if (piece.type === 'pawn' && horizontal === 0) {
            let dstSquare = getRegularPosition(dstSquareIdNumeric);
            // The move is not allowd if the destination square is occupied by a piece of any color
            if (squares[dstSquare] !== null) {
                return false;
            }

            if (Math.abs(vertical) > 1) {
                let intermediatePosition = [];
                intermediatePosition[0] = srcSquareNumeric[0];  // no change
                intermediatePosition[1] = (piece.color === 'white' ? srcSquareNumeric[1] + 1 : srcSquareNumeric[1] - 1);  // check the square directly in front of the pawn
                let intermediateSquare = getRegularPosition(intermediatePosition);
                if (squares[intermediateSquare] !== null) {
                    return false;
                }
            }

            return true;
        }

        let intermediatePosition = [];
        let intermediateSquare;
        let enemyPiecesOnPath = 0;
        for (let i = 1; i < Math.max(Math.abs(vertical), Math.abs(horizontal)); i++) {

            intermediatePosition[0] = srcSquareNumeric[0] + horizontalCounter * i;
            intermediatePosition[1] = srcSquareNumeric[1] + verticalCounter * i;
            intermediateSquare = getRegularPosition(intermediatePosition);

            if (squares[intermediateSquare] == null) {
                continue;
            }
            if (squares[intermediateSquare].color === piece.color) {
                return false;
            }

            // Track how many enemy pieces have been encountered on this path
            // Only the first one encountered can be killed
            if (squares[intermediateSquare].color !== piece.color) {
                enemyPiecesOnPath++;
            }
        }

        if (enemyPiecesOnPath > 0) {
            return false;
        }

        return true;
    }

    enPassantAllowed(takingPawn, diagonalSquare, squares, numMovesMade) {

        let neighborSquare;
        if (takingPawn.color === 'white') {
            neighborSquare = diagonalSquare[0] + String((Number(diagonalSquare[1]) - 1));
        } else {
            neighborSquare = diagonalSquare[0] + String((Number(diagonalSquare[1]) + 1));
        }

        // Ensure there is an enempy pawn directly beside 
        let pieceOnNeighborSquare = squares[neighborSquare];
        if (pieceOnNeighborSquare === null || pieceOnNeighborSquare.type !== 'pawn' || pieceOnNeighborSquare.color === takingPawn.color) {
            return false;
        }

        // Ensure the destination square is free
        if (squares[diagonalSquare] !== null) {
            return false;
        }

        // Rule One: The capturing pawn much have moved exactly three ranks
        if (takingPawn.ranksAdvanced !== 3) {
            return false;
        }

        // Rule Two: The captured pawn must have moved two squares in one move
        if (pieceOnNeighborSquare.firstMoveRank !== 2 && pieceOnNeighborSquare.moveCount !== 1) {
            return false;
        }

        // Rule Three: The captured pawn must have made the last move
        if (numMovesMade !== pieceOnNeighborSquare.numberOfMostRecentMove) {
            return false;
        }

        return true;
    }

    /* 
     Check to see if the king belonging to the input value of color is in check
 */
    inCheck(color, squares) {

        // If color is white, check all black pieces to see if they can kill the king and vice versa

        // 1. Get the position of the king
        // 2. For each enemy piece
        //     - Does the array of valid moves for that piece contain the king's square?
        //        => Yes - return true
        //    return false

        let kingSquareId;
        let enemyPieces = [];

        for (const [squareId, piece] of Object.entries(squares)) {
            if (piece === null) {
                continue;
            }

            if (piece.color === color && piece.type === 'king') {
                kingSquareId = squareId;
                continue;
            }

            if (piece.color !== color) {
                piece.squareId = squareId;
                enemyPieces.push(piece);
            }
        }

        let enemyPiece;
        let enemyPieceValidMoves;

        for (let i = 0; i < enemyPieces.length; i++) {
            enemyPiece = enemyPieces[i];
            enemyPieceValidMoves = this.getValidMoves(enemyPiece.squareId, squares);

            if (enemyPieceValidMoves.includes(kingSquareId)) {
                return true;
            }
        }

        return false;
    }

    /* 
        Check if 'color' has been checkmated

        Assumption is that the king is already in check
    */
    isCheckMate(color, squares) {

        /* 
           For every piece of this color
                1. Get the valid moves for that piece
                    For each move in valid moves
                        if(moveRemovesCheck(piece, move)) 
                            return false  -> check was removed
                
                2. return true -> none of the valid moves for any piece removes the check; therefore, checkmate
        */

        // Adding this as assurance
        if (!this.inCheck(color, squares)) {
            return false;
        }

        let friendlyPieces = [];

        for (const [squareId, piece] of Object.entries(squares)) {

            if (piece !== null && piece.color === color) {
                piece.squareId = squareId;
                friendlyPieces.push(piece)
            }
        }

        let currentPiece;
        let move;

        // Iterate through all pieces of this color
        for (let i = 0; i < friendlyPieces.length; i++) {
            currentPiece = friendlyPieces[i];
            // For each piece, get its valid moves
            let validMoves = this.getValidMoves(currentPiece.squareId.slice(), squares);

            // Iterate through all valid moves for each piece
            for (let j = 0; j < validMoves.length; j++) {
                move = validMoves[j];
                // Check whether moving this piece to one of its valid moves will remove the check on the king
                if (this.moveRemovesCheck(currentPiece, move, squares)) {
                    return false;
                }
            }
        }

        // If this far, then it must be a checkmate
        return true;
    }

    /* 
The king is already in check
Does moving pieceToMove to newPosition remove the check on the king?
*/
    moveRemovesCheck(pieceToMove, newPosition, squares) {

        let currentPositionOfPiece = pieceToMove.squareId;
        let piecePresentlyInNewPosition = squares[newPosition];

        // Alter the board temporarily
        squares[currentPositionOfPiece] = null;
        squares[newPosition] = pieceToMove;

        // Perform the swap and run the inCheck function
        let retVal = !this.inCheck(pieceToMove.color, squares);

        // Set the board back to its original state
        squares[newPosition] = piecePresentlyInNewPosition;
        squares[currentPositionOfPiece] = pieceToMove;


        return retVal;
    }

    getValidMoves(squareId, squares) {
        let currentPiece = squares[squareId];
        let theoreticalMoves = this.theoreticalMoves(squareId, currentPiece);
        let validMoves = theoreticalMoves.filter(dstSquareId => this.validMove(squareId, dstSquareId, currentPiece, squares, this.numMovesMade));
        return validMoves;
    }

    theoreticalMoves(srcSquareId, piece) {
        const theoreticalMoves = [];
        let startingPosition = [Number(getNumericPosition(srcSquareId)[0]), Number(getNumericPosition(srcSquareId)[1])];
        let newPosition = [];

        let isPawn = piece.type === 'pawn';

        for (let i = 0; !isPawn && i < piece.moves.length; i++) {
            for (let j = 1; j < 8; j++) {
                newPosition[0] = startingPosition[0] + piece.moves[i][0] * j;
                newPosition[1] = startingPosition[1] + piece.moves[i][1] * j;

                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    break;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    break;
                }
                // theoreticalMoves.push(newPosition.slice());
                theoreticalMoves.push(getRegularPosition(newPosition));

                // If there is a limitation (e.g. king) only take the first move (j=1)
                // This works for knights as well because there is only one possible move in each direction
                if (piece.limitations) {
                    break;
                }
            }
        }

        if (isPawn) {
            let fwdMoves = piece.getFwdMoves();
            let killMoves = piece.moves;
            for (let i = 0; i < fwdMoves.length; i++) {
                // Reverse direction for black pieces
                newPosition[0] = startingPosition[0] + (piece.color === 'white' ? fwdMoves[i][0] : -1 * fwdMoves[i][0]);
                newPosition[1] = startingPosition[1] + (piece.color === 'white' ? fwdMoves[i][1] : -1 * fwdMoves[i][1]);

                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    continue;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    continue;
                }
                theoreticalMoves.push(getRegularPosition(newPosition));
            }

            for (let i = 0; i < killMoves.length; i++) {
                // Reverse direction for black pieces
                newPosition[0] = startingPosition[0] + (piece.color === 'white' ? killMoves[i][0] : -1 * killMoves[i][0]);
                newPosition[1] = startingPosition[1] + (piece.color === 'white' ? killMoves[i][1] : -1 * killMoves[i][1]);
                // Make sure the calculated position is on the board
                if (newPosition[0] > 7 || newPosition[0] < 0) {
                    continue;
                }
                if (newPosition[1] > 7 || newPosition[1] < 0) {
                    continue;
                }

                theoreticalMoves.push(getRegularPosition(newPosition));
            }
        }

        return theoreticalMoves;
    }
    
    /* 
    Check if moving the input piece would result in a check on its color's king
    TODO: The method is currently oversimplified. Need to consider where the piece is going 
        to be moved to because it may kill the piece causing the check
        **** maybe moveRemovesCheck() can handle this ???? ****

        ASSUMES THAT THE MOVE IS VALID
    */
    moveCreatesCheck(pieceToMove, squares, newPosition = null) {
        let retVal = false;

        // record the squareId of the piece
        let currentPosition = pieceToMove.squareId;

        // temporarily remove the piece from the board
        squares[currentPosition] = null;

        let piecePresentlyInNewPosition = null;

        // When a piece currently occupies the new position
        // Replace it with the piece that is being moved
        if (newPosition !== null && squares[newPosition] !== null) {
            piecePresentlyInNewPosition = squares[newPosition];
        }

        squares[newPosition] = pieceToMove;

        // Check if this board arrangement results in a check
        retVal = this.inCheck(pieceToMove.color, squares);

        // Reset the board
        squares[currentPosition] = pieceToMove;
        squares[newPosition] = piecePresentlyInNewPosition;

        return retVal;
    }

    isStaleMate(color, squares) {
        // Cannot be a stalemate if the piece is already in check
        if (this.inCheck(color, squares)) {
            return false;
        }

        let friendlyPieces = [];
        for (const [squareId, piece] of Object.entries(squares)) {
            if (piece !== null && piece.color === color) {
                piece.squareId = squareId;
                friendlyPieces.push(piece)
            }
        }

        let currentPiece;
        let move;

        // Iterate through all pieces of this color
        for (let i = 0; i < friendlyPieces.length; i++) {
            currentPiece = friendlyPieces[i];

            // For each piece, get its valid moves
            let validMoves = this.getValidMoves(currentPiece.squareId.slice(), squares);

            // Iterate through all valid moves for each piece
            for (let j = 0; j < validMoves.length; j++) {
                move = validMoves[j];
                // Check whether moving this piece to one of its valid moves will create a check on the king
                if (!this.moveCreatesCheck(currentPiece, squares, move)) {

                    // If there exists a valid move for a piece of this color that does not result in check => no stalemate
                    return false;
                }
            }
        }

        // No valid moves except those that create check
        return true;
    }

    squareUnderAttack(squareId, opposingColor, squares) {

        // TODO: Check the rules to see what to do if the opposing side is in check
        let validMoves;
        for (const [square, piece] of Object.entries(squares)) {
            if (piece !== null && piece.color === opposingColor) {
                validMoves = this.getValidMoves(square, squares);
                // TODO: May need a special check for pawns trying to move forward as they are not "attacking"
                //       However, they will be able to attack both diagonals
                if (validMoves.includes(squareId)) {
                    return true;
                }
            }
        }

        return false;
    }

    castlingAllowed(rook, king, squares) {
        if (rook.color !== king.color) {
            return false;
        }

        let opposingColor = (king.color === 'white' ? 'black' : 'white');

        // Castling is only allowed if neither the rook nor the king have moved
        if (rook.moveCount !== 0 || king.moveCount !== 0) {
            return false;
        }

        if (this.inCheck(king.color, squares)) {
            return false;
        }

        let rookNumericPosition = [Number(getNumericPosition(rook.squareId)[0]), Number(getNumericPosition(rook.squareId)[1])];
        let kingNumericPosition = [Number(getNumericPosition(king.squareId)[0]), Number(getNumericPosition(king.squareId)[1])];

        let horizontalOffset = kingNumericPosition[0] - rookNumericPosition[0];
        let counter = horizontalOffset > 0 ? 1 : -1;

        for (let i = rookNumericPosition[0] + counter; i !== kingNumericPosition[0]; i += counter) {
            let intermediatePosition = getRegularPosition([i, rookNumericPosition[1]]);

            // Check if intermediate squares are empty and not under attack
            if (squares[intermediatePosition] !== null || this.squareUnderAttack(intermediatePosition, opposingColor, squares)) {
                return false;
            }
        }

        let newKingPosition = getRegularPosition([kingNumericPosition[0] + (horizontalOffset > 0 ? -2 : 2), kingNumericPosition[1]]);
        // Check if the destination square for the king is under attack
        if (this.squareUnderAttack(newKingPosition, opposingColor, squares)) {
            return false;
        }

        return true;
    }
}