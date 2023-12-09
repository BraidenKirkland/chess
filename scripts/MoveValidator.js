import { getNumericPosition, getRegularPosition } from "./helpers.js";

export class MoveValidator {
    
    validMove(srcSquareId, dstSquareId, piece, squares, numMovesMade) {

        // Cannot move to the square if it is occupied by a same color piece
        if (this.isOccupiedBySameColor(dstSquareId, piece, squares)) {
            return false;
        }

        // The one and only check for the knight has already been passed
        // This is because there is no need to check intermediate squares
        if (piece.type === 'knight') {
            return true;
        }

        if(piece.type === 'pawn') {
            return this.isValidPawnMove(srcSquareId, dstSquareId, piece, squares, numMovesMade);
        }

        return this.isPathClear(srcSquareId, dstSquareId, squares)
    }

    isOccupiedBySameColor(dstSquareId, piece, squares) {
        return squares[dstSquareId] !== null && squares[dstSquareId].color === piece.color;
    }

    isValidPawnMove(srcSquareId, dstSquareId, piece, squares, numMovesMade) {
        const [srcX, srcY] = getNumericPosition(srcSquareId);
        const [dstX, dstY] = getNumericPosition(dstSquareId);
        const horizontal = srcX - dstX;
        const vertical = srcY - dstY;

        // Handle Diagonal Pawn Move
        if (horizontal !== 0) {
            return this.isValidPawnDiagonalMove(srcSquareId, dstSquareId, piece, squares, numMovesMade);
        }

        // Handle Vertical Pawn Move
        return this.isPawnVerticalMoveValid(srcSquareId, dstSquareId, piece, squares, vertical);
    }

    isValidPawnDiagonalMove(srcSquareId, dstSquareId, piece, squares, numMovesMade) {
        if (piece.type !== 'pawn') return false;

        const [srcX, srcY] = getNumericPosition(srcSquareId);
        const [dstX, dstY] = getNumericPosition(dstSquareId);

        const direction = piece.color === 'white' ? 1 : -1;
        const verticalDistance = (dstY - srcY) * direction;
        const horizontalDistance = Math.abs(dstX - srcX);

        // Pawns capture diagonally
        if (verticalDistance === 1 && horizontalDistance === 1) {
            if (squares[dstSquareId] !== null && squares[dstSquareId].color !== piece.color) {
                // Normal capture
                return true;
            } else if (this.enPassantAllowed(piece, dstSquareId, squares, numMovesMade)) {
                // En passant capture
                return true;
            }
        }

        return false;
    }

    isPawnVerticalMoveValid(srcSquareId, dstSquareId, piece, squares) {
        if (piece.type !== 'pawn') return false;

        const [srcX, srcY] = getNumericPosition(srcSquareId);
        const [dstX, dstY] = getNumericPosition(dstSquareId);

        // Pawns can only move forward vertically
        if (srcX !== dstX) return false;

        const direction = piece.color === 'white' ? 1 : -1;
        const verticalDistance = (dstY - srcY) * direction;

        // Check for a valid one-square move or initial two-square move
        if (verticalDistance === 1 && squares[dstSquareId] === null) {
            return true;
        } else if (verticalDistance === 2 && piece.moveCount === 0 && squares[dstSquareId] === null) {
            // Check the square directly in front of the pawn
            const intermediateSquare = getRegularPosition([srcX, srcY + direction]);

            return squares[intermediateSquare] === null;
        }

        return false;
    }

    isPathClear(srcSquareId, dstSquareId, squares) {
        // Get positions
        const [srcX, srcY] = getNumericPosition(srcSquareId);
        const [dstX, dstY] = getNumericPosition(dstSquareId);

        // Determine the type of movement
        const isHorizontal = srcY === dstY;
        const isVertical = srcX === dstX;
        const isDiagonal = Math.abs(dstX - srcX) === Math.abs(dstY - srcY);

        // Call the appropriate method
        if (isHorizontal) return this.isHorizontalPathClear(srcX, dstX, srcY, squares);
        if (isVertical) return this.isVerticalPathClear(srcY, dstY, srcX, squares);
        if (isDiagonal) return this.isDiagonalPathClear(srcX, srcY, dstX, dstY, squares);

        return false;
    }

    isHorizontalPathClear(srcX, dstX, y, squares) {
        const start = Math.min(srcX, dstX) + 1;
        const end = Math.max(srcX, dstX);

        for (let x = start; x < end; x++) {
            if (squares[getRegularPosition([x, y])] !== null) {
                return false;
            }
        }

        return true;
    }

