// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false
}) => {
    // 1. Verificar autenticación básica
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');

    if (!token || !userStr) {
        // Redirigir a login si no está autenticado
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // 2. Si requiere admin, verificar permisos
        if (requireAdmin) {
            if (!user.is_admin) {
                // Usuario no es admin → redirigir a home o mostrar error
                return <Navigate to="/" replace />;
            }

            // Admin verificado → mostrar contenido
            return <>{children}</>;
        }

        // 3. Usuario normal autenticado → mostrar contenido
        return <>{children}</>;

    } catch (error) {
        console.error('Error parseando usuario:', error);
        // Datos corruptos → limpiar y redirigir
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;