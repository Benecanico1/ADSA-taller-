import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser.role === 'unassigned' && location.pathname !== '/setup-maestro-init') {
        // En un futuro, aquí devolvería a una vista "Esperando Autorización"
        // Por ahora, si no tiene rol, no entra a la app regular
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