    isVerticalPathClear(srcY, dstY, x, squares) {
        const start = Math.min(srcY, dstY) + 1;
        const end = Math.max(srcY, dstY);

        for (let y = start; y < end; y++) {
            if (squares[getRegularPosition([x, y])] !== null) {
                return false;
            }
        }

        return true;
    }

    isDiagonalPathClear(srcX, srcY, dstX, dstY, squares) {
        const xDirection = dstX > srcX ? 1 : -1;
        const yDirection = dstY > srcY ? 1 : -1;
        let currentX = srcX + xDirection;
        let currentY = srcY + yDirection;

        while (currentX !== dstX && currentY !== dstY) {
            if (squares[getRegularPosition([currentX, currentY])] !== null) {
                return false;
            }
            currentX += xDirection;
            currentY += yDirection;
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

        // TODO: Dec 7, 2023 - This might not cover every case
        // Rule Three: The captured pawn must have made the last move
        if (numMovesMade !== pieceOnNeighborSquare.numberOfMostRecentMove) {
            return false;
        }

        return true;
    }

    /* 
     Check to see if the king belonging to the input value of color is in check
 */
    inCheck(color, squares, numMovesMade) {

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
            enemyPieceValidMoves = this.getValidMoves(enemyPiece.squareId, squares, numMovesMade);

            if (enemyPieceValidMoves.includes(kingSquareId)) {
                console.log('IN CHECK !!!!!');
                return true;
            }
        }

        return false;
    }

    /* 
        Check if 'color' has been checkmated

        Assumption is that the king is already in check
    */
    isCheckMate(color, squares, numMovesMade) {

        /* 
           For every piece of this color
                1. Get the valid moves for that piece
                    For each move in valid moves
                        if(moveRemovesCheck(piece, move)) 
                            return false  -> check was removed
                
                2. return true -> none of the valid moves for any piece removes the check; therefore, checkmate
        */

        // Adding this as assurance
        if (!this.inCheck(color, squares, numMovesMade)) {
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
            let validMoves = this.getValidMoves(currentPiece.squareId.slice(), squares, numMovesMade);

            // Iterate through all valid moves for each piece
            for (let j = 0; j < validMoves.length; j++) {
                move = validMoves[j];
                // Check whether moving this piece to one of its valid moves will remove the check on the king
                if (this.moveRemovesCheck(currentPiece, move, squares)) {
                    return false;
                }
            }
        }

        console.log('CHECKMATE !!!!!');

        // If this far, then it must be a checkmate
        return true;
    }

    /* 
        The king is already in check
        Does moving pieceToMove to newPosition remove the check on the king?
    */
    moveRemovesCheck(pieceToMove, newPosition, squares, numMovesMade) {

        let currentPositionOfPiece = pieceToMove.squareId;
        let piecePresentlyInNewPosition = squares[newPosition];

        // Alter the board temporarily
        squares[currentPositionOfPiece] = null;
        squares[newPosition] = pieceToMove;

        // Perform the swap and run the inCheck function
        let retVal = !this.inCheck(pieceToMove.color, squares, numMovesMade);

        // Set the board back to its original state
        squares[newPosition] = piecePresentlyInNewPosition;
        squares[currentPositionOfPiece] = pieceToMove;


        return retVal;
    }

    getValidMoves(squareId, squares, numMovesMade) {
        let currentPiece = squares[squareId];
        if(!currentPiece) {
            return [];
        }

        if(currentPiece.type === 'pawn') {
            return this.allValidPawnMoves(currentPiece, squareId, squares, numMovesMade);
        }

        return this.allValidNonPawnMoves(currentPiece, squareId, squares, numMovesMade);
    }

    allValidPawnMoves(piece, srcSquareId, squares, numMovesMade) {
        const validMoves = [];
        const startingPosition = getNumericPosition(srcSquareId);
        const fwdMoves = piece.getFwdMoves();
        const killMoves = piece.moves;

        // Forward moves
        fwdMoves.forEach(move => {
            let newPosition = [
                startingPosition[0] + (piece.color === 'white' ? move[0] : -move[0]),
                startingPosition[1] + (piece.color === 'white' ? move[1] : -move[1])
            ];
            this.addValidMove(srcSquareId, newPosition, piece, squares, numMovesMade, validMoves);
        });

        // Kill moves
        killMoves.forEach(move => {
            let newPosition = [
                startingPosition[0] + (piece.color === 'white' ? move[0] : -move[0]),
                startingPosition[1] + (piece.color === 'white' ? move[1] : -move[1])
            ];
            this.addValidMove(srcSquareId, newPosition, piece, squares, numMovesMade, validMoves);
        });

        return validMoves;
    }

