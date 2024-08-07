import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axiosInstance from '../../api/axiosInstance';

const LoginPage = () => {
    const navigate = useNavigate();
    const backendUrl = axiosInstance.defaults.baseURL;

    const handleSocialLogin = (provider) => {
        window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
    };

    return (
        <div className="container">
            <main className="main">
                <div className="login-form">
                    <h2>로그인</h2>
                    <p>소셜 계정으로 간편하게 로그인하세요.</p>
                    <div className="social-btn-container">
                        <button onClick={() => handleSocialLogin('naver')} className="social-btn naver-btn">네이버로 로그인</button>
                        <button onClick={() => handleSocialLogin('kakao')} className="social-btn kakao-btn">카카오로 로그인</button>
                        <button onClick={() => handleSocialLogin('google')} className="social-btn google-btn">구글로 로그인</button>
                    </div>
                    <p className="signup-link">계정이 없으신가요? <a href="/signup">회원가입</a></p>
                </div>
            </main>
            <footer className="footer">
                <p>&copy; 2023 11조 프로젝트. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default LoginPage;
