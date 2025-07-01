// src/component/GameMode/chess-engine.js

class ChessEngine {
    // Khởi tạo bàn cờ
    static getInitialState() {
        return {
            board: [
                ['black_rook', 'black_knight', 'black_bishop', 'black_queen', 'black_king', 'black_bishop', 'black_knight', 'black_rook'],
                ['black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn'],
                [null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null],
                ['white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn'],
                ['white_rook', 'white_knight', 'white_bishop', 'white_queen', 'white_king', 'white_bishop', 'white_knight', 'white_rook']
            ],
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true }
            },
            moveHistory: []
        };
    }

    // Lấy màu quân cờ
    static getPieceColor(piece) {
        if (!piece) return null;
        return piece.startsWith('white') ? 'white' : 'black';
    }

    // Lấy loại quân cờ
    static getPieceType(piece) {
        if (!piece) return null;
        return piece.split('_')[1];
    }

    // Kiểm tra ô có nằm trong bàn cờ không
    static isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Lấy các nước đi hợp lệ cho một quân cờ
    static getValidMoves(gameState, position, currentPlayer) {
        try {
            const { row, col } = position;
            const piece = gameState.board[row][col];

            if (!piece || this.getPieceColor(piece) !== currentPlayer) {
                return [];
            }

            const pieceType = this.getPieceType(piece);
            let moves = [];

            // Thêm nước nhập thành cho vua
            if (pieceType === 'king') {
                // Kiểm tra nhập thành gần
                if (this.canCastle(gameState, currentPlayer, 'king')) {
                    moves.push({ row, col: col + 2 });
                }
                // Kiểm tra nhập thành xa
                if (this.canCastle(gameState, currentPlayer, 'queen')) {
                    moves.push({ row, col: col - 2 });
                }
            }

            // Thêm các nước đi thông thường
            const basicMoves = this.getBasicMoves(gameState, position, currentPlayer);
            console.log(`Các nước đi cơ bản cho ${piece} tại ${row},${col}:`, basicMoves);
            moves = [...moves, ...basicMoves];

            // Lọc các nước đi để tránh tự chiếu
            const validMoves = moves.filter(move => !this.wouldBeInCheck(gameState, position, move, currentPlayer));
            console.log(`Các nước đi hợp lệ sau khi lọc cho ${piece}:`, validMoves);
            return validMoves;
        } catch (error) {
            console.error("Lỗi trong getValidMoves:", error);
            return [];
        }
    }

    // Lấy các nước đi cơ bản cho một quân cờ
    static getBasicMoves(gameState, position, currentPlayer) {
        try {
            console.log(`Tìm các nước đi cơ bản cho quân cờ tại ${position.row},${position.col}`);

            if (!gameState || !gameState.board || !Array.isArray(gameState.board)) {
                console.error("Game state không hợp lệ trong getBasicMoves:", gameState);
                return [];
            }

            const { row, col } = position;
            const piece = gameState.board[row][col];

            if (!piece) {
                console.error("Không tìm thấy quân cờ tại vị trí", position);
                return [];
            }

            const pieceType = this.getPieceType(piece);
            console.log(`Loại quân cờ: ${pieceType}, Màu: ${currentPlayer}`);

            let moves = [];
            switch (pieceType) {
                case 'pawn':
                    moves = this.getPawnMoves(gameState, row, col, currentPlayer);
                    break;
                case 'rook':
                    moves = this.getRookMoves(gameState, row, col, currentPlayer);
                    break;
                case 'knight':
                    moves = this.getKnightMoves(gameState, row, col, currentPlayer);
                    break;
                case 'bishop':
                    moves = this.getBishopMoves(gameState, row, col, currentPlayer);
                    break;
                case 'queen':
                    moves = [
                        ...this.getRookMoves(gameState, row, col, currentPlayer),
                        ...this.getBishopMoves(gameState, row, col, currentPlayer)
                    ];
                    break;
                case 'king':
                    moves = this.getKingMoves(gameState, row, col, currentPlayer);
                    break;
                default:
                    console.error("Loại quân cờ không hợp lệ:", pieceType);
                    return [];
            }

            console.log(`Tìm thấy ${moves.length} nước đi cơ bản cho ${piece}`);
            return moves;
        } catch (error) {
            console.error("Lỗi trong getBasicMoves:", error);
            return [];
        }
    }

    // Nước đi của tốt
    static getPawnMoves(gameState, row, col, color) {
        try {
            console.log(`Tìm nước đi cho tốt tại ${row},${col}, màu ${color}`);
            const moves = [];
            const direction = color === 'white' ? -1 : 1;
            const startRow = color === 'white' ? 6 : 1;

            // Kiểm tra tham số đầu vào
            if (!gameState || !gameState.board || !Array.isArray(gameState.board)) {
                console.error("Game state không hợp lệ trong getPawnMoves:", gameState);
                return moves;
            }

            // Di chuyển thẳng một ô
            const oneStep = row + direction;
            if (this.isValidPosition(oneStep, col) && !gameState.board[oneStep][col]) {
                moves.push({ row: oneStep, col });
                console.log(`Có thể đi thẳng 1 ô đến ${oneStep},${col}`);

                // Nước đi đầu tiên của tốt (2 ô)
                if (row === startRow) {
                    const twoStep = row + 2 * direction;
                    if (!gameState.board[twoStep][col]) {
                        moves.push({ row: twoStep, col });
                        console.log(`Có thể đi thẳng 2 ô đến ${twoStep},${col}`);
                    }
                }
            }

            // Ăn chéo
            [-1, 1].forEach(colOffset => {
                const newRow = row + direction;
                const newCol = col + colOffset;

                if (this.isValidPosition(newRow, newCol)) {
                    const targetPiece = gameState.board[newRow][newCol];
                    if (targetPiece && this.getPieceColor(targetPiece) !== color) {
                        moves.push({ row: newRow, col: newCol });
                        console.log(`Có thể ăn chéo tại ${newRow},${newCol}`);
                    }
                }
            });

            console.log(`Tìm thấy ${moves.length} nước đi cho tốt`);
            return moves;
        } catch (error) {
            console.error("Lỗi trong getPawnMoves:", error);
            return [];
        }
    }

    // Nước đi của xe
    static getRookMoves(gameState, row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;

                if (!this.isValidPosition(newRow, newCol)) break;

                const targetPiece = gameState.board[newRow][newCol];

                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.getPieceColor(targetPiece) !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Nước đi của tượng
    static getBishopMoves(gameState, row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;

                if (!this.isValidPosition(newRow, newCol)) break;

                const targetPiece = gameState.board[newRow][newCol];

                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.getPieceColor(targetPiece) !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Nước đi của mã
    static getKnightMoves(gameState, row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = gameState.board[newRow][newCol];
                if (!targetPiece || this.getPieceColor(targetPiece) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    // Nước đi của vua
    static getKingMoves(gameState, row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = gameState.board[newRow][newCol];
                if (!targetPiece || this.getPieceColor(targetPiece) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }

    // Tìm vị trí vua
    static findKing(gameState, color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece === `${color}_king`) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Kiểm tra vua có bị chiếu không
    static isInCheck(gameState, color) {
        const kingPosition = this.findKing(gameState, color);
        if (!kingPosition) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';

        // Kiểm tra tất cả quân đối phương có thể tấn công vua không
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && this.getPieceColor(piece) === opponentColor) {
                    const moves = this.getValidMovesWithoutCheckValidation(gameState, { row, col });
                    if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Lấy nước đi hợp lệ mà không kiểm tra chiếu (để tránh đệ quy vô hạn)
    static getValidMovesWithoutCheckValidation(gameState, position) {
        const { row, col } = position;
        const piece = gameState.board[row][col];

        if (!piece) return [];

        const pieceType = this.getPieceType(piece);
        const color = this.getPieceColor(piece);

        switch (pieceType) {
            case 'pawn':
                return this.getPawnMoves(gameState, row, col, color);
            case 'rook':
                return this.getRookMoves(gameState, row, col, color);
            case 'bishop':
                return this.getBishopMoves(gameState, row, col, color);
            case 'queen':
                return [...this.getRookMoves(gameState, row, col, color), ...this.getBishopMoves(gameState, row, col, color)];
            case 'knight':
                return this.getKnightMoves(gameState, row, col, color);
            case 'king':
                return this.getKingMoves(gameState, row, col, color);
            default:
                return [];
        }
    }

    // Kiểm tra nước đi có khiến vua bị chiếu không
    static wouldBeInCheck(gameState, from, to, color) {
        const newGameState = this.makeTemporaryMove(gameState, from, to);
        return this.isInCheck(newGameState, color);
    }

    // Thực hiện nước đi tạm thời để kiểm tra
    static makeTemporaryMove(gameState, from, to) {
        const newGameState = this.cloneGameState(gameState);
        newGameState.board[to.row][to.col] = newGameState.board[from.row][from.col];
        newGameState.board[from.row][from.col] = null;
        return newGameState;
    }

    // Kiểm tra điều kiện nhập thành
    static canCastle(gameState, color, side) {
        const { board, castlingRights } = gameState;
        const rights = castlingRights[color];
        const rank = color === 'white' ? 7 : 0;

        // Kiểm tra quyền nhập thành
        if (!rights || (side === 'king' && !rights.kingSide) || (side === 'queen' && !rights.queenSide)) {
            return false;
        }

        // Kiểm tra vua có đang bị chiếu không
        if (this.isInCheck(gameState, color)) {
            return false;
        }

        // Vị trí các ô cần kiểm tra
        const kingPos = { row: rank, col: 4 };
        const rookPos = {
            row: rank,
            col: side === 'king' ? 7 : 0
        };

        // Kiểm tra vua và xe còn ở vị trí ban đầu
        if (!this.isPieceAt(board, kingPos, `${color}_king`) ||
            !this.isPieceAt(board, rookPos, `${color}_rook`)) {
            return false;
        }

        // Kiểm tra không có quân cản giữa
        const cols = side === 'king' ? [5, 6] : [1, 2, 3];
        for (const col of cols) {
            if (board[rank][col] !== null) {
                return false;
            }
        }

        // Kiểm tra các ô vua đi qua không bị kiểm soát
        const passingCols = side === 'king' ? [4, 5, 6] : [2, 3, 4];
        for (const col of passingCols) {
            if (this.isSquareUnderAttack(gameState, { row: rank, col }, color)) {
                return false;
            }
        }

        return true;
    }

    // Kiểm tra xem một ô có quân cờ cụ thể không
    static isPieceAt(board, pos, piece) {
        return board[pos.row][pos.col] === piece;
    }

    // Kiểm tra xem một ô có bị tấn công không
    static isSquareUnderAttack(gameState, square, defendingColor) {
        const attackingColor = defendingColor === 'white' ? 'black' : 'white';
        const { board } = gameState;

        // Kiểm tra tất cả quân của đối phương
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && this.getPieceColor(piece) === attackingColor) {
                    const moves = this.getValidMovesWithoutCheckValidation(gameState, { row, col });
                    if (moves.some(move => move.row === square.row && move.col === square.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Thực hiện nước nhập thành
    static performCastling(gameState, color, side) {
        const { board, castlingRights } = this.cloneGameState(gameState);
        const rank = color === 'white' ? 7 : 0;

        if (side === 'king') {
            // Nhập thành gần
            board[rank][4] = null; // Di chuyển vua
            board[rank][6] = `${color}_king`;
            board[rank][7] = null; // Di chuyển xe
            board[rank][5] = `${color}_rook`;
        } else {
            // Nhập thành xa
            board[rank][4] = null; // Di chuyển vua
            board[rank][2] = `${color}_king`;
            board[rank][0] = null; // Di chuyển xe
            board[rank][3] = `${color}_rook`;
        }

        // Cập nhật quyền nhập thành
        castlingRights[color] = { kingSide: false, queenSide: false };

        return { board, castlingRights, moveHistory: [...gameState.moveHistory] };
    }

    // Thực hiện nước đi
    static makeMove(gameState, from, to) {
        const { board, castlingRights } = gameState;
        const piece = board[from.row][from.col];
        const pieceType = this.getPieceType(piece);
        const pieceColor = this.getPieceColor(piece);

        // Kiểm tra nước nhập thành
        if (pieceType === 'king' && Math.abs(to.col - from.col) === 2) {
            const side = to.col > from.col ? 'king' : 'queen';
            if (this.canCastle(gameState, pieceColor, side)) {
                return this.performCastling(gameState, pieceColor, side);
            }
            return gameState; // Không thể nhập thành
        }

        // Xử lý nước đi thông thường
        const newGameState = this.cloneGameState(gameState);
        newGameState.board[to.row][to.col] = piece;
        newGameState.board[from.row][from.col] = null;

        // Cập nhật quyền nhập thành khi vua hoặc xe di chuyển
        if (pieceType === 'king') {
            newGameState.castlingRights[pieceColor] = { kingSide: false, queenSide: false };
        } else if (pieceType === 'rook') {
            if (from.col === 0) { // Xe bên trái
                newGameState.castlingRights[pieceColor].queenSide = false;
            } else if (from.col === 7) { // Xe bên phải
                newGameState.castlingRights[pieceColor].kingSide = false;
            }
        }

        // Xử lý phong tướng cho tốt
        if (pieceType === 'pawn' && this.canPromote(to.row, pieceColor)) {
            return this.promotePawn(newGameState, to.row, to.col, pieceColor, 'queen');
        }

        return newGameState;
    }

    // Lấy tất cả nước đi hợp lệ cho một màu
    static getAllValidMoves(gameState, color) {
        try {
            console.log(`Tìm tất cả nước đi hợp lệ cho ${color}`);

            if (!gameState || !gameState.board || !Array.isArray(gameState.board)) {
                console.error("Game state không hợp lệ trong getAllValidMoves:", gameState);
                return [];
            }

            const moves = [];
            let foundPieces = false;

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = gameState.board[row][col];
                    if (piece && this.getPieceColor(piece) === color) {
                        foundPieces = true;
                        console.log(`Tìm thấy quân ${piece} tại ${row},${col}`);
                        const pieceMoves = this.getValidMoves(gameState, { row, col }, color);
                        console.log(`Các nước đi cho quân ${piece}:`, pieceMoves);
                        pieceMoves.forEach(move => {
                            moves.push({
                                from: { row, col },
                                to: move,
                                piece
                            });
                        });
                    }
                }
            }

            if (!foundPieces) {
                console.error(`Không tìm thấy quân cờ màu ${color} trên bàn cờ`);
            }

            console.log(`Tổng số nước đi hợp lệ cho ${color}:`, moves.length);
            return moves;
        } catch (error) {
            console.error("Lỗi trong getAllValidMoves:", error);
            return [];
        }
    }

    // Kiểm tra trạng thái game
    static getGameStatus(gameState, currentPlayer) {
        const validMoves = this.getAllValidMoves(gameState, currentPlayer);
        const isInCheck = this.isInCheck(gameState, currentPlayer);

        if (validMoves.length === 0) {
            return isInCheck ? 'checkmate' : 'stalemate';
        }

        return isInCheck ? 'check' : 'playing';
    }

    // Lấy ký hiệu nước đi cho phong tướng
    static getMoveNotation(gameState, move) {
        try {
            if (!gameState || !gameState.board || !move || !move.from || !move.to) {
                console.error("Invalid game state or move in getMoveNotation");
                return "";
            }

            const piece = gameState.board[move.from.row][move.from.col];
            if (!piece) {
                console.error("No piece found at the starting position in getMoveNotation");
                return "";
            }

            const pieceType = this.getPieceType(piece);
            if (!pieceType) {
                console.error("Could not determine piece type in getMoveNotation");
                return "";
            }

            const fromSquare = this.getSquareNotation(move.from);
            const toSquare = this.getSquareNotation(move.to);

            // Kiểm tra nếu là nước đi ăn quân
            const isCapture = gameState.board[move.to.row][move.to.col] !== null;
            const captureNotation = isCapture ? 'x' : '';

            // Nếu là quân chốt và có thể phong tướng
            const canPromote = pieceType === 'pawn' &&
                this.canPromote(move.to.row, this.getPieceColor(piece));

            return pieceType === 'pawn'
                ? `${fromSquare}${captureNotation}${toSquare}${canPromote ? '=' : ''}`
                : `${pieceType.charAt(0).toUpperCase()}${fromSquare}${captureNotation}${toSquare}`;
        } catch (error) {
            console.error("Error in getMoveNotation:", error);
            return "";
        }
    }

    // Chuyển đổi tọa độ thành ký hiệu ô cờ (ví dụ: e4)
    static getSquareNotation(square) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[square.col] + ranks[square.row];
    }

    // Kiểm tra xem quân chốt có thể phong tướng không
    static canPromote(row, color) {
        return (color === 'white' && row === 0) || (color === 'black' && row === 7);
    }

    // Thực hiện phong tướng cho quân chốt
    static promotePawn(gameState, row, col, color, promotionPiece) {
        try {
            // Kiểm tra tham số đầu vào
            if (!gameState || !Array.isArray(gameState.board) || gameState.board.length !== 8) {
                console.error("gameState không hợp lệ:", gameState);
                return gameState;
            }

            if (!this.isValidPosition(row, col)) {
                console.error("Vị trí không hợp lệ:", row, col);
                return gameState;
            }

            if (!color || !['white', 'black'].includes(color)) {
                console.error("Màu quân cờ không hợp lệ:", color);
                return gameState;
            }

            // Kiểm tra xem quân cờ có phải là tốt không
            const piece = gameState.board[row][col];
            if (!piece || this.getPieceType(piece) !== 'pawn') {
                console.error("Quân cờ không phải là tốt:", piece);
                return gameState;
            }

            // Kiểm tra xem tốt có ở vị trí có thể phong tướng không
            if (!this.canPromote(row, color)) {
                console.error("Tốt không ở vị trí có thể phong tướng:", row, color);
                return gameState;
            }

            if (!promotionPiece || !['queen', 'rook', 'bishop', 'knight'].includes(promotionPiece)) {
                console.error("Quân cờ phong tướng không hợp lệ:", promotionPiece);
                promotionPiece = 'queen'; // Mặc định phong hậu
            }

            // Clone game state
            const newGameState = this.cloneGameState(gameState);

            // Tạo quân cờ mới
            const promotedPiece = `${color}_${promotionPiece}`;

            // Cập nhật trạng thái
            newGameState.board[row][col] = promotedPiece;

            console.log("Phong tướng thành công:", {
                từ: gameState.board[row][col],
                thành: promotedPiece,
                tại: `${row},${col}`
            });

            return newGameState;
        } catch (error) {
            console.error("Lỗi trong promotePawn:", error);
            return gameState; // Trả về trạng thái cũ nếu có lỗi
        }
    }

    // Clone trạng thái game
    static cloneGameState(gameState) {
        try {
            if (!gameState || !gameState.board || !Array.isArray(gameState.board)) {
                console.error('Invalid gameState:', gameState);
                return {
                    board: Array(8).fill().map(() => Array(8).fill(null)),
                    castlingRights: {
                        white: { kingSide: false, queenSide: false },
                        black: { kingSide: false, queenSide: false }
                    },
                    moveHistory: []
                };
            }

            return {
                board: gameState.board.map(row => [...row]),
                castlingRights: {
                    white: {
                        kingSide: gameState.castlingRights?.white?.kingSide ?? false,
                        queenSide: gameState.castlingRights?.white?.queenSide ?? false
                    },
                    black: {
                        kingSide: gameState.castlingRights?.black?.kingSide ?? false,
                        queenSide: gameState.castlingRights?.black?.queenSide ?? false
                    }
                },
                moveHistory: Array.isArray(gameState.moveHistory) ? [...gameState.moveHistory] : []
            };
        } catch (error) {
            console.error('Error in cloneGameState:', error);
            return {
                board: Array(8).fill().map(() => Array(8).fill(null)),
                castlingRights: {
                    white: { kingSide: false, queenSide: false },
                    black: { kingSide: false, queenSide: false }
                },
                moveHistory: []
            };
        }
    }
}

export { ChessEngine };