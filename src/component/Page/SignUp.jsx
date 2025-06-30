import React, { useState } from 'react';
import '../../Css/Page/SignUp.css';
import { auth, db } from '../../FireBase/config';
import { setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';


/**
 * Component SignUpForm - Form đăng ký người dùng mới
 * @param {Object} props - Props của component
 * @param {Function} props.onSwitchToLogin - Hàm callback để chuyển sang form đăng nhập
 */
function SignUpForm({ onSwitchToLogin }) {
    // Khởi tạo state cho dữ liệu form
    const [formData, setFormData] = useState({
        fullName: '',        // Họ tên người dùng
        username: '',        // Tên đăng nhập
        email: '',          // Email
        password: '',       // Mật khẩu
        confirmPassword: '' // Xác nhận mật khẩu
    });

    // State để lưu trữ các lỗi validation và thông báo thành công
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Xử lý sự kiện thay đổi giá trị input
     * @param {string} field - Tên trường dữ liệu
     * @param {string} value - Giá trị mới
     */
    const handleInputChange = (field, value) => {
        // Cập nhật giá trị mới cho field tương ứng
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    /**
     * Kiểm tra tính hợp lệ của form
     * @returns {Object} Đối tượng chứa các lỗi (nếu có)
     */
    const validateForm = () => {
        const newErrors = {};

        // Kiểm tra họ tên
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên không được để trống';
        }

        // Kiểm tra tên đăng nhập
        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập không được để trống';
        }

        // Kiểm tra email
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Kiểm tra mật khẩu
        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Kiểm tra xác nhận mật khẩu
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return newErrors;
    };

    /**
     * Xử lý sự kiện submit form
     * @param {Event} e - Event object
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset messages
        setErrors({});
        setSuccessMessage('');

        // Kiểm tra validation form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            // Tạo tài khoản mới với Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            if (userCredential.user) {
                try {
                    const userData = {
                        fullName: formData.fullName,
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                        createdAt: new Date()
                    };

                    // Save user data to Firestore
                    const userRef = doc(db, "users", userCredential.user.uid);
                    await setDoc(userRef, userData);

                    setSuccessMessage('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');

                    // Đợi 2 giây trước khi chuyển sang trang đăng nhập
                    setTimeout(() => {
                        onSwitchToLogin();
                    }, 2000);

                } catch (firestoreError) {
                    console.error("Error saving to Firestore:", firestoreError);
                    setErrors({ submit: 'Không thể lưu thông tin người dùng. Vui lòng thử lại.' });
                }
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error.message);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setErrors({ email: 'Email đã được sử dụng' });
                    break;
                case 'auth/invalid-email':
                    setErrors({ email: 'Email không hợp lệ' });
                    break;
                case 'auth/operation-not-allowed':
                    setErrors({ email: 'Tài khoản email chưa được kích hoạt' });
                    break;
                case 'auth/weak-password':
                    setErrors({ password: 'Mật khẩu quá yếu' });
                    break;
                default:
                    setErrors({ submit: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
            }
        }
    };

    /**
     * Xử lý đăng ký bằng Google
     * TODO: Implement chức năng đăng ký bằng Google
     */
    const handleGoogleSignUp = () => {
        console.log('Google Sign Up clicked');
    };

    /**
     * Xử lý đăng ký bằng Facebook
     * TODO: Implement chức năng đăng ký bằng Facebook
     */
    const handleFacebookSignUp = () => {
        console.log('Facebook Sign Up clicked');
    };

    // Render component
    return (
        <div className="signup-container">
            {/* Background elements */}
            <div className="signup-background-pattern"></div>
            <div className="signup-background-overlay"></div>
        
            <div className="signup-content">    
                <h1 className="signup-title">
                    <span>Tham Gia Chess Play</span>
                    <img src="https://img.icons8.com/?size=100&id=vWVrEKSUg8dF&format=png&color=000000" alt="" className='image' />
                </h1>
                
                <div className="signup-form-container">
                    {/* Form đăng ký */}
                    <form onSubmit={handleSubmit}>
                        {/* Input họ tên */}
                        <div className="signup-input-group">
                            <input
                                type="text"
                                placeholder="Họ và Tên"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className={`signup-input-field ${errors.fullName ? 'signup-input-field-error' : ''}`}
                            />
                            {errors.fullName && <span className="signup-error-message">{errors.fullName}</span>}
                        </div>

                        {/* Input tên đăng nhập */}
                        <div className="signup-input-group">
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className={`signup-input-field ${errors.username ? 'signup-input-field-error' : ''}`}
                            />
                            {errors.username && <span className="signup-error-message">{errors.username}</span>}
                        </div>

                        {/* Input email */}
                        <div className="signup-input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`signup-input-field ${errors.email ? 'signup-input-field-error' : ''}`}
                            />
                            {errors.email && <span className="signup-error-message">{errors.email}</span>}
                        </div>

                        {/* Input mật khẩu */}
                        <div className="signup-input-group">
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`signup-input-field ${errors.password ? 'signup-input-field-error' : ''}`}
                            />
                            {errors.password && <span className="signup-error-message">{errors.password}</span>}
                        </div>

                        {/* Input xác nhận mật khẩu */}
                        <div className="signup-input-group">
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className={`signup-input-field ${errors.confirmPassword ? 'signup-input-field-error' : ''}`}
                            />
                            {errors.confirmPassword && <span className="signup-error-message">{errors.confirmPassword}</span>}
                        </div>

                        {/* Hiển thị thông báo thành công */}
                        {successMessage && (
                            <div className="signup-success-message">
                                {successMessage}
                            </div>
                        )}

                        {/* Hiển thị lỗi chung của form nếu có */}
                        {errors.submit && (
                            <div className="signup-error-message">
                                {errors.submit}
                            </div>
                        )}

                        {/* Nút đăng ký */}
                        <button type="submit" className="signup-primary-btn">
                            Đăng Ký
                        </button>
                    </form>

                    {/* Phần chia cách giữa form và social buttons */}
                    <div className="signup-divider">
                        <div className="signup-divider-line"></div>
                        <span className="signup-divider-text">hoặc</span>
                    </div>

                    {/* Các nút đăng ký bằng mạng xã hội */}
                    <div>
                        {/* Nút đăng ký bằng Google */}
                        <button
                            type="button"
                            className="signup-social-btn signup-google-btn"
                            onClick={handleGoogleSignUp}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Đăng ký với Google
                        </button>

                        {/* Nút đăng ký bằng Facebook */}
                        <button
                            type="button"
                            className="signup-social-btn signup-facebook-btn"
                            onClick={handleFacebookSignUp}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Đăng ký với Facebook
                        </button>
                    </div>

                    {/* Link chuyển sang form đăng nhập */}
                    <div className="signup-switch-link">
                        <span className="signup-normal-text">Đã có tài khoản? </span>
                        <button
                            type="button"
                            className="signup-link-btn"
                            onClick={onSwitchToLogin}
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export component để sử dụng ở nơi khác
export default SignUpForm;