import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = ({ onLogin }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('Authorization');

        if (accessToken) {
            localStorage.setItem('Authorization', accessToken);
            onLogin();
            navigate('/');
        } else {
            console.error('토큰이 없습니다.');
            navigate('/');
        }
    }, [navigate]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;
