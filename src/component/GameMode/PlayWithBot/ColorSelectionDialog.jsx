import React from 'react';
import './Style/ColorSelectionDialog.css';

const ColorSelectionDialog = ({ isOpen, onSelect, onClose }) => {
    if (!isOpen) return null;

    const handleColorSelect = (color) => {
        onSelect(color);
        onClose();
    };

    return (
        <div className="color-selection-overlay" onClick={onClose}>
            <div className="color-selection-dialog" onClick={e => e.stopPropagation()}>
                <h3>Chọn màu quân cờ</h3>
                <div className="color-options">
                    <button
                        className="color-button white-button"
                        onClick={() => handleColorSelect('white')}
                    >
                        <div className="piece-preview white-piece">♔</div>
                        <span>Quân Trắng</span>
                    </button>
                    <button
                        className="color-button black-button"
                        onClick={() => handleColorSelect('black')}
                    >
                        <div className="piece-preview black-piece">♚</div>
                        <span>Quân Đen</span>
                    </button>
                    <button
                        className="color-button random-button"
                        onClick={() => handleColorSelect('random')}
                    >
                        <div className="piece-preview">🎲</div>
                        <span>Ngẫu nhiên</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColorSelectionDialog; 