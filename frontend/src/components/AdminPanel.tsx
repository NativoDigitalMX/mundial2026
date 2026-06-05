import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';
import AdminUsers from './AdminUsers';
import AdminRanking from './AdminRanking';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-grey-50">
            <header className="bg-gray-900 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">🏆 Panel de Administración - Mundial 2026</h1>
                    <div className="space-x-4">
                        <span className="text-gray-300">
                            Sesión: Administradora
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>
            {/* Accesos directos - Siempre visibles */}

            {/* <div className="container mx-auto p-4 md:p-6"> */}
                <div className="w-full p-4 md:p-2">
                {/* Contenido Principal */}
                <div className="w-full md:col-span-3">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="/users" element={<AdminUsers />} />
                            <Route path="/ranking" element={<AdminRanking />} />
                        </Routes>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

// Dashboard Component
const AdminDashboard = () => {
    const [stats, setStats] = useState({
        active_users: 0,
        completed_predictions: 0,
        total_predictions: 0,
        completion_rate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const result = await response.json();
                    setStats(result.stats);
                }
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Cargando estadísticas...</div>;
    }

    return (

    
        <div>
            {/* Accesos directos - Siempre visibles */}
            <div className="mb-6">
                <nav className="grid grid-cols-2 md:flex md:flex-row gap-2">
                    <Link
                        to="/admin"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-green-50 rounded-lg shadow border-2 border-green-300 hover:shadow-md transition-all"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">📊</span>
                        <span className="text-xs md:text-sm font-medium text-green-700">Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">👥</span>
                        <span className="text-xs md:text-sm font-medium">Usuarios</span>
                    </Link>

                    <Link
                        to="/admin/results"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">⚽</span>
                        <span className="text-xs md:text-sm font-medium">Resultados</span>
                    </Link>

                    <Link
                        to="/admin/ranking"
                        className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-lg md:text-xl mr-1 md:mr-2">🏆</span>
                        <span className="text-xs md:text-sm font-medium">Ranking</span>
                    </Link>
                </nav>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Resumen del Torneo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Usuarios Registrados</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.active_users}</p>
                    <p className="text-sm text-blue-500 mt-2">Participantes activos</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Quinielas Completadas</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.completed_predictions}</p>
                    <p className="text-sm text-green-500 mt-2">{stats.completion_rate}% de participación</p>
                </div>
            </div>
        </div>
    );
};
export default AdminPanel;