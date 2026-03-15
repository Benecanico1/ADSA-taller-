import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const AdminRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    if (!currentUser) {
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    const permittedRoles = ['admin', 'admin_empresa', 'mechanic', 'super_admin'];
    
    if (!permittedRoles.includes(currentUser.role)) {
        // Logged in but not an admin or mechanic, redirect to normal dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Role is admin, render the protected component
    return children;
};

export default AdminRoute;