    allValidNonPawnMoves(piece, srcSquareId, squares, numMovesMade) {
        const validMoves = [];
        const startingPosition = getNumericPosition(srcSquareId);

        piece.moves.forEach(move => {
            for (let j = 1; j < 8; j++) {
                let newPosition = [
                    startingPosition[0] + move[0] * j,
                    startingPosition[1] + move[1] * j
                ];
                this.addValidMove(srcSquareId, newPosition, piece, squares, numMovesMade, validMoves);
                if (piece.limitations) break;
            }
        });

        return validMoves;
    }

    addValidMove(srcSquareId, newPosition, piece, squares, numMovesMade, validMoves) {
        if (this.isPositionOnBoard(newPosition)) {
            let dstSquareId = getRegularPosition(newPosition);
            if (this.validMove(srcSquareId, dstSquareId, piece, squares, numMovesMade)) {
                validMoves.push(dstSquareId);
            }
        }
    }
    
    /* 
    Check if moving the input piece would result in a check on its color's king
    TODO: The method is currently oversimplified. Need to consider where the piece is going 
        to be moved to because it may kill the piece causing the check
        **** maybe moveRemovesCheck() can handle this ???? ****

        ASSUMES THAT THE MOVE IS VALID
    */
    moveCreatesCheck(pieceToMove, squares, newPosition = null, numMovesMade) {
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
        retVal = this.inCheck(pieceToMove.color, squares, numMovesMade);

        // Reset the board
        squares[currentPosition] = pieceToMove;
        squares[newPosition] = piecePresentlyInNewPosition;

        return retVal;
    }

    isStaleMate(color, squares, numMovesMade) {
        // Cannot be a stalemate if the piece is already in check
        if (this.inCheck(color, squares, numMovesMade)) {
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
            let validMoves = this.getValidMoves(currentPiece.squareId.slice(), squares, numMovesMade);

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

        console.log('IS STALEMATE !!!!');
        // No valid moves except those that create check
        return true;
    }

    squareUnderAttack(squareId, opposingColor, squares, numMovesMade) {
        // TODO: Check the rules to see what to do if the opposing side is in check
        let validMoves;
        for (const [square, piece] of Object.entries(squares)) {
            if (piece !== null && piece.color === opposingColor) {
                validMoves = this.getValidMoves(square, squares, numMovesMade);
                // TODO: May need a special check for pawns trying to move forward as they are not "attacking"
                //       However, they will be able to attack both diagonals
                if (validMoves.includes(squareId)) {
                    return true;
                }
            }
        }

        return false;
    }

    castlingAllowed(rook, king, squares, numMovesMade) {
        if (rook.color !== king.color) {
            return false;
        }

        let opposingColor = (king.color === 'white' ? 'black' : 'white');

        // Castling is only allowed if neither the rook nor the king have moved
        if (rook.moveCount !== 0 || king.moveCount !== 0) {
            return false;
        }

        if (this.inCheck(king.color, squares, numMovesMade)) {
            return false;
        }

        let rookNumericPosition = getNumericPosition(rook.squareId);
        let kingNumericPosition = getNumericPosition(king.squareId);

        let horizontalOffset = kingNumericPosition[0] - rookNumericPosition[0];
        let counter = horizontalOffset > 0 ? 1 : -1;

        for (let i = rookNumericPosition[0] + counter; i !== kingNumericPosition[0]; i += counter) {
            let intermediatePosition = getRegularPosition([i, rookNumericPosition[1]]);

            // Check if intermediate squares are empty and not under attack
            if (squares[intermediatePosition] !== null || this.squareUnderAttack(intermediatePosition, opposingColor, squares, numMovesMade)) {
                return false;
            }
        }

        let newKingPosition = getRegularPosition([kingNumericPosition[0] + (horizontalOffset > 0 ? -2 : 2), kingNumericPosition[1]]);
        // Check if the destination square for the king is under attack
        if (this.squareUnderAttack(newKingPosition, opposingColor, squares, numMovesMade)) {
            return false;
        }

        return true;
    }

    isPositionOnBoard(position) {
        if (position[0] > 7 || position[0] < 0) {
            return false;
        }
        if (position[1] > 7 || position[1] < 0) {
            return false;
        }

        return true;
    }
}