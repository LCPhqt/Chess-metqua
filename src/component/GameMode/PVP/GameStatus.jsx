// src/component/GameMode/GameStatus.jsx
import React from 'react';
import './Style/GameStatus.css';

const GameStatus = ({ currentPlayer, gameStatus, isThinking, playerColor }) => {
    const botColor = playerColor === 'white' ? 'black' : 'white';

    const getStatusMessage = () => {
        if (isThinking) {
            return "Bot đang suy nghĩ...";
        }

        switch (gameStatus) {
            case 'check':
                return `${currentPlayer === playerColor ? 'Bạn' : 'Bot'} đang bị chiếu!`;
            case 'checkmate':
                return `${currentPlayer === playerColor ? 'Bot thắng!' : 'Bạn thắng!'} - Chiếu hết`;
            case 'stalemate':
                return "Hòa cờ - Bế tắc";
            default:
                return `Lượt của ${currentPlayer === playerColor ? 'bạn' : 'bot'}`;
        }
    };

    const getStatusClass = () => {
        let className = 'game-status';

        if (isThinking) {
            className += ' thinking';
        } else if (gameStatus === 'check') {
            className += ' check';
        } else if (gameStatus === 'checkmate') {
            className += ' checkmate';
        } else if (gameStatus === 'stalemate') {
            className += ' stalemate';
        } else if (currentPlayer === playerColor) {
            className += ' player-turn';
        } else {
            className += ' bot-turn';
        }

        return className;
    };

    return (
        <div className="game-status-container">
            <div className={getStatusClass()}>
                <div className="status-icon">
                    {isThinking && <div className="thinking-spinner"></div>}
                    {gameStatus === 'check' && '⚠️'}
                    {gameStatus === 'checkmate' && '🏆'}
                    {gameStatus === 'stalemate' && '🤝'}
                    {gameStatus === 'playing' && !isThinking && (currentPlayer === playerColor ? '👤' : '🤖')}
                </div>

                <div className="status-text">
                    <h3>{getStatusMessage()}</h3>
                    {gameStatus === 'playing' && !isThinking && (
                        <p className="turn-indicator">
                            {currentPlayer === playerColor ?
                                `Quân ${playerColor === 'white' ? 'trắng' : 'đen'} (Bạn)` :
                                `Quân ${botColor === 'white' ? 'trắng' : 'đen'} (Bot)`}
                        </p>
                    )}
                </div>
            </div>

            {gameStatus === 'playing' && (
                <div className="game-info">
                    <div className="player-info">
                        <div className={`player ${currentPlayer === playerColor ? 'active' : ''}`}>
                            <span className="player-icon">👤</span>
                            <span>Bạn ({playerColor === 'white' ? 'Trắng' : 'Đen'})</span>
                        </div>
                        <div className={`player ${currentPlayer !== playerColor ? 'active' : ''}`}>
                            <span className="player-icon">🤖</span>
                            <span>Bot ({botColor === 'white' ? 'Trắng' : 'Đen'})</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameStatus;