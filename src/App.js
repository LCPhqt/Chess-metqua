import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './component/Page/Login.jsx';
import SignUpForm from './component/Page/SignUp.jsx';
import Home from './component/Page/Home.jsx';
import ChessGame from './component/GameMode/PlayWithBot/ChessGame';
import { UserProvider, useUser } from './contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

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
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            isLoginMode ? (
              <LoginForm onSwitchToSignUp={switchToSignUp} />
            ) : (
              <SignUpForm onSwitchToLogin={switchToLogin} />
            )
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/play-with-bot" element={
            <ProtectedRoute>
              <ChessGame />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <ToastContainer />
    </UserProvider>
  );
};

export default App;