import React from 'react';
import { NavLink } from 'react-router-dom';

import './Header.css';
import TagSearch from "../tool/TagSearch/TagSearch";

const Header = () => {
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
                <NavLink to="/login" className="auth-button login-button">로그인</NavLink>
                <NavLink to="/signup" className="auth-button signup-button">회원가입</NavLink>
            </div>
        </header>
    );
}

export default Header;
