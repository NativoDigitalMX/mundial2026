// components/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AdminLogin: React.FC = () => {
    const [adminCode, setAdminCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Login normal
            const response = await authAPI.login(adminCode, password);
            const { token, user } = response.data;

            // Verificar que sea admin
            if (!user.is_admin) {
                setError('Acceso denegado. Solo administradores.');
                return;
            }

            // Guardar token y user

            sessionStorage.setItem('admin_token', token);
            sessionStorage.setItem('admin_user', JSON.stringify(user));

            // Redirigir al panel admin
            navigate('/admin/dashboard');

        } catch (error: any) {
            setError(error.response?.data?.error || 'Error en el login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    🔐 Admin Panel - Mundial 2026
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Código Admin
                       
                        <input
                            type="text"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: ADM"
                            required
                        />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contraseña
                       
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Verificando...' : 'Acceder al Panel Admin'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-400 hover:text-gray-300"
                        >
                            ← Volver al sitio principal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;