import React from 'react';
import './Style/PromotionDialog.css';

// Import piece images
import q_b from '../../../assets/q_b.png';
import q_w from '../../../assets/q_w.png';
import r_b from '../../../assets/r_b.png';
import r_w from '../../../assets/r_w.png';
import b_b from '../../../assets/b_b.png';
import b_w from '../../../assets/b_w.png';
import n_b from '../../../assets/n_b.png';
import n_w from '../../../assets/n_w.png';

const pieceImages = {
    'black_queen': q_b,
    'white_queen': q_w,
    'black_rook': r_b,
    'white_rook': r_w,
    'black_bishop': b_b,
    'white_bishop': b_w,
    'black_knight': n_b,
    'white_knight': n_w,
};

const PromotionDialog = ({ isOpen, color, onSelect, onClose }) => {
    if (!isOpen) return null;

    const pieces = [
        { type: 'queen', label: 'Hậu' },
        { type: 'rook', label: 'Xe' },
        { type: 'bishop', label: 'Tượng' },
        { type: 'knight', label: 'Mã' }
    ];

    const handlePieceClick = (pieceType) => {
        onSelect(pieceType);
        onClose();
    };

    return (
        <div className="promotion-dialog-overlay" onClick={onClose}>
            <div className="promotion-dialog" onClick={e => e.stopPropagation()}>
                <h3>Chọn quân cờ để phong tướng</h3>
                <div className="promotion-pieces">
                    {pieces.map(({ type, label }) => (
                        <button
                            key={type}
                            className="piece-button"
                            onClick={() => handlePieceClick(type)}
                            title={label}
                        >
                            <img
                                src={pieceImages[`${color}_${type}`]}
                                alt={label}
                                className="promotion-piece-image"
                            />
                            <span className="piece-label">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromotionDialog; 