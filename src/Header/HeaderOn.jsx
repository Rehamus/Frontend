import React from 'react';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

import './Header.css';
import TagSearch from "../tool/TagSearch/TagSearch";

const HeaderOn = ({ onLogout }) => {
    const navigate = useNavigate();
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
            <a href="/" className="logo">ElevenBookshelf</a>
            <nav className="nav">
                <a href="/recommend" className="nav-link">추천</a>
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
