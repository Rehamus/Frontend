import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

import './Header.css';
import TagSearch from "../tool/TagSearch/TagSearch";

const HeaderOn = ({ onLogout }) => {
    const navigate = useNavigate();

    /*const decodeJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const isTokenExpired = (token) => {
        const decoded = decodeJwt(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        const now = Date.now() / 1000;
        return decoded.exp < now;
    };

    useEffect(() => {
        const token = localStorage.getItem('Authorization');
        if (token && isTokenExpired(token)) {
            onLogout();
            navigate('/login');
        }
    }, [navigate, onLogout]);*/

    const handleLogoutClick = async () => {
        try {
            await axiosInstance.delete('/api/auth/logout', {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            onLogout();
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    const handleTagSelect = (tag) => {
        console.log("Selected tag:", tag);
    };

    return (
        <header className="header">
            <a href="/" className="logo">11조 프로젝트</a>
            <nav className="nav">
                <a href="/webtoon" className="nav-link">웹툰</a>
                <a href="/webnovel" className="nav-link">웹소설</a>
                <a href="/community" className="nav-link">커뮤니티</a>
            </nav>
            <div className="auth-buttons">
                <TagSearch onTagSelect={handleTagSelect} />
                <a href="/mypage" className="nav-link active">마이페이지</a>
                <button onClick={handleLogoutClick} className="button">로그아웃</button>
            </div>
        </header>
    );
}

export default HeaderOn;
