import { ChessEngine } from './chess-engine';

class ChessBot {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth(difficulty);
    }

    getMaxDepth(difficulty) {
        switch (difficulty) {
            case 'easy': return 2;
            case 'medium': return 4; // Tăng độ sâu cho medium
            case 'hard': return 6; // Tăng độ sâu cho hard
            default: return 4;
        }
    }

    // Lấy nước đi tốt nhất cho bot
    async getBestMove(gameState, color) {
        try {
            console.log(`Bot (${color}) đang tìm nước đi...`);
            console.log('Game state:', gameState);

            // Kiểm tra tham số đầu vào
            if (!gameState || !gameState.board || !Array.isArray(gameState.board)) {
                console.error("Game state không hợp lệ:", gameState);
                return null;
            }

            // Kiểm tra chiếu hết trước
            const isInCheck = ChessEngine.isInCheck(gameState, color);
            const validMoves = ChessEngine.getAllValidMoves(gameState, color);

            console.log(`Bot có đang bị chiếu: ${isInCheck}`);
            console.log(`Số nước đi hợp lệ: ${validMoves.length}`);
            console.log('Các nước đi hợp lệ:', validMoves);

            // Nếu đang bị chiếu và không có nước đi hợp lệ -> chiếu hết
            if (isInCheck && validMoves.length === 0) {
                console.log("Bot bị chiếu hết!");
                return null;
            }

            // Nếu không có nước đi hợp lệ nhưng không bị chiếu -> hòa cờ
            if (validMoves.length === 0) {
                console.error("Không tìm thấy nước đi hợp lệ trong trạng thái:", gameState);
                // Thử lấy các nước đi cơ bản cho một quân cờ cụ thể để debug
                const testPiece = { row: color === 'white' ? 6 : 1, col: 4 }; // Thử với quân tốt ở e2/e7
                const basicMoves = ChessEngine.getBasicMoves(gameState, testPiece, color);
                console.log(`Các nước đi cơ bản cho quân tốt tại ${testPiece.row},${testPiece.col}:`, basicMoves);
                return null;
            }

            // Kiểm tra nước đi nhập thành
            const castlingMoves = this.getCastlingMoves(gameState, color, validMoves);
            if (castlingMoves.length > 0 && !isInCheck) {
                console.log("Tìm thấy các nước đi nhập thành:", castlingMoves);
                // Đánh giá các nước đi nhập thành
                const bestCastlingMove = this.evaluateCastlingMoves(gameState, color, castlingMoves);
                if (bestCastlingMove) {
                    console.log("Chọn nước đi nhập thành:", bestCastlingMove);
                    return bestCastlingMove;
                }
            }

            // Kiểm tra nước đi phong hậu
            const promotionMoves = this.getPromotionMoves(gameState, color, validMoves);
            if (promotionMoves.length > 0) {
                console.log("Tìm thấy các nước đi phong hậu:", promotionMoves);
                // Đánh giá các nước đi phong hậu
                const bestPromotionMove = this.evaluatePromotionMoves(gameState, color, promotionMoves);
                if (bestPromotionMove) {
                    console.log("Chọn nước đi phong hậu:", bestPromotionMove);
                    return bestPromotionMove;
                }
            }

            if (isInCheck) {
                console.log("Bot đang bị chiếu - tìm nước thoát chiếu...");
                return this.handleCheckSituation(gameState, color, validMoves);
            }

            // Nếu không bị chiếu, sử dụng minimax bình thường
            const result = this.minimaxWithMoves(gameState, this.maxDepth, -Infinity, Infinity, true, color, validMoves);
            const finalMove = result.move || validMoves[Math.floor(Math.random() * validMoves.length)];
            console.log("Nước đi được chọn:", finalMove);
            return finalMove;

        } catch (error) {
            console.error("Lỗi trong getBestMove:", error);
            try {
                // Fallback: trả về nước đi ngẫu nhiên từ các nước đi hợp lệ
                const fallbackMoves = ChessEngine.getAllValidMoves(gameState, color);
                if (fallbackMoves && fallbackMoves.length > 0) {
                    return fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
                }
            } catch (fallbackError) {
                console.error("Lỗi khi tìm nước đi fallback:", fallbackError);
            }
            return null;
        }
    }    // Lấy các nước đi nhập thành hợp lệ
    getCastlingMoves(gameState, color, validMoves) {
        if (!Array.isArray(validMoves) || !Array.isArray(gameState)) {
            console.warn('getCastlingMoves: validMoves hoặc gameState không phải là array');
            return [];
        }

        return validMoves.filter(move => {
            try {
                // Kiểm tra move có hợp lệ không
                if (!move || !move.from || typeof move.from.row !== 'number' || typeof move.from.col !== 'number' ||
                    !move.to || typeof move.to.row !== 'number' || typeof move.to.col !== 'number') {
                    console.warn('getCastlingMoves: Định dạng move không hợp lệ:', move);
                    return false;
                }

                // Kiểm tra chỉ số row/col có trong phạm vi không
                if (move.from.row < 0 || move.from.row > 7 || move.from.col < 0 || move.from.col > 7 ||
                    move.to.row < 0 || move.to.row > 7 || move.to.col < 0 || move.to.col > 7) {
                    console.warn('getCastlingMoves: Chỉ số row/col ngoài phạm vi:', move);
                    return false;
                }

                // Kiểm tra gameState tại vị trí from
                if (!gameState[move.from.row] || !gameState[move.from.row][move.from.col]) {
                    console.warn('getCastlingMoves: Không tìm thấy quân cờ tại vị trí:', move.from);
                    return false;
                }

                const piece = gameState[move.from.row][move.from.col];
                return ChessEngine.getPieceType(piece) === 'king' && Math.abs(move.from.col - move.to.col) === 2;
            } catch (error) {
                console.warn('getCastlingMoves: Lỗi khi xử lý move:', move, error);
                return false;
            }
        });
    }

    // Đánh giá các nước đi nhập thành
    evaluateCastlingMoves(gameState, color, castlingMoves) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (const move of castlingMoves) {
            const newGameState = ChessEngine.makeMove(gameState, move.from, move.to);
            let score = 200; // Bonus cho nhập thành

            // Đánh giá an toàn vua sau nhập thành
            score += this.evaluateKingSafety(newGameState, color, move.to) * 2;

            // Đánh giá tổng thể vị trí
            score += this.evaluatePosition(newGameState, color) * 0.5;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Lấy các nước đi phong hậu hợp lệ
    getPromotionMoves(gameState, color, validMoves) {
        return validMoves.filter(move => {
            const piece = gameState[move.from.row][move.from.col];
            const pieceType = ChessEngine.getPieceType(piece);
            const targetRow = color === 'white' ? 0 : 7;
            return pieceType === 'pawn' && move.to.row === targetRow;
        });
    }

    // Đánh giá các nước đi phong hậu
    evaluatePromotionMoves(gameState, color, promotionMoves) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (const move of promotionMoves) {
            // Mặc định phong hậu thành Queen
            const newGameState = ChessEngine.makeMove(gameState, move.from, move.to, 'queen', 'rook', `bishop`, `knight`);
            let score = 900; // Giá trị của quân Hậu

            // Đánh giá vị trí sau phong hậu
            score += this.evaluatePosition(newGameState, color) * 0.5;

            // Bonus nếu ăn được quân đối phương
            const targetPiece = gameState[move.to.row][move.to.col];
            if (targetPiece && ChessEngine.getPieceColor(targetPiece) !== color) {
                score += this.getPieceValue(targetPiece) * 2;
            }

            // Kiểm tra phong thành Knight trong trường hợp đặc biệt
            const knightGameState = ChessEngine.makeMove(gameState, move.from, move.to, 'knight');
            const knightThreats = this.checkForNewThreats(knightGameState, color, color === 'white' ? 'black' : 'white');
            if (knightThreats.totalValue > 300) {
                const knightScore = 320 + knightThreats.totalValue + this.evaluatePosition(knightGameState, color) * 0.5;
                if (knightScore > score) {
                    score = knightScore;
                    move.promotion = 'knight';
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }    // Hàm đánh giá nước đi thoát chiếu
    evaluateEscapeMove(gameState, newGameState, move, color) {
        let score = 0;
        const opponentColor = color === 'white' ? 'black' : 'white';

        // 1. Điểm cơ bản cho việc thoát chiếu
        score += 1000;

        // 2. Điểm cho việc ăn được quân của đối phương
        const capturedPiece = this.getCapturedPiece(move, gameState);
        if (capturedPiece) {
            score += this.getPieceValue(capturedPiece) * 2;
        }

        // 3. Điểm cho việc di chuyển đến vị trí an toàn
        const safetyScore = this.evaluatePositionSafety(newGameState, move.to, color);
        score += safetyScore * 3;

        // 4. Điểm cho việc tạo đe dọa với đối phương
        const threatScore = this.checkForNewThreats(newGameState, color, opponentColor).totalValue;
        score += threatScore;

        // 5. Điểm cho vị trí tổng thể sau nước đi
        score += this.evaluatePosition(newGameState, color) * 0.5;

        // 6. Bonus cho nhập thành
        if (ChessEngine.getPieceType(gameState[move.from.row][move.from.col]) === 'king' &&
            Math.abs(move.from.col - move.to.col) === 2) {
            score += 200;
        }

        // 7. Bonus cho phong hậu
        if (ChessEngine.getPieceType(gameState[move.from.row][move.from.col]) === 'pawn' &&
            (move.to.row === (color === 'white' ? 0 : 7))) {
            score += 900;
        }

        return score;
    }

    // Lấy quân bị ăn (nếu có)
    getCapturedPiece(move, originalGameState) {
        return originalGameState[move.to.row][move.to.col];
    }

    // Đánh giá độ an toàn của vị trí
    evaluatePositionSafety(gameState, position, color) {
        let safetyScore = 0;
        const opponentColor = color === 'white' ? 'black' : 'white';

        // Kiểm tra xem vị trí có bị tấn công không
        const attackers = this.findAttackersToSquare(gameState, position, opponentColor);
        safetyScore -= attackers.length * 50;

        // Kiểm tra xem vị trí có được bảo vệ không
        const defenders = this.findAttackersToSquare(gameState, position, color);
        safetyScore += defenders.length * 30;

        // Điểm cho khoảng cách đến trung tâm
        const distanceFromCenter = Math.abs(position.row - 3.5) + Math.abs(position.col - 3.5);
        safetyScore -= distanceFromCenter * 10;

        return safetyScore;
    }

    // Đánh giá vị trí trên bàn cờ
    evaluatePosition(gameState, color) {
        let score = 0;

        // 1. Điểm dựa trên giá trị quân cờ
        score += this.getMaterialScore(gameState, color);

        // 2. Điểm cho vị trí quân cờ
        score += this.getPositionalScore(gameState, color);

        // 3. Điểm cho an toàn của vua
        const kingSafetyScore = this.getKingSafetyScore(gameState, color);
        score += kingSafetyScore * 2;

        // 4. Điểm cho kiểm soát trung tâm
        score += this.getCenterControlScore(gameState, color);

        // 5. Phạt nặng nếu vua đang bị chiếu
        if (ChessEngine.isInCheck(gameState, color)) {
            score -= 500;
        }

        // 6. Bonus cho khả năng nhập thành
        if (this.canCastle(gameState, color)) {
            score += 100;
        }

        // 7. Bonus cho khả năng phong hậu
        score += this.evaluatePawnPromotionPotential(gameState, color);

        return score;
    }

    // Kiểm tra khả năng nhập thành
    canCastle(gameState, color) {
        const castlingAvailability = ChessEngine.getCastlingAvailability(gameState, color);
        return castlingAvailability.kingSide || castlingAvailability.queenSide;
    }

    // Đánh giá tiềm năng phong hậu
    evaluatePawnPromotionPotential(gameState, color) {
        let score = 0;
        const targetRow = color === 'white' ? 0 : 7;
        const direction = color === 'white' ? -1 : 1;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState[row][col];
                if (piece && ChessEngine.getPieceType(piece) === 'pawn' && ChessEngine.getPieceColor(piece) === color) {
                    const distanceToPromotion = Math.abs(row - targetRow);
                    if (distanceToPromotion <= 3) {
                        score += (4 - distanceToPromotion) * 50;
                        // Bonus nếu không có quân đối phương chặn đường
                        if (!this.isPathBlocked(gameState, { row, col }, { row: targetRow, col }, color)) {
                            score += 100;
                        }
                    }
                }
            }
        }

        return score;
    }

    // Kiểm tra đường đi của quân tốt đến hàng phong hậu
    isPathBlocked(gameState, from, to, color) {
        const direction = color === 'white' ? -1 : 1;
        let currentRow = from.row + direction;

        while (currentRow !== to.row) {
            if (gameState[currentRow][from.col]) {
                return true;
            }
            currentRow += direction;
        }

        return false;
    }

    // Xử lý tình huống bị chiếu
    handleCheckSituation(gameState, color, validMoves) {
        try {
            console.log(`Xử lý tình huống chiếu cho ${color}, có ${validMoves.length} nước đi`);

            const opponentColor = color === 'white' ? 'black' : 'white';
            const escapeMoves = [];

            for (const move of validMoves) {
                try {
                    const promotionPiece = (ChessEngine.getPieceType(gameState[move.from.row][move.from.col]) === 'pawn' &&
                        move.to.row === (color === 'white' ? 0 : 7)) ? 'queen' : undefined;
                    const newGameState = ChessEngine.makeMove(gameState, move.from, move.to, promotionPiece);
                    if (!ChessEngine.isInCheck(newGameState, color)) {
                        escapeMoves.push({ ...move, promotion: promotionPiece });
                    }
                } catch (error) {
                    console.warn("Lỗi khi kiểm tra nước đi:", move, error);
                    continue;
                }
            }

            console.log(`Tìm thấy ${escapeMoves.length} nước đi thoát chiếu`);

            if (escapeMoves.length === 0) {
                console.log("Không có nước đi thoát chiếu - Checkmate");
                return null;
            }

            if (escapeMoves.length === 1) {
                console.log("Chỉ có 1 nước đi thoát chiếu:", escapeMoves[0]);
                return escapeMoves[0];
            }

            const categories = this.categorizeEscapeMoves(gameState, color, escapeMoves, opponentColor);
            console.log("Phân loại nước đi thoát chiếu:", categories);

            // Ưu tiên: phản công > chặn > di chuyển vua > khác
            if (categories.counterAttacks.length > 0) {
                const result = this.evaluateMoves(gameState, color, categories.counterAttacks);
                console.log("Chọn nước phản công:", result.move);
                return result.move;
            }
            if (categories.blockingMoves.length > 0) {
                const result = this.evaluateMoves(gameState, color, categories.blockingMoves);
                console.log("Chọn nước chặn:", result.move);
                return result.move;
            }
            if (categories.kingMoves.length > 0) {
                const result = this.evaluateKingMoves(gameState, color, categories.kingMoves, opponentColor);
                console.log("Chọn nước di chuyển vua:", result.move);
                return result.move;
            }
            if (categories.otherEscapes.length > 0) {
                const result = this.evaluateMoves(gameState, color, categories.otherEscapes);
                console.log("Chọn nước thoát chiếu khác:", result.move);
                return result.move;
            }

            return escapeMoves[0];
        } catch (error) {
            console.error("Lỗi trong handleCheckSituation:", error);
            return validMoves.length > 0 ? validMoves[0] : null;
        }
    }

    // Phân loại các nước đi thoát chiếu
    categorizeEscapeMoves(gameState, color, escapeMoves, opponentColor) {
        const categories = {
            counterAttacks: [],
            blockingMoves: [],
            kingMoves: [],
            otherEscapes: []
        };

        for (const move of escapeMoves) {
            const newGameState = ChessEngine.makeMove(gameState, move.from, move.to, move.promotion);
            const movingPiece = gameState[move.from.row][move.from.col];
            const targetPiece = gameState[move.to.row][move.to.col];
            const pieceType = ChessEngine.getPieceType(movingPiece);

            const isCapture = targetPiece && ChessEngine.getPieceColor(targetPiece) === opponentColor;
            const createsThreats = this.checkForNewThreats(newGameState, color, opponentColor);

            if (pieceType === 'king') {
                categories.kingMoves.push({
                    move,
                    isCapture,
                    createsThreats,
                    safetyScore: this.evaluateKingSafety(newGameState, color, move.to)
                });
            } else if (isCapture || createsThreats.hasThreats) {
                categories.counterAttacks.push({
                    move,
                    isCapture,
                    captureValue: isCapture ? this.getPieceValue(targetPiece) : 0,
                    threats: createsThreats
                });
            } else if (this.isBlockingMove(gameState, move, color)) {
                categories.blockingMoves.push({
                    move,
                    blockingValue: this.evaluateBlockingMove(newGameState, color, move)
                });
            } else {
                categories.otherEscapes.push(move);
            }
        }

        return categories;
    }

    // Kiểm tra đe dọa mới sau nước đi
    checkForNewThreats(gameState, color, opponentColor) {
        const threats = {
            hasThreats: false,
            checkThreats: 0,
            captureThreats: 0,
            totalValue: 0
        };

        if (ChessEngine.isInCheck(gameState, opponentColor)) {
            threats.checkThreats++;
            threats.hasThreats = true;
            threats.totalValue += 100;
        }

        const myMoves = ChessEngine.getAllValidMoves(gameState, color);
        for (const move of myMoves) {
            const targetPiece = gameState[move.to.row][move.to.col];
            if (targetPiece && ChessEngine.getPieceColor(targetPiece) === opponentColor) {
                const pieceValue = this.getPieceValue(targetPiece);
                if (pieceValue >= 300) {
                    threats.captureThreats++;
                    threats.hasThreats = true;
                    threats.totalValue += pieceValue * 0.5;
                }
            }
        }

        return threats;
    }

    // Đánh giá nước đi chặn
    isBlockingMove(gameState, move, color) {
        const movingPiece = gameState[move.from.row][move.from.col];
        const pieceType = ChessEngine.getPieceType(movingPiece);

        if (pieceType === 'king') {
            return false;
        }

        const kingPosition = this.findKing(gameState, color);
        if (!kingPosition) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        const attackers = this.findAttackersToSquare(gameState, kingPosition, opponentColor);

        for (const attacker of attackers) {
            if (this.isSquareInPath(attacker, kingPosition, move.to)) {
                return true;
            }
        }

        return false;
    }

    // Đánh giá an toàn vua sau khi di chuyển
    evaluateKingSafety(gameState, color, kingPosition) {
        let safetyScore = 0;
        const opponentColor = color === 'white' ? 'black' : 'white';

        const attackers = this.findAttackersToSquare(gameState, kingPosition, opponentColor);
        safetyScore -= attackers.length * 20;

        const protectors = this.findAttackersToSquare(gameState, kingPosition, color);
        safetyScore += protectors.length * 15;

        const distanceFromCenter = Math.abs(kingPosition.row - 3.5) + Math.abs(kingPosition.col - 3.5);
        const totalPieces = this.countTotalPieces(gameState);
        if (totalPieces < 12) {
            safetyScore -= distanceFromCenter * 5;
        } else {
            safetyScore += distanceFromCenter * 2;
        }

        return safetyScore;
    }

    // Đánh giá các nước đi vua
    evaluateKingMoves(gameState, color, kingMoves, opponentColor) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (const moveData of kingMoves) {
            const newGameState = ChessEngine.makeMove(gameState, moveData.move.from, moveData.move.to);
            let score = 0;

            score += moveData.safetyScore;

            if (moveData.isCapture) {
                score += moveData.captureValue || 0;
            }

            if (moveData.createsThreats) {
                score += moveData.createsThreats.totalValue;
            }

            score += this.evaluatePosition(newGameState, color) * 0.3;

            if (score > bestScore) {
                bestScore = score;
                bestMove = moveData.move;
            }
        }

        return { score: bestScore, move: bestMove };
    }

    // Đánh giá tập hợp nước đi
    evaluateMoves(gameState, color, moves) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (const moveData of moves) {
            const move = moveData.move || moveData;
            const newGameState = ChessEngine.makeMove(gameState, move.from, move.to, move.promotion);

            const result = this.minimaxWithMoves(
                newGameState,
                Math.max(1, this.maxDepth - 1),
                -Infinity,
                Infinity,
                false,
                color,
                null
            );

            let score = result.score;

            if (moveData.isCapture) {
                score += (moveData.captureValue || 0) * 0.5;
            }
            if (moveData.threats) {
                score += moveData.threats.totalValue * 0.3;
            }
            if (moveData.blockingValue) {
                score += moveData.blockingValue;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return { score: bestScore, move: bestMove };
    }

    // Helper functions
    findKing(gameState, color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState[row][col];
                if (piece && ChessEngine.getPieceType(piece) === 'king' &&
                    ChessEngine.getPieceColor(piece) === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    findAttackersToSquare(gameState, targetSquare, attackerColor) {
        const attackers = [];
        const allMoves = ChessEngine.getAllValidMoves(gameState, attackerColor);

        for (const move of allMoves) {
            if (move.to.row === targetSquare.row && move.to.col === targetSquare.col) {
                attackers.push(move.from);
            }
        }

        return attackers;
    }

    isSquareInPath(from, to, checkSquare) {
        const rowDiff = to.row - from.row;
        const colDiff = to.col - from.col;

        if (rowDiff === 0 && colDiff === 0) return false;

        if (rowDiff === 0) {
            return checkSquare.row === from.row &&
                Math.min(from.col, to.col) < checkSquare.col &&
                checkSquare.col < Math.max(from.col, to.col);
        }

        if (colDiff === 0) {
            return checkSquare.col === from.col &&
                Math.min(from.row, to.row) < checkSquare.row &&
                checkSquare.row < Math.max(from.row, to.row);
        }

        if (Math.abs(rowDiff) === Math.abs(colDiff)) {
            const rowStep = rowDiff > 0 ? 1 : -1;
            const colStep = colDiff > 0 ? 1 : -1;

            let currentRow = from.row + rowStep;
            let currentCol = from.col + colStep;

            while (currentRow !== to.row && currentCol !== to.col) {
                if (currentRow === checkSquare.row && currentCol === checkSquare.col) {
                    return true;
                }
                currentRow += rowStep;
                currentCol += colStep;
            }
        }

        return false;
    }

    evaluateBlockingMove(gameState, color, move) {
        let blockingValue = 50;
        const newGameState = ChessEngine.makeMove(gameState, move.from, move.to);
        const movingPiece = gameState[move.from.row][move.from.col];
        const pieceType = ChessEngine.getPieceType(movingPiece);

        if (pieceType === 'pawn' || pieceType === 'knight' || pieceType === 'bishop') {
            blockingValue += 30;
        }

        const opponentColor = color === 'white' ? 'black' : 'white';
        const threats = this.checkForNewThreats(newGameState, color, opponentColor);
        if (threats.hasThreats) {
            blockingValue += threats.totalValue * 0.5;
        }

        return blockingValue;
    }

    getPieceValue(piece) {
        const pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };

        const pieceType = ChessEngine.getPieceType(piece);
        return pieceValues[pieceType] || 0;
    }

    countTotalPieces(gameState) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (gameState[row][col]) {
                    count++;
                }
            }
        }
        return count;
    }

    minimaxWithMoves(gameState, depth, alpha, beta, maximizingPlayer, color, availableMoves) {
        try {
            if (depth === 0) {
                return {
                    score: this.evaluatePosition(gameState, color),
                    move: null
                };
            }

            const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
            const moves = availableMoves || ChessEngine.getAllValidMoves(gameState, currentColor);

            if (moves.length === 0) {
                const isInCheck = ChessEngine.isInCheck(gameState, currentColor);
                return {
                    score: isInCheck ? (maximizingPlayer ? -10000 : 10000) : 0,
                    move: null
                };
            }

            let bestMove = null;

            if (maximizingPlayer) {
                let maxEval = -Infinity;

                for (const move of moves) {
                    try {
                        const promotionPiece = (ChessEngine.getPieceType(gameState[move.from.row][move.from.col]) === 'pawn' &&
                            move.to.row === (currentColor === 'white' ? 0 : 7)) ? 'queen' : undefined;
                        const newGameState = ChessEngine.makeMove(gameState, move.from, move.to, promotionPiece);
                        const eval_result = this.minimaxWithMoves(
                            newGameState,
                            depth - 1,
                            alpha,
                            beta,
                            false,
                            color,
                            null
                        );

                        if (eval_result.score > maxEval) {
                            maxEval = eval_result.score;
                            bestMove = { ...move, promotion: promotionPiece };
                        }

                        alpha = Math.max(alpha, eval_result.score);
                        if (beta <= alpha) break;
                    } catch (error) {
                        console.warn("Lỗi trong minimax (maximizing):", error);
                        continue;
                    }
                }

                return { score: maxEval, move: bestMove };
            } else {
                let minEval = Infinity;

                for (const move of moves) {
                    try {
                        const promotionPiece = (ChessEngine.getPieceType(gameState[move.from.row][move.from.col]) === 'pawn' &&
                            move.to.row === (currentColor === 'white' ? 0 : 7)) ? 'queen' : undefined;
                        const newGameState = ChessEngine.makeMove(gameState, move.from, move.to, promotionPiece);
                        const eval_result = this.minimaxWithMoves(
                            newGameState,
                            depth - 1,
                            alpha,
                            beta,
                            true,
                            color,
                            null
                        );

                        if (eval_result.score < minEval) {
                            minEval = eval_result.score;
                            bestMove = { ...move, promotion: promotionPiece };
                        }

                        beta = Math.min(beta, eval_result.score);
                        if (beta <= alpha) break;
                    } catch (error) {
                        console.warn("Lỗi trong minimax (minimizing):", error);
                        continue;
                    }
                }

                return { score: minEval, move: bestMove };
            }
        } catch (error) {
            console.error("Lỗi nghiêm trọng trong minimax:", error);
            return {
                score: 0,
                move: availableMoves && availableMoves.length > 0 ? availableMoves[0] : null
            };
        }
    }

    getMaterialScore(gameState, botColor) {
        const pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };

        let score = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState[row][col];
                if (piece) {
                    const pieceType = ChessEngine.getPieceType(piece);
                    const pieceColor = ChessEngine.getPieceColor(piece);
                    const value = pieceValues[pieceType] || 0;

                    if (pieceColor === botColor) {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }

        return score;
    }

    getPositionalScore(gameState, botColor) {
        let score = 0;

        const pawnTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5, 5, 10, 25, 25, 10, 5, 5],
            [0, 0, 0, 20, 20, 0, 0, 0],
            [5, -5, -10, 0, 0, -10, -5, 5],
            [5, 10, 10, -20, -20, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const knightTable = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20, 0, 0, 0, 0, -20, -40],
            [-30, 0, 10, 15, 15, 10, 0, -30],
            [-30, 5, 15, 20, 20, 15, 5, -30],
            [-30, 0, 15, 20, 20, 15, 0, -30],
            [-30, 5, 10, 15, 15, 10, 5, -30],
            [-40, -20, 0, 5, 5, 0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];

        const bishopTable = [
            [-20, -10, -10, -10, -10, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 5, 10, 10, 5, 0, -10],
            [-10, 5, 5, 10, 10, 5, 5, -10],
            [-10, 0, 10, 10, 10, 10, 0, -10],
            [-10, 10, 10, 10, 10, 10, 10, -10],
            [-10, 5, 0, 0, 0, 0, 5, -10],
            [-20, -10, -10, -10, -10, -10, -10, -20]
        ];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState[row][col];
                if (piece) {
                    const pieceType = ChessEngine.getPieceType(piece);
                    const pieceColor = ChessEngine.getPieceColor(piece);
                    let positionValue = 0;

                    const adjustedRow = pieceColor === 'white' ? 7 - row : row;

                    switch (pieceType) {
                        case 'pawn':
                            positionValue = pawnTable[adjustedRow][col];
                            break;
                        case 'knight':
                            positionValue = knightTable[adjustedRow][col];
                            break;
                        case 'bishop':
                            positionValue = bishopTable[adjustedRow][col];
                            break;
                    }

                    if (pieceColor === botColor) {
                        score += positionValue;
                    } else {
                        score -= positionValue;
                    }
                }
            }
        }

        return score;
    }

    getKingSafetyScore(gameState, botColor) {
        let score = 0;
        const opponentColor = botColor === 'white' ? 'black' : 'white';

        if (ChessEngine.isInCheck(gameState, botColor)) {
            score -= 50;
        }

        if (ChessEngine.isInCheck(gameState, opponentColor)) {
            score += 50;
        }

        return score;
    }

    getCenterControlScore(gameState, botColor) {
        let score = 0;
        const centerSquares = [
            { row: 3, col: 3 }, { row: 3, col: 4 },
            { row: 4, col: 3 }, { row: 4, col: 4 }
        ];

        for (const square of centerSquares) {
            const piece = gameState[square.row][square.col];
            if (piece) {
                const pieceColor = ChessEngine.getPieceColor(piece);
                if (pieceColor === botColor) {
                    score += 10;
                } else {
                    score -= 10;
                }
            }
        }

        return score;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth(difficulty);
    }
}

export { ChessBot };