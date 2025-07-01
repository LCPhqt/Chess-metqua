import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';

export default function Piece({ piece: { type, color }, position }) {
  const pieceImg = require(`../../../assets/assets2/${type}_${color}.png`); // link đường dẫn chứa hình cờ 

  // ✅ Dùng cú pháp mới của useDrag (arrow function)
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'piece', // phải đặt ở cấp cao nhất
    item: {
      id: `${position}_${type}_${color}`,
      position,
      pieceType: type,
      color,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <>
      <DragPreviewImage connect={preview} src={pieceImg} />
      <div
        className="piece-container"
        ref={drag}
        style={{ opacity: isDragging ? 0.3 : 1 }}
      >
        <img src={pieceImg} alt={`${color} ${type}`} className="piece" />
      </div>
    </>
  );
}
