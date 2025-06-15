// src/component/GameMode/PlayWithBot/ChessBoard.jsx
import React from 'react';
import './Style/ChessBoard.css';
import { ChessEngine } from './chess-engine';

// Import piece images
import b_b from '../../../assets/b_b.png';
import b_w from '../../../assets/b_w.png';
import k_b from '../../../assets/k_b.png';
import k_w from '../../../assets/k_w.png';
import n_b from '../../../assets/n_b.png';
import n_w from '../../../assets/n_w.png';
import p_b from '../../../assets/p_b.png';
import p_w from '../../../assets/p_w.png';
import q_b from '../../../assets/q_b.png';
import q_w from '../../../assets/q_w.png';
import r_b from '../../../assets/r_b.png';
import r_w from '../../../assets/r_w.png';

const pieceImages = {
    'black_bishop': b_b,
    'white_bishop': b_w,
    'black_king': k_b,
    'white_king': k_w,
    'black_knight': n_b,
    'white_knight': n_w,
    'black_pawn': p_b,
    'white_pawn': p_w,
    'black_queen': q_b,
    'white_queen': q_w,
    'black_rook': r_b,
    'white_rook': r_w,
};

const ChessBoard = ({ gameState, selectedSquare, validMoves, onSquareClick, isThinking, playerColor }) => {
    // Kiểm tra xem một ô có phải là nước đi hợp lệ không
    const isValidMove = (row, col) => {
        return validMoves && validMoves.some(move => move.row === row && move.col === col);
    };

    // Kiểm tra xem một ô có thể ăn quân không
    const isCapturableSquare = (row, col) => {
        if (!validMoves || !validMoves.some(move => move.row === row && move.col === col)) {
            return false;
        }
        const piece = gameState.board[row][col];
        return piece !== null;
    };

    // Kiểm tra xem một ô có được chọn không
    const isSelected = (row, col) => {
        return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
    };

    // Kiểm tra xem vua có đang bị chiếu không và trả về vị trí vua
    const getCheckedKingPosition = () => {
        if (!gameState) return null;
        const whiteKingPos = ChessEngine.findKing(gameState, 'white');
        const blackKingPos = ChessEngine.findKing(gameState, 'black');

        if (ChessEngine.isInCheck(gameState, 'white') && whiteKingPos) {
            return whiteKingPos;
        }
        if (ChessEngine.isInCheck(gameState, 'black') && blackKingPos) {
            return blackKingPos;
        }
        return null;
    };

    // Kiểm tra xem một ô có phải là vị trí vua đang bị chiếu không
    const isCheckedKing = (row, col) => {
        const checkedKingPos = getCheckedKingPosition();
        return checkedKingPos && checkedKingPos.row === row && checkedKingPos.col === col;
    };

    // Lấy class cho ô cờ
    const getSquareClass = (row, col) => {
        let className = 'square';
        className += (row + col) % 2 === 0 ? ' light' : ' dark';
        if (isSelected(row, col)) className += ' selected';
        if (isValidMove(row, col)) className += ' valid-move';
        if (isCapturableSquare(row, col)) className += ' can-capture';
        if (isCheckedKing(row, col)) className += ' checked';
        return className;
    };

    // Lấy class cho quân cờ
    const getPieceClass = (piece) => {
        if (!piece) return '';
        return `piece ${piece.replace('_', '-')}`;
    };

    // Chuẩn bị dữ liệu bàn cờ dựa trên màu quân của người chơi
    const prepareBoard = () => {
        let board = [...gameState.board];
        if (playerColor === 'black') {
            board = board.slice().reverse().map(row => row.slice().reverse());
        }
        return board;
    };

    return (
        <div className="chess-board">
            {prepareBoard().map((row, displayRowIndex) => {
                const actualRowIndex = playerColor === 'black' ? 7 - displayRowIndex : displayRowIndex;
                return (
                    <div key={actualRowIndex} className="board-row">
                        {row.map((piece, displayColIndex) => {
                            const actualColIndex = playerColor === 'black' ? 7 - displayColIndex : displayColIndex;
                            return (
                                <div
                                    key={`${actualRowIndex}-${actualColIndex}`}
                                    className={getSquareClass(actualRowIndex, actualColIndex)}
                                    onClick={() => onSquareClick(actualRowIndex, actualColIndex)}
                                >
                                    {piece && (
                                        <div className="piece">
                                            <img
                                                src={pieceImages[piece]}
                                                alt={piece}
                                                className="piece-image"
                                                draggable={false}
                                            />
                                        </div>
                                    )}
                                    {isValidMove(actualRowIndex, actualColIndex) && !piece && (
                                        <div className="move-dot" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default ChessBoard;