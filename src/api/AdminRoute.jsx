import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const userRole = localStorage.getItem('userRole');

    if (userRole !== 'ADMIN') {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
