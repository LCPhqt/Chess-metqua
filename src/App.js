import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './component/Page/Login.jsx';
import SignUpForm from './component/Page/SignUp.jsx';
import Home from './component/HomePage/Home.jsx';

const App = () => {
  // State để quản lý form hiện tại (true = Login, false = SignUp)
  const [isLoginMode, setIsLoginMode] = useState(true);

  const switchToSignUp = () => {
    setIsLoginMode(false);
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isLoginMode ? (
            <LoginForm onSwitchToSignUp={switchToSignUp} />
          ) : (
            <SignUpForm onSwitchToLogin={switchToLogin} />
          )
        } />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;