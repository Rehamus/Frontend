import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

const LoginFailurePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('error') || '로그인에 실패했습니다.';

    const handleRetry = () => {
        navigate('/login');
    };

    return (
        <div className="container">
            <main className="main">
                <div className="login-form">
                    <h2>로그인 실패</h2>
                    <p>{errorMessage}</p>
                    <button onClick={handleRetry} className="button">다시 시도</button>
                </div>
            </main>
            <footer className="footer">
                <p>&copy; 2023 11조 프로젝트. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default LoginFailurePage;
