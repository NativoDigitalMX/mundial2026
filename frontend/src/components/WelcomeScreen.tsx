//  WelcomeScreen.tsx

import { ArrowRight } from 'lucide-react';

// Definir las props que TournamentWizard espera
interface WelcomeScreenProps {
    userName: string;
    onUserNameChange: (name: string) => void;
    poolName: string;
    onPoolNameChange: (name: string) => void;
    onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    userName,
    onUserNameChange,
    onStart
}) => {

    const handleStart = () => {
        if (userName.trim()) {
            onStart();
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
               {/* Start Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto border border-gray-100">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                    Comienza tu Quiniela
                </h2>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Tu nombre
                    </label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => onUserNameChange(e.target.value)}
                        placeholder="Ej: Juan, Familia Pérez,Oficina..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    />

                </div>
                <button
                    onClick={handleStart}
                    disabled={!userName.trim()}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${userName.trim()
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {userName.trim() ? (
                        <>
                            Comenzar Quiniela
                            <ArrowRight className="h-5 w-5" />
                        </>
                    ) : (
                        'Ingresa tu nombre para continuar'
                    )}
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;