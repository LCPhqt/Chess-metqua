import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bot, Search, Settings, LogOut, Info, X, Edit, Save } from 'lucide-react';
import '../../Css/Page/Home.css';
import { useUser } from '../../contexts/UserContext';
import { auth, db } from '../../FireBase/config';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import ColorSelectionDialog from '../GameMode/PlayWithBot/ColorSelectionDialog';
import new_pic from '../../assets/new_pic.png'; 
import new_pic1 from '../../assets/new_pic1.png';
import { v4 as uuidv4 } from 'uuid';


const ChessHomepage = () => {
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();
    const [showPlayerInfo, setShowPlayerInfo] = useState(false);
    const [showColorSelection, setShowColorSelection] = useState(false);
    const [botHistory, setBotHistory] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: user?.fullName || '',
        username: user?.username || '',
        email: user?.email || '',
        dateOfBirth: user?.dateOfBirth || '',
        nationality: user?.nationality || '',
        gender: user?.gender || ''
    });

    // Hàm chuyển đổi ngày từ ISO string sang format DD/MM/YYYY
    const formatDateToDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return '';
        }
    };

    // Hàm chuyển đổi ngày từ format DD/MM/YYYY sang Date object
    const parseDateFromInput = (dateString) => {
        if (!dateString.trim()) return null;

        // Kiểm tra format DD/MM/YYYY
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = dateString.match(dateRegex);

        if (!match) return null;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
        const year = parseInt(match[3], 10);

        const date = new Date(year, month, day);

        // Kiểm tra xem ngày có hợp lệ không
        if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
            return null;
        }

        return date;
    };

    // Hàm validate ngày sinh
    const validateDateOfBirth = (dateString) => {
        if (!dateString.trim()) return true; // Cho phép để trống

        const date = parseDateFromInput(dateString);
        if (!date) return false;

        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            return age - 1 >= 0;
        }

        return age >= 0;
    };

    // Cập nhật editForm khi user thay đổi
    useEffect(() => {
        setEditForm({
            fullName: user?.fullName || '',
            username: user?.username || '',
            email: user?.email || '',
            dateOfBirth: formatDateToDisplay(user?.dateOfBirth),
            nationality: user?.nationality || '',
            gender: user?.gender || ''
        });
    }, [user]);

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

    // Thêm hàm này để điều hướng khi bấm "Chơi với bạn"
    const handlePlayWithFriend = () => {
        const roomId = uuidv4();
        navigate(`/play-with-friend/${roomId}`);
    };
    const handleShowPlayerInfo = () => {
        setShowPlayerInfo(true);

        // Reset form khi mở modal - reset tất cả các trường
        setEditForm({
            fullName: user?.fullName || '',
            username: user?.username || '',
            email: user?.email || '',
            dateOfBirth: formatDateToDisplay(user?.dateOfBirth),
            nationality: user?.nationality || '',
            gender: user?.gender || ''
        });
        setIsEditing(false);
    };

    const handleClosePlayerInfo = () => {
        setShowPlayerInfo(false);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);

        // Reset form về giá trị ban đầu - reset tất cả các trường
        setEditForm({
            fullName: user?.fullName || '',
            username: user?.username || '',
            email: user?.email || '',
            dateOfBirth: formatDateToDisplay(user?.dateOfBirth),
            nationality: user?.nationality || '',
            gender: user?.gender || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Xử lý đặc biệt cho trường ngày sinh
        if (name === 'dateOfBirth') {
            // Chỉ cho phép nhập số và dấu /
            const filteredValue = value.replace(/[^0-9/]/g, '');

            // Tự động thêm dấu / sau ngày và tháng
            let formattedValue = filteredValue;
            if (filteredValue.length >= 2 && !filteredValue.includes('/')) {
                formattedValue = filteredValue.slice(0, 2) + '/' + filteredValue.slice(2);
            }
            if (formattedValue.length >= 5 && formattedValue.split('/').length === 2) {
                formattedValue = formattedValue.slice(0, 5) + '/' + formattedValue.slice(5);
            }

            // Giới hạn độ dài tối đa
            if (formattedValue.length <= 10) {
                setEditForm(prev => ({
                    ...prev,
                    [name]: formattedValue
                }));
            }
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (!user?.uid) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            // Validate form - kiểm tra các trường bắt buộc
            if (!editForm.fullName.trim()) {
                toast.error('Tên tài khoản không được để trống');
                return;
            }

            if (!editForm.nationality.trim()) {
                toast.error('Nước không được để trống');
                return;
            }

            if (!editForm.gender.trim()) {
                toast.error('Giới tính không được để trống');
                return;
            }

            // Validate ngày sinh
            if (editForm.dateOfBirth.trim() && !validateDateOfBirth(editForm.dateOfBirth)) {
                toast.error('Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY');
                return;
            }

            // Xử lý ngày sinh - chuyển đổi sang timestamp nếu có giá trị
            let dateOfBirthValue = null;
            if (editForm.dateOfBirth.trim()) {
                const date = parseDateFromInput(editForm.dateOfBirth);
                if (date) {
                    dateOfBirthValue = date.toISOString();
                } else {
                    toast.error('Ngày sinh không hợp lệ');
                    return;
                }
            }

            // Update user data in Firestore - cập nhật tất cả các trường
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                fullName: editForm.fullName.trim(),
                dateOfBirth: dateOfBirthValue,
                nationality: editForm.nationality.trim(),
                gender: editForm.gender.trim(),
                updatedAt: new Date()
            });

            toast.success('Cập nhật thông tin thành công');
            setIsEditing(false);

            // Refresh user data
            await refreshUser();
        } catch (error) {
            console.error('Error updating user data:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
        }
    };

    useEffect(() => {
    const history = JSON.parse(localStorage.getItem('botHistory') || '[]');
    setBotHistory(history.reverse());
}, []);

    return (
        <>
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
                </div>

                {/* Chế độ chơi */}
              <div className="section-card">
    <h3 className="section-title">Chế độ chơi</h3>
    <div className="game-modes">
        <button className="mode-button" onClick={handlePlayWithFriend}>
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
                
            {/* Lịch sử đấu với máy*/}
            <div className="section-card">
                <h3>Lịch sử đấu </h3>
                {botHistory.length === 0 && <p>Chưa có ván nào.</p>}
                <ul>
                  {botHistory.map((game, idx) => (
                    <li key={idx}>
                      {game.date} - {game.playerColor} - {game.result}
                    </li>
                  ))}
                </ul>
            </div>
            <div className="section-card">

                </div>
            </div>  
            {/* News */}
            <div className="main-content">
                <div className="parent">
                <h2 className='section-title'>
                    NEWS
                </h2>   
                <h1 className='section-card' id='1'></h1>
                
                
                <h1 className='section-card' id='1'>
                    Firouzja Defends Title, Wins 3rd Bullet Chess Championship
                    < a href="https://chess.com/news" target="_blank" rel="noopener noreferrer">
                    <img src={new_pic} alt="new" width="500" className='image'/>
                    </a>
                    </h1>
                    
                <h1 className='section-card' id='1'>
                    Do You Know This Famous Pattern?
                    <a href="https://chess.com/news" target="_blank" rel="noopener noreferrer">
                    <img src={"https://images.chesscomfiles.com/uploads/v1/news/1698742.b852491a.507x286o.b53f3aa8e640@2x.png"} alt="new" width="500" className='image'/>
                    </a>
                    </h1>
                 <h1 className='section-card' id='1'>
                   Rare Fourth Moves
                   <a href="https://chess.com/news" target="_blank" rel="noopener noreferrer">
                    <img src={"https://images.chesscomfiles.com/uploads/v1/video/9851.202e2ac5.507x286o.8bdc6c84f09d@2x.png"} alt="new" width="500" className='image'/>
                    </a>
                    </h1>
                 <h1 className='section-card' id='1'>
                    Do You Know This Famous Pattern?
                    < a href="https://chess.com/news" target="_blank" rel="noopener noreferrer">
                    <img src={new_pic1} alt="new" width="500" className='image'/>
                    </a>
                    </h1>
                    </div>
            </div>
            

            {/* Modal thông tin người chơi */}
            {showPlayerInfo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2> Thông tin người chơi</h2>
                            <div className="modal-actions">
                                {!isEditing && (
                                    <button className="modal-action-button edit-button" onClick={handleEditClick}>
                                        <Edit size={20} />
                                    </button>
                                )}
                                <button className="modal-close" onClick={handleClosePlayerInfo}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {isEditing ? (
                                // Form chỉnh sửa
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Tên tài khoản:</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={editForm.fullName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            disabled
                                            className="form-input disabled"
                                            placeholder="Email (không thể thay đổi)"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày sinh:</label>
                                        <input
                                            type="text"
                                            name="dateOfBirth"
                                            value={editForm.dateOfBirth}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="DD/MM/YYYY"
                                            maxLength="10"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nước:</label>
                                        <select
                                            name="nationality"
                                            value={editForm.nationality}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="">Chọn nước</option>
                                            <option value="Việt Nam">Việt Nam</option>
                                            <option value="Hoa Kỳ">Hoa Kỳ</option>
                                            <option value="Trung Quốc">Trung Quốc</option>
                                            <option value="Nhật Bản">Nhật Bản</option>
                                            <option value="Hàn Quốc">Hàn Quốc</option>
                                            <option value="Singapore">Singapore</option>
                                            <option value="Thái Lan">Thái Lan</option>
                                            <option value="Malaysia">Malaysia</option>
                                            <option value="Indonesia">Indonesia</option>
                                            <option value="Philippines">Philippines</option>
                                            <option value="Campuchia">Campuchia</option>
                                            <option value="Lào">Lào</option>
                                            <option value="Myanmar">Myanmar</option>
                                            <option value="Brunei">Brunei</option>
                                            <option value="Đông Timo">Đông Timo</option>
                                            <option value="Ấn Độ">Ấn Độ</option>
                                            <option value="Pakistan">Pakistan</option>
                                            <option value="Bangladesh">Bangladesh</option>
                                            <option value="Sri Lanka">Sri Lanka</option>
                                            <option value="Nepal">Nepal</option>
                                            <option value="Bhutan">Bhutan</option>
                                            <option value="Maldives">Maldives</option>
                                            <option value="Afghanistan">Afghanistan</option>
                                            <option value="Kazakhstan">Kazakhstan</option>
                                            <option value="Uzbekistan">Uzbekistan</option>
                                            <option value="Kyrgyzstan">Kyrgyzstan</option>
                                            <option value="Tajikistan">Tajikistan</option>
                                            <option value="Turkmenistan">Turkmenistan</option>
                                            <option value="Mông Cổ">Mông Cổ</option>
                                            <option value="Iran">Iran</option>
                                            <option value="Iraq">Iraq</option>
                                            <option value="Kuwait">Kuwait</option>
                                            <option value="Saudi Arabia">Saudi Arabia</option>
                                            <option value="Bahrain">Bahrain</option>
                                            <option value="Qatar">Qatar</option>
                                            <option value="UAE">UAE</option>
                                            <option value="Oman">Oman</option>
                                            <option value="Yemen">Yemen</option>
                                            <option value="Jordan">Jordan</option>
                                            <option value="Lebanon">Lebanon</option>
                                            <option value="Syria">Syria</option>
                                            <option value="Israel">Israel</option>
                                            <option value="Palestine">Palestine</option>
                                            <option value="Turkey">Turkey</option>
                                            <option value="Cyprus">Cyprus</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Armenia">Armenia</option>
                                            <option value="Azerbaijan">Azerbaijan</option>
                                            <option value="Russia">Russia</option>
                                            <option value="Ukraine">Ukraine</option>
                                            <option value="Belarus">Belarus</option>
                                            <option value="Moldova">Moldova</option>
                                            <option value="Romania">Romania</option>
                                            <option value="Bulgaria">Bulgaria</option>
                                            <option value="Greece">Greece</option>
                                            <option value="Albania">Albania</option>
                                            <option value="North Macedonia">North Macedonia</option>
                                            <option value="Kosovo">Kosovo</option>
                                            <option value="Serbia">Serbia</option>
                                            <option value="Montenegro">Montenegro</option>
                                            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                            <option value="Croatia">Croatia</option>
                                            <option value="Slovenia">Slovenia</option>
                                            <option value="Hungary">Hungary</option>
                                            <option value="Slovakia">Slovakia</option>
                                            <option value="Czech Republic">Czech Republic</option>
                                            <option value="Poland">Poland</option>
                                            <option value="Lithuania">Lithuania</option>
                                            <option value="Latvia">Latvia</option>
                                            <option value="Estonia">Estonia</option>
                                            <option value="Finland">Finland</option>
                                            <option value="Sweden">Sweden</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Denmark">Denmark</option>
                                            <option value="Iceland">Iceland</option>
                                            <option value="Germany">Germany</option>
                                            <option value="Austria">Austria</option>
                                            <option value="Switzerland">Switzerland</option>
                                            <option value="Liechtenstein">Liechtenstein</option>
                                            <option value="Luxembourg">Luxembourg</option>
                                            <option value="Belgium">Belgium</option>
                                            <option value="Netherlands">Netherlands</option>
                                            <option value="France">France</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Portugal">Portugal</option>
                                            <option value="Italy">Italy</option>
                                            <option value="San Marino">San Marino</option>
                                            <option value="Vatican City">Vatican City</option>
                                            <option value="Malta">Malta</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Ireland">Ireland</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="Guatemala">Guatemala</option>
                                            <option value="Belize">Belize</option>
                                            <option value="El Salvador">El Salvador</option>
                                            <option value="Honduras">Honduras</option>
                                            <option value="Nicaragua">Nicaragua</option>
                                            <option value="Costa Rica">Costa Rica</option>
                                            <option value="Panama">Panama</option>
                                            <option value="Colombia">Colombia</option>
                                            <option value="Venezuela">Venezuela</option>
                                            <option value="Guyana">Guyana</option>
                                            <option value="Suriname">Suriname</option>
                                            <option value="French Guiana">French Guiana</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="Ecuador">Ecuador</option>
                                            <option value="Peru">Peru</option>
                                            <option value="Bolivia">Bolivia</option>
                                            <option value="Paraguay">Paraguay</option>
                                            <option value="Uruguay">Uruguay</option>
                                            <option value="Argentina">Argentina</option>
                                            <option value="Chile">Chile</option>
                                            <option value="Australia">Australia</option>
                                            <option value="New Zealand">New Zealand</option>
                                            <option value="Fiji">Fiji</option>
                                            <option value="Papua New Guinea">Papua New Guinea</option>
                                            <option value="Solomon Islands">Solomon Islands</option>
                                            <option value="Vanuatu">Vanuatu</option>
                                            <option value="New Caledonia">New Caledonia</option>
                                            <option value="Samoa">Samoa</option>
                                            <option value="Tonga">Tonga</option>
                                            <option value="Tuvalu">Tuvalu</option>
                                            <option value="Kiribati">Kiribati</option>
                                            <option value="Nauru">Nauru</option>
                                            <option value="Palau">Palau</option>
                                            <option value="Micronesia">Micronesia</option>
                                            <option value="Marshall Islands">Marshall Islands</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Namibia">Namibia</option>
                                            <option value="Botswana">Botswana</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Angola">Angola</option>
                                            <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                                            <option value="Republic of the Congo">Republic of the Congo</option>
                                            <option value="Gabon">Gabon</option>
                                            <option value="Equatorial Guinea">Equatorial Guinea</option>
                                            <option value="Cameroon">Cameroon</option>
                                            <option value="Central African Republic">Central African Republic</option>
                                            <option value="Chad">Chad</option>
                                            <option value="Niger">Niger</option>
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="Benin">Benin</option>
                                            <option value="Togo">Togo</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Ivory Coast">Ivory Coast</option>
                                            <option value="Liberia">Liberia</option>
                                            <option value="Sierra Leone">Sierra Leone</option>
                                            <option value="Guinea">Guinea</option>
                                            <option value="Guinea-Bissau">Guinea-Bissau</option>
                                            <option value="Senegal">Senegal</option>
                                            <option value="The Gambia">The Gambia</option>
                                            <option value="Mauritania">Mauritania</option>
                                            <option value="Mali">Mali</option>
                                            <option value="Burkina Faso">Burkina Faso</option>
                                            <option value="Algeria">Algeria</option>
                                            <option value="Tunisia">Tunisia</option>
                                            <option value="Libya">Libya</option>
                                            <option value="Egypt">Egypt</option>
                                            <option value="Sudan">Sudan</option>
                                            <option value="South Sudan">South Sudan</option>
                                            <option value="Ethiopia">Ethiopia</option>
                                            <option value="Eritrea">Eritrea</option>
                                            <option value="Djibouti">Djibouti</option>
                                            <option value="Somalia">Somalia</option>
                                            <option value="Kenya">Kenya</option>
                                            <option value="Uganda">Uganda</option>
                                            <option value="Tanzania">Tanzania</option>
                                            <option value="Rwanda">Rwanda</option>
                                            <option value="Burundi">Burundi</option>
                                            <option value="Malawi">Malawi</option>
                                            <option value="Mozambique">Mozambique</option>
                                            <option value="Madagascar">Madagascar</option>
                                            <option value="Comoros">Comoros</option>
                                            <option value="Mauritius">Mauritius</option>
                                            <option value="Seychelles">Seychelles</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Giới tính:</label>
                                        <select
                                            name="gender"
                                            value={editForm.gender}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày tham gia:</label>
                                        <span className="readonly-field">
                                            {user?.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </span>
                                    </div>

                                    <div className="form-actions">
                                        <button className="action-button save-button" onClick={handleSaveChanges}>
                                            <Save size={16} />
                                            Lưu thay đổi
                                        </button>
                                        <button className="action-button cancel-button" onClick={handleCancelEdit}>
                                            <X size={16} />
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Hiển thị thông tin (chế độ xem)
                                <>
                                    <div className="player-info-item">
                                        <label>Tên tài khoản:</label>
                                        <span>{user?.fullName || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="player-info-item">
                                        <label>Email:</label>
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="player-info-item">
                                        <label>Ngày sinh:</label>
                                        <span>{user?.dateOfBirth ? (() => {
                                            try {
                                                const date = new Date(user.dateOfBirth);
                                                if (isNaN(date.getTime())) {
                                                    return 'Ngày không hợp lệ';
                                                }
                                                return date.toLocaleDateString('vi-VN');
                                            } catch (error) {
                                                return 'Ngày không hợp lệ';
                                            }
                                        })() : 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="player-info-item">
                                        <label>Nước:</label>
                                        <span>{user?.nationality || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="player-info-item">
                                        <label>Giới tính:</label>
                                        <span>{user?.gender || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="player-info-item">
                                        <label>Ngày tham gia:</label>
                                        <span>{user?.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                                    </div>
                                </>
                            )}
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

        
            
        <footer class="site-footer">
  <div class="footer-links">
    <a href="/support">Support</a>
    <span class="separator">•</span>
    <a href="/terms">Chess Terms</a>
    <span class="separator">•</span>
    <a href="/about">About</a>
    <span class="separator">•</span>
    <a href="/jobs">Jobs</a>
    <span class="separator">•</span>
    <a href="/developers">Developers</a>
    <span class="separator">•</span>
    <a href="/agreement">User Agreement</a>
    <span class="separator">•</span>
    <a href="/privacy">Privacy Policy</a>
    <span class="separator">•</span>
    <a href="/settings">Privacy Settings</a>
    <span class="separator">•</span>
    <a href="/fairplay">Fair Play</a>
    <span class="separator">•</span>
    <a href="/partners">Partners</a>
    <span class="separator">•</span>
    <a href="/compliance">Compliance</a>
  </div>
  <div class="footer-copyright">
    <span>Chess.com © 2025</span>
  </div>
</footer>
            </>
    );
};

export default ChessHomepage;