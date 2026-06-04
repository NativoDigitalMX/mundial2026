// hooks/useAdminAuth.ts
import { useState, useEffect } from 'react';

interface AdminUser {
    id: number;
    user_code: string;
    full_name: string;
    is_admin: boolean;
}

export const useAdminAuth = () => {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('admin_token');
        const user = sessionStorage.getItem('admin_user');
        
        if (token && user) {
            setAdminToken(token);
            setAdminUser(JSON.parse(user));
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, user: AdminUser) => {
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_user', JSON.stringify(user));
        setAdminToken(token);
        setAdminUser(user);
    };

    const logout = () => {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        setAdminToken(null);
        setAdminUser(null);
    };

    return {
        adminUser,
        adminToken,
        isAdminAuthenticated: !!adminToken,
        isLoading,
        login,
        logout
    };
};