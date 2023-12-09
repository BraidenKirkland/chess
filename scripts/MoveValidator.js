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
        const neighborSquare = this.getNeighborSquareForEnPassant(takingPawn, diagonalSquare);
        const pieceOnNeighborSquare = squares[neighborSquare];

        if (!pieceOnNeighborSquare || pieceOnNeighborSquare.type !== 'pawn' || pieceOnNeighborSquare.color === takingPawn.color) {
            return false;
        }

        if (squares[diagonalSquare]) {
            return false;
        }

        return this.isPawnAdvancedThreeRanks(takingPawn) &&
               this.isCapturedPawnValidForEnPassant(pieceOnNeighborSquare) &&
               this.isLastMoveByCapturedPawn(numMovesMade, pieceOnNeighborSquare);
    }

    isPawnAdvancedThreeRanks(pawn) {
        return pawn.ranksAdvanced === 3;
    }

    isCapturedPawnValidForEnPassant(capturedPawn) {
        return capturedPawn.ranksAdvanced === 2 && capturedPawn.moveCount === 1;
    }

    isLastMoveByCapturedPawn(numMovesMade, capturedPawn) {
        return numMovesMade === capturedPawn.numberOfMostRecentMove;
    }

    getNeighborSquareForEnPassant(pawn, diagonalSquare) {
        if (pawn.color === 'white') {
            return diagonalSquare[0] + String((Number(diagonalSquare[1]) - 1));
        } else {
            return diagonalSquare[0] + String((Number(diagonalSquare[1]) + 1));
        }
    }

    inCheck(color, squares, numMovesMade) {
        const kingSquareId = this.getKingPosition(color, squares);
        if (!kingSquareId) return false;

        for (const [squareId, piece] of Object.entries(squares)) {
            if (piece && piece.color !== color) {
                const validMoves = this.getValidMoves(squareId, squares, numMovesMade);
                if (validMoves.includes(kingSquareId)) {
                    return true;
                }
            }
        }

        return false;
    }

    getKingPosition(color, squares) {
        for (const [squareId, piece] of Object.entries(squares)) {
            if (piece && piece.color === color && piece.type === 'king') {
                return squareId;
            }
        }
        return null;
    }

    getAllPiecesForColor(color, squares) {
        const piecesForColor = [];
        for (const [squareId, piece] of Object.entries(squares)) {

            if (piece !== null && piece.color === color) {
                piece.squareId = squareId;
                piecesForColor.push(piece)
            }
        }

        return piecesForColor;
    }

    // Check if 'color' has been checkmated
    isCheckMate(color, squares, numMovesMade) {
        // Adding this as assurance
        if (!this.inCheck(color, squares, numMovesMade)) return false;

        const piecesForColor = this.getAllPiecesForColor(color, squares);

        for (const piece of piecesForColor) {
            const validMoves = this.getValidMoves(piece.squareId, squares, numMovesMade);

            for (const move of validMoves) {
                if(this.moveRemovesCheck(piece, move, squares, numMovesMade)) return false
            }
        }

        console.log('CHECKMATE !!!!!');
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

        const piecesForColor = this.getAllPiecesForColor(color, squares);

        for(const piece of piecesForColor) {
            const validMoves = this.getValidMoves(piece.squareId.slice(), squares, numMovesMade);

            for(const move of validMoves) {
                if(!this.moveCreatesCheck(piece, squares, move)) return false;
            }
        }

        console.log('STALEMATE');
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
        if(!this.areCastlingPiecesEligible(king, rook)) {
            return false;
        }

        if(this.inCheck(king.color, squares, numMovesMade)) {
            return false;
        }

        const rookPosition = getNumericPosition(rook.squareId);
        const kingPosition = getNumericPosition(king.squareId);
        const opposingColor = this.opposingColor(king.color);

        if (!this.isPathBetweenKingAndRookClear(rookPosition, kingPosition, opposingColor, squares, numMovesMade)) {
            return false;
        }

        const newKingPosition = this.calculateNewKingPosition(kingPosition, rookPosition);
        if (this.squareUnderAttack(newKingPosition, opposingColor, squares, numMovesMade)) {
            return false;
        }

        return true;

    }

    areCastlingPiecesEligible(rook, king) {
        return rook.color === king.color && rook.moveCount === 0 && king.moveCount === 0;
    }

    isPathBetweenKingAndRookClear(rookPosition, kingPosition, opposingColor, squares, numMovesMade) {
        const horizontalDirection = kingPosition[0] > rookPosition[0] ? 1 : -1;
        for (let x = rookPosition[0] + horizontalDirection; x !== kingPosition[0]; x += horizontalDirection) {
            const intermediatePosition = getRegularPosition([x, rookPosition[1]]);
            const squareUnderAttack = this.squareUnderAttack(intermediatePosition, opposingColor, squares, numMovesMade);

            if (squares[intermediatePosition] !== null || squareUnderAttack) {
                return false;
            }
        }
        return true;
    }

    opposingColor(color) {
        return color === 'white' ? 'black' : 'white';
    }

    calculateNewKingPosition(kingPosition, rookPosition) {
        const horizontalOffset = kingPosition[0] > rookPosition[0] ? -2 : 2;
        return getRegularPosition([kingPosition[0] + horizontalOffset, kingPosition[1]]);
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