import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = ({ onLogin }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const authorizationParam = params.get('Authorization');

        if (authorizationParam) {
            const [accessToken, refreshToken] = authorizationParam.split('VAV');

            if (accessToken && refreshToken) {
                localStorage.setItem('Authorization', accessToken);
                localStorage.setItem('RefreshToken', refreshToken);
                onLogin();
                navigate('/');
            } else {
                console.error('토큰이 올바르지 않습니다.');
                navigate('/login');
            }
        } else {
            console.error('토큰이 없습니다.');
            navigate('/login');
        }
    }, [navigate, onLogin]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;
