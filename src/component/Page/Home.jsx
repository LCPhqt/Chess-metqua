import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bot, Search, Settings, LogOut, Info, X } from 'lucide-react';
import '../../Css/Page/Home.css';
import { useUser } from '../../contexts/UserContext';
import { auth } from '../../FireBase/config';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import ColorSelectionDialog from '../GameMode/PlayWithBot/ColorSelectionDialog';

const ChessHomepage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [showPlayerInfo, setShowPlayerInfo] = useState(false);
    const [showColorSelection, setShowColorSelection] = useState(false);

    const handleBotMode = () => {
        setShowColorSelection(true);
    };

    const handleColorSelect = (color) => {
        const playerColor = color === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : color;
        navigate('/play-with-bot', { state: { playerColor } });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Đăng xuất thành công');
            navigate('/');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi đăng xuất');
        }
    };

    const handleShowPlayerInfo = () => {
        setShowPlayerInfo(true);
    };

    const handleClosePlayerInfo = () => {
        setShowPlayerInfo(false);
    };

    return (
        <div className="chess-homepage">
            <div className="left-sidebar">
                {/* Logo và tiêu đề */}
                <div className="section-card">
                    <h1 className="main-title">Cờ Vua Online</h1>
                    <p className="subtitle">Chơi cờ vua trực tuyến</p>
                </div>

                {/* Thông tin người dùng */}
                <div className="section-card user-section">
                    <div className="user-info">
                        <h3 className="user-name">{user?.fullName || 'vinh'}</h3>
                        <p className="user-email">{user?.email || 'ph12@gmail.com'}</p>
                    </div>
                    <div className="rating-info">
                        <p className="rating-text">Rating: {user?.rating || '1200'}</p>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                        <p className="level-text">Cấp độ: {user?.level || 'Trung cấp'}</p>
                    </div>
                </div>

                {/* Chế độ chơi */}
                <div className="section-card">
                    <h3 className="section-title">Chế độ chơi</h3>
                    <div className="game-modes">
                        <button className="mode-button">
                            <div className="mode-icon friend-icon">
                                <User size={20} />
                            </div>
                            <div className="mode-content">
                                <div className="mode-title">Chơi với bạn</div>
                                <div className="mode-subtitle">Người vs Người</div>
                            </div>
                        </button>

                        <button className="mode-button" onClick={handleBotMode}>
                            <div className="mode-icon bot-icon">
                                <Bot size={20} />
                            </div>
                            <div className="mode-content">
                                <div className="mode-title">Chơi với bot</div>
                                <div className="mode-subtitle">Người vs Máy</div>
                            </div>
                        </button>

                        <button className="mode-button">
                            <div className="mode-icon online-icon">
                                <Search size={20} />
                            </div>
                            <div className="mode-content">
                                <div className="mode-title">Chơi trực tuyến</div>
                                <div className="mode-subtitle">Tìm đối thủ</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Điều khiển */}
                <div className="section-card">
                    <h3 className="section-title">Điều khiển</h3>
                    <div className="controls">
                        <button className="control-button" onClick={handleShowPlayerInfo}>
                            <Info size={20} />
                            <span>Thông tin người chơi</span>
                        </button>
                        <button className="control-button">
                            <Settings size={20} />
                            <span>Cài đặt</span>
                        </button>
                        <button className="control-button logout-button" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="main-content">
                {/* Nội dung chính của trang */}
            </div>

            {/* Modal thông tin người chơi */}
            {showPlayerInfo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Thông tin người chơi</h2>
                            <button className="modal-close" onClick={handleClosePlayerInfo}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="player-info-item">
                                <label>Họ và tên:</label>
                                <span>{user?.fullName || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="player-info-item">
                                <label>Email:</label>
                                <span>{user?.email}</span>
                            </div>
                            <div className="player-info-item">
                                <label>Tên đăng nhập:</label>
                                <span>{user?.username || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="player-info-item">
                                <label>Điểm đánh giá:</label>
                                <span>{user?.rating || 1200}</span>
                            </div>
                            <div className="player-info-item">
                                <label>Cấp độ:</label>
                                <span>{user?.level || 'Trung cấp'}</span>
                            </div>
                            <div className="player-info-item">
                                <label>Ngày tham gia:</label>
                                <span>{user?.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ColorSelectionDialog
                isOpen={showColorSelection}
                onSelect={handleColorSelect}
                onClose={() => setShowColorSelection(false)}
            />
        </div>
    );
};

export default ChessHomepage;