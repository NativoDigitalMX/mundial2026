// App.tsx
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from './store';
import { Trophy, Users, Globe, Home, ChevronRight, LogIn} from 'lucide-react';
import TournamentWizard from './components/TournamentWizard';
import AdminPanel from './components/AdminPanel';
import type { UserPrediction } from './types/tournament';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminResults from './components/AdminResults';
function App() {

        return (
            <Router>
            <AuthProvider>
                <Provider store={store}>
                        <AppContent />
                </Provider>
            </AuthProvider>
            </Router>
        );

}
const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
    </div>
);
function TournamentWrapper() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleComplete = (prediction: UserPrediction) => {
        alert(`¡Quiniela de ${prediction.userName} guardada exitosamente!`);
        // IMPORTANTE: Logout después de guardar
        logout();
        // Redirigir a home
        navigate('/', { replace: true });
    };

    return <TournamentWizard onComplete={handleComplete} />;
}
function AppContent() {
    const { isAuthenticated, isLoading} = useAuth();
    if (isLoading ) {
        return <LoadingScreen />;
    }

    // Función helper para verificar admin
    const isAdmin = () => {
        return sessionStorage.getItem('is_admin') === 'true';
    };

    return (
        <Routes>
            {/* RUTAS PÚBLICAS  LOGIN UNICO PARA TODOS*/ }
            <Route path="/login" element={
                !isAuthenticated ? <Login /> : <Navigate to="/" />
            } />

            {/* RUTA ADMIN PROTEGIDA (SOLO PARA USUARIOS CON is_admin = true) */}
            <Route path="/admin/*" element={<AdminPanel />} />

            <Route path="/admin/results" element={
                <ProtectedRoute requireAdmin>
                    <AdminResults />
                </ProtectedRoute>
            } />

            {/* RUTA TORNEO, USUARIO NORMAL */}
            <Route path="/tournament" element={
                isAuthenticated && !isAdmin() ? (
                    <TournamentWrapper />
                ) : (
                    // <Navigate to="/login" replace />
                    <Navigate to="/" replace />
                )
            } />
            {/* RUTA HOME (SIEMPRE ACCESIBLE) */}
            <Route path="/" element={<HomeScreen />} />

            {/* REDIRECCIÓN POR DEFECTO 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
function HomeScreen() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

            {/* Header  */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* ... (código del logo ) ... */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                                <Trophy className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    ⚽ Quiniela Mundial 2026
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">Pronostica todos los partidos</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* ... (código de estadísticas ) ... */}
                            <div className="hidden md:flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Globe className="h-5 w-5" />
                                    <span className="text-sm">12 Grupos • 48 Equipos</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Users className="h-5 w-5" />
                                    <span className="text-sm">Multi-usuario</span>
                                </div>
                            </div>
                                
                            {/* BOTÓN DE LOGIN */}

                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block text-sm text-gray-700">
                                        Hola, <span className="font-semibold">{user?.full_name || user?.user_code}</span>
                                    </div>
                                    <button
                                        onClick={logout}

                                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            ) : (

                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span className="text-sm font-medium">Iniciar sesión</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Panel principal */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl">
                                    <Home className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Crea tu Quiniela
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        Pronostica el campeón del Mundial 2026
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-700">Selecciona los clasificados de cada grupo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700">Elige los 8 mejores terceros</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-gray-700">Pronostica toda la fase eliminatoria</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-700">Invita amigos</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button
                                        onClick={() => {
                                            if (isAuthenticated) {
                                                navigate('/tournament'); 
                                            } else {
                                                alert('Por favor, inicia sesión para crear tu quiniela');
                                                navigate('/login'); 
                                            }
                                        }}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                                        disabled={!isAuthenticated}
                                    >
                                        {isAuthenticated ? 'Comenzar Quiniela' : 'Inicia sesión para comenzar'}
                                        <ChevronRight className="h-6 w-6" />
                                </button>
                                {!isAuthenticated && (
                                    <div>
                                    <p className="mt-2 text-sm text-gray-600 text-center">
                                        Necesitas iniciar sesión en la parte superior para guardar tu quiniela.
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600 text-center">
                                        Ingresa tus iniciales y tu contraseña. Si ya existe tu quiniela verás el resumen
                                    </p>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>

                    {/* Panel lateral a la derecha*/}
                    <div className="space-y-8">
                        {/* Estadísticas */}
                        <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-xl p-8 text-white">
                            <h3 className="text-2xl font-bold mb-6">Mundial 2026</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="text-sm opacity-90">Sedes</div>
                                    <div className="text-xl font-bold">🇨🇦 🇺🇸 🇲🇽</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Equipos</div>
                                    <div className="text-3xl font-bold">48</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Grupos</div>
                                    <div className="text-3xl font-bold">12</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Partidos</div>
                                    <div className="text-3xl font-bold">104</div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 pt-8 pb-6 border-t bg-white/50">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mt-4">
                        <span>React 19.2.1</span>
                        <span>•</span>
                        <span>TypeScript</span>
                        <span>•</span>
                        <span>Tailwind CSS 3.4.1</span>
                        <span>•</span>
                        <span>Redux Toolkit</span>
                        <span>•</span>
                        <span className="font-medium">Quiniela Mundial 2026</span>
                    </div>
                </div>
            </footer>
        </div>     
    );
}
export default App;