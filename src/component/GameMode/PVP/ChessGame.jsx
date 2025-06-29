// src/component/GameMode/PlayWithBot/ChessGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChessBoard from './ChessBoard';
import GameStatus from './GameStatus';
import MoveHistory from './MoveHistory';
import { ChessEngine } from './chess-engine';
import { ChessBot } from './chess-bot';
import PromotionDialog from './PromotionDialog';
import './Style/ChessGame.css';

const ChessGame = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const playerColor = location.state?.playerColor || 'white';
    const botColor = playerColor === 'white' ? 'black' : 'white';
    const [gameState, setGameState] = useState(() => ChessEngine.getInitialState());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, check, checkmate, stalemate
    const [currentPlayer, setCurrentPlayer] = useState('white');
    const [moveHistory, setMoveHistory] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [promotionState, setPromotionState] = useState(null);
    const [showGameOverDialog, setShowGameOverDialog] = useState(false);

    const chessBot = new ChessBot();

    // Khởi tạo game và cho bot đi trước nếu bot là quân trắng
    useEffect(() => {
        if (botColor === 'white') {
            handleBotMove();
        }
    }, []);

    // Kiểm tra trạng thái game sau mỗi nước đi
    useEffect(() => {
        try {
            console.log("Kiểm tra trạng thái game...");
            console.log("Lượt chơi hiện tại:", currentPlayer);

            const status = ChessEngine.getGameStatus(gameState, currentPlayer);
            console.log("Trạng thái game:", status);
            setGameStatus(status);

            if (status === 'checkmate') {
                console.log("Game kết thúc - Chiếu hết!");
                setShowGameOverDialog(true);
                return;
            }

            // Nếu đến lượt bot và game chưa kết thúc
            if (currentPlayer === botColor && status !== 'checkmate') {
                handleBotMove();
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái game:", error);
        }
    }, [currentPlayer, gameState]);

    const handleBotMove = async () => {
        try {
            // Kiểm tra xem có phải lượt của bot không
            if (currentPlayer !== botColor) {
                console.log("Không phải lượt của bot");
                return;
            }

            setIsThinking(true);
            console.log("Bot bắt đầu tìm nước đi...");

            // Kiểm tra trạng thái game trước khi bot di chuyển
            const currentStatus = ChessEngine.getGameStatus(gameState, botColor);
            if (currentStatus === 'checkmate' || currentStatus === 'stalemate') {
                console.log("Game đã kết thúc!");
                setGameStatus(currentStatus);
                setShowGameOverDialog(true);
                setIsThinking(false);
                return;
            }

            // Delay nhỏ để UX tự nhiên hơn
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                const botMove = await chessBot.getBestMove(gameState, botColor);
                console.log("Bot đã tìm được nước đi:", botMove);

                if (botMove) {
                    console.log("Bot thực hiện nước đi:", botMove);
                    let newGameState = ChessEngine.makeMove(gameState, botMove.from, botMove.to);

                    // Kiểm tra phong tướng cho bot
                    const movingPiece = gameState.board[botMove.from.row][botMove.from.col];
                    const isPawn = ChessEngine.getPieceType(movingPiece) === 'pawn';
                    if (isPawn && ChessEngine.canPromote(botMove.to.row, botColor)) {
                        console.log("Bot phong tướng thành hậu");
                        newGameState = ChessEngine.promotePawn(newGameState, botMove.to.row, botMove.to.col, botColor, 'queen');
                    }

                    // Cập nhật state game
                    setGameState(newGameState);
                    setMoveHistory(prev => [...prev, {
                        from: botMove.from,
                        to: botMove.to,
                        piece: gameState.board[botMove.from.row][botMove.from.col],
                        player: botColor,
                        notation: ChessEngine.getMoveNotation(gameState, botMove)
                    }]);
                    setCurrentPlayer(playerColor);

                    // Kiểm tra lại trạng thái game
                    const status = ChessEngine.getGameStatus(newGameState, playerColor);
                    setGameStatus(status);
                    if (status === 'checkmate' || status === 'stalemate') {
                        setShowGameOverDialog(true);
                    }
                } else {
                    console.log("Bot không tìm được nước đi hợp lệ");
                    setGameStatus('stalemate');
                    setShowGameOverDialog(true);
                }
            } catch (error) {
                console.error("Lỗi trong quá trình bot di chuyển:", error);
            }

            setIsThinking(false);
        } catch (error) {
            console.error("Lỗi trong handleBotMove:", error);
            setIsThinking(false);
        }
    };

    const handleSquareClick = (row, col) => {
        try {
            if (currentPlayer !== playerColor || isThinking) {
                console.log("Không thể di chuyển: Đang là lượt bot hoặc bot đang suy nghĩ");
                return;
            }

            const clickedSquare = { row, col };
            const piece = gameState.board[row][col];

            if (selectedSquare) {
                if (validMoves.some(move => move.row === row && move.col === col)) {
                    console.log("Thực hiện nước đi từ", selectedSquare, "đến", clickedSquare);
                    makeMove(selectedSquare, clickedSquare);
                } else if (piece && ChessEngine.getPieceColor(piece) === playerColor) {
                    console.log("Chọn quân mới:", clickedSquare);
                    selectSquare(clickedSquare);
                } else {
                    console.log("Bỏ chọn quân cờ");
                    clearSelection();
                }
            } else {
                if (piece && ChessEngine.getPieceColor(piece) === playerColor) {
                    console.log("Chọn quân cờ:", clickedSquare);
                    selectSquare(clickedSquare);
                }
            }
        } catch (error) {
            console.error("Lỗi trong handleSquareClick:", error);
            clearSelection();
        }
    };

    const selectSquare = (square) => {
        setSelectedSquare(square);
        const moves = ChessEngine.getValidMoves(gameState, square, playerColor);
        setValidMoves(moves);
    };

    const clearSelection = () => {
        setSelectedSquare(null);
        setValidMoves([]);
    };

    const makeMove = (from, to) => {
        try {
            let newGameState = ChessEngine.makeMove(gameState, from, to);

            // Kiểm tra phong tướng
            const movingPiece = gameState.board[from.row][from.col];
            const isPawn = ChessEngine.getPieceType(movingPiece) === 'pawn';
            if (isPawn && ChessEngine.canPromote(to.row, playerColor)) {
                setPromotionState({ from, to });
                return;
            }

            setGameState(newGameState);
            setMoveHistory(prev => [...prev, {
                from,
                to,
                piece: gameState.board[from.row][from.col],
                player: playerColor,
                notation: ChessEngine.getMoveNotation(gameState, { from, to })
            }]);
            setCurrentPlayer(botColor);
            clearSelection();
        } catch (error) {
            console.error("Lỗi trong makeMove:", error);
            clearSelection();
        }
    };

    const handlePromotion = (pieceType) => {
        if (!promotionState) return;

        try {
            const { from, to } = promotionState;
            let newGameState = ChessEngine.makeMove(gameState, from, to);
            newGameState = ChessEngine.promotePawn(newGameState, to.row, to.col, playerColor, pieceType);

            setGameState(newGameState);
            setMoveHistory(prev => [...prev, {
                from,
                to,
                piece: gameState.board[from.row][from.col],
                player: playerColor,
                notation: ChessEngine.getMoveNotation(gameState, { from, to, promotion: pieceType })
            }]);
            setCurrentPlayer(botColor);
            setPromotionState(null);
        } catch (error) {
            console.error("Lỗi trong handlePromotion:", error);
            setPromotionState(null);
        }
    };

    const resetGame = () => {
        console.log("Khởi tạo ván mới...");
        const initialState = ChessEngine.getInitialState();
        console.log("Trạng thái ban đầu:", initialState);

        // Reset tất cả state về trạng thái ban đầu
        setGameState(initialState);
        setSelectedSquare(null);
        setValidMoves([]);
        setGameStatus('playing');
        setCurrentPlayer('white');
        setMoveHistory([]);
        setPromotionState(null);
        setShowGameOverDialog(false);
        setIsThinking(false);

        // Đợi cho state được cập nhật hoàn toàn trước khi cho bot đi
        if (botColor === 'white') {
            console.log("Bot là quân trắng, sẽ đi trước");
            // Sử dụng requestAnimationFrame để đảm bảo state đã được cập nhật
            requestAnimationFrame(() => {
                console.log("Bắt đầu lượt đi của bot...");
                handleBotMove();
            });
        } else {
            console.log("Người chơi là quân trắng, đợi lượt đi");
        }
    };

    const getGameOverMessage = () => {
        if (gameStatus === 'checkmate') {
            const winner = currentPlayer === playerColor ? 'Bot' : 'Bạn';
            return `Chiếu hết! ${winner} thắng!`;
        }
        return 'Hòa cờ! (Bế tắc)';
    };

    return (
        <div className="chess-game">
            <div className="game-header">
                <div className="game-header-content">
                    <button className="back-home-btn" onClick={() => navigate('/home')}>
                        ← Quay lại
                    </button>
                    <h1>Cờ Vua vs Bot</h1>
                </div>
                <button onClick={resetGame} className="reset-btn">
                    Ván mới
                </button>
            </div>

            <div className="game-content">
                <div className="chess-board-container">
                    <ChessBoard
                        gameState={gameState}
                        selectedSquare={selectedSquare}
                        validMoves={validMoves}
                        onSquareClick={handleSquareClick}
                        isThinking={isThinking}
                        playerColor={playerColor}
                    />
                </div>

                <div className="game-sidebar">
                    <GameStatus
                        currentPlayer={currentPlayer}
                        gameStatus={gameStatus}
                        isThinking={isThinking}
                        playerColor={playerColor}
                    />

                    <MoveHistory
                        moves={moveHistory}
                        playerColor={playerColor}
                    />
                </div>
            </div>

            {showGameOverDialog && (
                <div className="game-over-dialog-overlay">
                    <div className="game-over-dialog">
                        <h2>{getGameOverMessage()}</h2>
                        <button onClick={resetGame} className="new-game-btn">
                            Chơi ván mới
                        </button>
                    </div>
                </div>
            )}

            <PromotionDialog
                isOpen={promotionState !== null}
                color={playerColor}
                onSelect={handlePromotion}
                onClose={() => setPromotionState(null)}
            />
        </div>
    );
};

export default ChessGame;