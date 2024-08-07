import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header/Header';
import HeaderAuth from './Header/HeaderAuth';
import HeaderOn from './Header/HeaderOn';

const HeaderWrapper = ({ isLoggedIn, onLogout }) => {
    const location = useLocation();
    const showSimpleHeader = location.pathname === '/signup' || location.pathname === '/login';

    if (showSimpleHeader) {
        return <HeaderAuth />;
    } else if (isLoggedIn) {
        return <HeaderOn onLogout={onLogout} />;
    } else {
        return <Header />;
    }
};

export default HeaderWrapper;
