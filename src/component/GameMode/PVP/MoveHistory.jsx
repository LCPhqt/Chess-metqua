// src/component/GameMode/MoveHistory.jsx
import React from 'react';
import './Style/MoveHistory.css';

const MoveHistory = ({ moves, playerColor }) => {
    const pieceSymbols = {
        'white_king': '♔', 'white_queen': '♕', 'white_rook': '♖',
        'white_bishop': '♗', 'white_knight': '♘', 'white_pawn': '♙',
        'black_king': '♚', 'black_queen': '♛', 'black_rook': '♜',
        'black_bishop': '♝', 'black_knight': '♞', 'black_pawn': '♟'
    };

    const formatMove = (move, index) => {
        const pieceSymbol = pieceSymbols[move.piece] || '';
        const playerName = move.player === 'white' ? 'Bạn' : 'Bot';
        const fromSquare = positionToSquare(move.from);
        const toSquare = positionToSquare(move.to);

        return {
            moveNumber: Math.floor(index / 2) + 1,
            player: playerName,
            piece: pieceSymbol,
            notation: `${fromSquare} → ${toSquare}`,
            isWhite: move.player === 'white'
        };
    };

    const positionToSquare = (position) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return files[position.col] + (8 - position.row);
    };

    const groupMovesByPair = (moves) => {
        const pairs = [];
        for (let i = 0; i < moves.length; i += 2) {
            const whiteMove = moves[i];
            const blackMove = moves[i + 1];

            pairs.push({
                moveNumber: Math.floor(i / 2) + 1,
                white: whiteMove ? formatMove(whiteMove, i) : null,
                black: blackMove ? formatMove(blackMove, i + 1) : null
            });
        }
        return pairs;
    };

    const movePairs = groupMovesByPair(moves);

    const formatMoveNumber = (index) => {
        return Math.floor(index / 2) + 1;
    };

    return (
        <div className="move-history">
            <h3>Lịch sử nước đi</h3>
            <div className="moves-list">
                {moves.length === 0 ? (
                    <p className="no-moves">Chưa có nước đi nào</p>
                ) : (
                    <div className="moves-table">
                        {moves.map((move, index) => (
                            <div key={index} className="move-row">
                                <span className="move-number">{formatMoveNumber(index)}.</span>
                                <span className={`move-notation ${move.player === playerColor ? 'player-move' : 'bot-move'}`}>
                                    {move.notation}
                                    <span className="move-indicator">
                                        {move.player === playerColor ? ' (Bạn)' : ' (Bot)'}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {moves.length > 0 && (
                <div className="move-stats">
                    <p>Tổng số nước đi: {moves.length}</p>
                    <p>Nước đi cuối: {moves[moves.length - 1]?.player === playerColor ? 'Bạn' : 'Bot'}</p>
                </div>
            )}
        </div>
    );
};

export default MoveHistory;