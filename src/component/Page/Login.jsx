import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { auth, db } from '../../FireBase/config';
import { toast } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../Css/Page/Login.css';

/**
 * Component form đăng nhập
 * @param {Object} props - Component properties
 * @param {Function} props.onSwitchToSignUp - Callback function để chuyển sang form đăng ký
 */
function LoginForm({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  // State quản lý thông tin đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // State quản lý lỗi
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Hàm reset lỗi
  const resetErrors = () => {
    setErrors({
      email: '',
      password: ''
    });
  };

  /**
   * Xử lý sự kiện đăng nhập
   * @param {Event} e - Event object
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    resetErrors();
    console.log('Attempting login with:', { email, password });

    // Validate input
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email không được để trống' }));
      return;
    }
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: 'Mật khẩu không được để trống' }));
      return;
    }

    try {
      // Gọi Firebase Authentication để đăng nhập
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase response:', userCredential);

      // Kiểm tra thông tin user trong Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('User data from Firestore:', userDoc.data());
        toast.success(`Đăng nhập thành công! Xin chào ${email}`, {
          position: "top-center",
        });
        setLoginSuccess(true);
        // Chuyển hướng đến trang Home sau 1 giây
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        console.log('No user data found in Firestore');
        toast.warning(`Đăng nhập thành công với ${email} nhưng không tìm thấy thông tin người dùng!`);
      }
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Xử lý các loại lỗi khác nhau
      switch (error.code) {
        case 'auth/invalid-email':
          setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
          break;
        case 'auth/user-not-found':
          setErrors(prev => ({ ...prev, email: 'Tài khoản không tồn tại' }));
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrors(prev => ({
            email: 'Email hoặc mật khẩu không chính xác',
            password: 'Email hoặc mật khẩu không chính xác'
          }));
          break;
        case 'auth/too-many-requests':
          toast.error('Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.');
          break;
        default:
          toast.error(`Đã có lỗi xảy ra: ${error.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="login-container">
        {/* Background elements */}
        <div className="login-background-pattern"></div>
        <div className="login-background-overlay"></div>

        <div className="login-content">
          {/* Tiêu đề */}
          <div className="login-content_title">
            <h1 className="login-title">
            CHESS 
        
          </h1>
          <img src="https://img.icons8.com/?size=100&id=WQV0m5UDUsBg&format=png&color=000000" alt="" />
          </div>

          {loginSuccess && (
            <div className="login-success-message">
              Đăng nhập thành công!
            </div>
          )}

          <div className="login-form-container">
            <div>
              {/* Input field cho email */}
              <div className="login-input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) resetErrors();
                  }}
                  className={`login-input-field ${errors.email ? 'login-input-error' : ''}`}
                  required
                />
                {errors.email && <span className="login-error-message">{errors.email}</span>}
              </div>

              {/* Input field cho password */}
              <div className="login-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) resetErrors();
                  }}
                  className={`login-input-field ${errors.password ? 'login-input-error' : ''}`}
                  required
                />
                {errors.password && <span className="login-error-message">{errors.password}</span>}
              </div>

              {/* Nút đăng nhập chính */}
              <button type="submit" className="login-primary-btn">
                Đăng nhập
              </button>
            </div>

            {/* Phần chia cách giữa đăng nhập thường và đăng nhập mạng xã hội */}
            <div className="login-divider">
              <div className="login-divider-line"></div>
              <span className="login-divider-text">hoặc</span>
            </div>

            {/* Các nút đăng nhập mạng xã hội */}
            <div>
              {/* Nút đăng nhập Google */}
              <button type="button" className="login-social-btn login-google-btn">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng nhập với Google
              </button>

              {/* Nút đăng nhập Facebook */}
              <button type="button" className="login-social-btn login-facebook-btn">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Đăng nhập với Facebook
              </button>
            </div>

            {/* Link chuyển sang form đăng ký */}
            <div className="login-switch-link">
              <span className="login-normal-text">Chưa có tài khoản? </span>
              <button type="button" className="login-link-btn" onClick={onSwitchToSignUp}>
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;