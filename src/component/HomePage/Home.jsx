import React, { useState } from 'react';
import { User, Bot, Search, Settings, Info } from 'lucide-react';
import '../../Css/HomePage/Home.css';

// Import chess piece images
import blackRook from '../../assets/r_b.png';
import blackKnight from '../../assets/n_b.png';
import blackBishop from '../../assets/b_b.png';
import blackQueen from '../../assets/q_b.png';
import blackKing from '../../assets/k_b.png';
import blackPawn from '../../assets/p_b.png';
import whiteRook from '../../assets/r_w.png';
import whiteKnight from '../../assets/n_w.png';
import whiteBishop from '../../assets/b_w.png';
import whiteQueen from '../../assets/q_w.png';
import whiteKing from '../../assets/k_w.png';
import whitePawn from '../../assets/p_w.png';

const ChessHomepage = () => {
    const [activeMode, setActiveMode] = useState(null);
    const [useImages, setUseImages] = useState(true); // Set default to true

    // Chess piece image paths
    const pieceImages = {
        'black-rook': blackRook,
        'black-knight': blackKnight,
        'black-bishop': blackBishop,
        'black-queen': blackQueen,
        'black-king': blackKing,
        'black-pawn': blackPawn,
        'white-rook': whiteRook,
        'white-knight': whiteKnight,
        'white-bishop': whiteBishop,
        'white-queen': whiteQueen,
        'white-king': whiteKing,
        'white-pawn': whitePawn
    };

    // Initial chess board setup
    const initialBoard = [
        ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
        ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
        ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
    ];

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    const renderSquare = (piece, row, col) => {
        const isLight = (row + col) % 2 === 0;
        const squareClass = isLight ? 'square-light' : 'square-dark';

        return (
            <div
                key={`${row}-${col}`}
                className={`chess-square ${squareClass}`}
            >
                {piece && (
                    <img
                        src={pieceImages[piece]}
                        alt={piece}
                        className="piece-image"
                    />
                )}
            </div>
        );
    };

    const renderBoard = () => {
        return (
            <div className="board-container">
                <div className="chess-board">
                    {initialBoard.map((row, rowIndex) =>
                        row.map((piece, colIndex) => renderSquare(piece, rowIndex, colIndex))
                    )}
                </div>

                {/* File labels (a-h) */}
                <div className="file-labels">
                    {files.map((file, index) => (
                        <div key={file} className="file-label">
                            {file}
                        </div>
                    ))}
                </div>

                {/* Rank labels (1-8) */}
                <div className="rank-labels">
                    {ranks.map((rank) => (
                        <div key={rank} className="rank-label">
                            {rank}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="chess-homepage">
            <div className="main-container">

                {/* Left Sidebar */}
                <div className="sidebar">

                    {/* Header */}
                    <div className="section-card">
                        <h1 className="main-title">Chess Play</h1>
                        <p className="subtitle">Tạo chơi cờ vua trực tuyến</p>
                    </div>

                    {/* User Info */}
                    <div className="section-card">
                        <div className="user-info">
                            <div className="user-avatar">
                                <User size={24} />
                            </div>
                            <div className="user-details">
                                <h3 className="user-name">Người dùng</h3>
                                <p className="user-rating">Rating: 1200</p>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                        <p className="user-level">Cấp độ: Trung cấp</p>
                    </div>

                    {/* Game Modes */}
                    <div className="section-card">
                        <h3 className="section-title">Chế độ chơi</h3>

                        <div className="game-modes">
                            <button
                                onMouseDown={() => setActiveMode('friend')}
                                onMouseUp={() => setActiveMode(null)}
                                onMouseLeave={() => setActiveMode(null)}
                                className={`mode-button ${activeMode === 'friend' ? 'active' : ''}`}
                            >
                                <div className="mode-icon friend-icon">
                                    <User size={16} />
                                </div>
                                <div className="mode-content">
                                    <div className="mode-title">Chơi với bạn</div>
                                    <div className="mode-subtitle">Người vs Người</div>
                                </div>
                            </button>

                            <button
                                onMouseDown={() => setActiveMode('bot')}
                                onMouseUp={() => setActiveMode(null)}
                                onMouseLeave={() => setActiveMode(null)}
                                className={`mode-button ${activeMode === 'bot' ? 'active' : ''}`}
                            >
                                <div className="mode-icon bot-icon">
                                    <Bot size={16} />
                                </div>
                                <div className="mode-content">
                                    <div className="mode-title">Chơi với bot</div>
                                    <div className="mode-subtitle">Người vs Máy</div>
                                </div>
                            </button>

                            <button
                                onMouseDown={() => setActiveMode('online')}
                                onMouseUp={() => setActiveMode(null)}
                                onMouseLeave={() => setActiveMode(null)}
                                className={`mode-button ${activeMode === 'online' ? 'active' : ''}`}
                            >
                                <div className="mode-icon online-icon">
                                    <Search size={16} />
                                </div>
                                <div className="mode-content">
                                    <div className="mode-title">Chơi trực tuyến</div>
                                    <div className="mode-subtitle">Tìm đối thủ</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="section-card">
                        <h3 className="section-title">Điều khiển</h3>

                        <div className="controls">
                            <button className="control-button">
                                <div className="control-content">
                                    <Info size={16} />
                                    <span>Thông tin người chơi</span>
                                </div>
                            </button>

                            <button className="control-button">
                                <div className="control-content">
                                    <Settings size={16} />
                                    <span>Cài đặt</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chess Board */}
                <div className="board-section">
                    <div className="board-wrapper">
                        {renderBoard()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChessHomepage;