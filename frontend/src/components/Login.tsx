// Login.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login: React.FC = () => {
    const [userCode, setUserCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const userCodeUpper = userCode.toUpperCase();
        try {
        // 1. VERIFICAR SI ES ADMIN
        if (userCodeUpper === (import.meta.env.VITE_ADMIN_USERCODE || 'ADM')) {
            //Intentando login como administrador...');
            const response = await authAPI.adminLogin(userCodeUpper, password);
                const { token, user } = response.data;
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(user));
                //Admin login exitoso, redirigiendo a /admin');
                navigate('/admin');
                setIsLoading(false);
                return;
        }

        // 2. SI NO ES ADMIN, LOGIN NORMAL
            await login(userCodeUpper, password);
            navigate('/');
        } catch (error: any) {
            setError(error.response?.data?.error || 'Error en el login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Quiniela del Mundial 2026
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Inicia sesión para hacer tus predicciones
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="userCode" className="sr-only">
                                Código de usuario
                            </label>
                            <input
                                id="userCode"
                                name="userCode"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Código de usuario (tres letras mayúsculas)"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                                maxLength={3}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <p className="text-gray-600">
                            ¿No te has inscrito? Contacta al administrador para registrarte y obtener tu usuario y contraseña.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;