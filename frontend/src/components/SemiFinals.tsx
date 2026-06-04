import React, { useMemo } from 'react';
import type { Team } from '../types/tournament';
import { getCountryColor } from '../data/teams';

interface SemiFinalsProps {
    quarterFinalsWinners: (Team | null)[];  // Ganadores de partidos 97-100
    semiFinalsPredictions: (Team | null)[];  // Predicciones para partidos 101-102
    onPredictionChange: (matchId: number, team: Team | null) => void;
    onBack: () => void;
    onContinue: () => void;
}

const SemiFinals: React.FC<SemiFinalsProps> = ({
    quarterFinalsWinners,
    semiFinalsPredictions,
    onPredictionChange,
    onBack,
    onContinue
}) => {
    // Mapeo de partidos de Semifinales según FIFA
    const semiFinalsMatches = useMemo(() => [
        // Partido 101: Ganador 97 vs Ganador 98
        {
            id: 101,
            description: "Semifinal 1",
            team1Source: "Ganador partido 97",
            team2Source: "Ganador partido 98",
            team1: quarterFinalsWinners[0],  // Índice 0 = partido 97
            team2: quarterFinalsWinners[1]   // Índice 1 = partido 98
        },
        // Partido 102: Ganador 99 vs Ganador 100
        {
            id: 102,
            description: "Semifinal 2",
            team1Source: "Ganador partido 99",
            team2Source: "Ganador partido 100",
            team1: quarterFinalsWinners[2],  // Índice 2 = partido 99
            team2: quarterFinalsWinners[3]   // Índice 3 = partido 100
        }
    ], [quarterFinalsWinners]);
    const allQuarterPredicted = Array.isArray(quarterFinalsWinners) &&
        quarterFinalsWinners.length === 4 &&
        quarterFinalsWinners.every(winner => winner !== null); 
    const allSemiPredicted = Array.isArray(semiFinalsPredictions) &&
        semiFinalsPredictions.length >= 2 &&
        semiFinalsPredictions.slice(0, 2).every(prediction => prediction !== null);

    const handleSelectWinner = (matchId: number, team: Team | null) => {
        onPredictionChange(matchId, team);
    };
    
    if (!allQuarterPredicted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Cuartos de Final incompletos
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas completar todas las predicciones de Cuartos de Final
                        antes de continuar a Semifinales.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                    >
                        ← Volver a Cuartos de Final
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Semifinales
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Selecciona el ganador de cada partido (101-102)
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0">
                        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 text-center flex-1 sm:flex-none">
                            <div className="text-sm font-medium text-green-800">Partidos predichos</div>
                            <div className="text-xl font-bold text-green-600">
                                {semiFinalsPredictions.filter(p => p !== null).length}/2
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-center flex-1 sm:flex-none">
                            <div className="text-sm font-medium text-blue-800">Máximo puntos</div>
                            <div className="text-xl font-bold text-blue-600">32 puntos</div>
                        </div>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mb-8 border border-red-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">🔥 Semifinales - Instrucciones</h3>
                    <p className="text-gray-600 mb-4">
                        Los ganadores avanzan a la <strong>Final (partido 104)</strong>.
                        Los perdedores jugarán por el <strong>Tercer lugar (partido 103)</strong>.
                        Cada acierto vale 16 puntos.
                    </p>
                    
                </div>

                {/* Partidos */}
                <div className="space-y-6 sm:space-y-8 mb-8">
                    {semiFinalsMatches.map((match) => {
                        const predictedWinner = semiFinalsPredictions[match.id - 101];

                        return (
                            // <div key={match.id} className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gold-500 hover:shadow-2xl transition-all">
                            <div key={match.id} className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-4 border-gold-500 hover:shadow-2xl transition-all w-full max-w-2xl mx-auto">
                               <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full mb-2">
                                        <span className="font-bold">{match.description}</span>
                                        <span className="ml-2 text-sm opacity-90">(Partido {match.id})</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {match.team1Source} vs {match.team2Source}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {/* Equipo 1 */}
                                    <button
                                        onClick={() => handleSelectWinner(match.id, match.team1)}
                                        className={`w-full p-6 rounded-2xl border-4 transition-all transform hover:scale-[1.02] ${predictedWinner?.id === match.team1?.id
                                            ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                                            : 'border-gray-300 hover:border-gray-400 hover:shadow'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-6">
                                                <div
                                                    className={`w-16 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team1!.code).gradient} shadow-2xl border-2 border-white`}
                                                >
                                                    <span className={`font-extrabold text-lg ${getCountryColor(match.team1!.code).textColor}`}>
                                                        {match.team1!.code}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-bold block text-xl">{match.team1!.name}</span>
                                                    <span className="text-sm text-gray-500">Ganador {match.team1Source}</span>
                                                </div>
                                            </div>
                                            {predictedWinner?.id === match.team1?.id && (
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* VS con estilo especial */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-dashed border-gray-400"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-2 text-gray-700 font-extrabold text-xl rounded-full border-2 border-yellow-300">
                                                VS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Equipo 2 */}
                                    <button
                                        onClick={() => handleSelectWinner(match.id, match.team2)}
                                        className={`w-full p-6 rounded-2xl border-4 transition-all transform hover:scale-[1.02] ${predictedWinner?.id === match.team2?.id
                                            ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                                            : 'border-gray-300 hover:border-gray-400 hover:shadow'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-6">
                                                <div
                                                    className={`w-16 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team2!.code).gradient} shadow-2xl border-2 border-white`}
                                                >
                                                    <span className={`font-extrabold text-lg ${getCountryColor(match.team2!.code).textColor}`}>
                                                        {match.team2!.code}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-bold block text-xl">{match.team2!.name}</span>
                                                    <span className="text-sm text-gray-500">Ganador {match.team2Source}</span>
                                                </div>
                                            </div>
                                            {predictedWinner?.id === match.team2?.id && (
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navegación */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-gray-200">
                    <button
                        onClick={onBack}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="truncate">Volver a Cuartos de Final</span>
                    </button>

                    <button
                        onClick={onContinue}
                        disabled={!allSemiPredicted}
                        className={`
            w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center text-sm sm:text-base
            ${allSemiPredicted
                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
        `}
                    >
                        <span className="truncate">
                            {(() => {
                                if (!Array.isArray(semiFinalsPredictions)) {
                                    return 'Completa 2 partidos';
                                }

                                const completedCount = semiFinalsPredictions.slice(0, 2).filter(p => p !== null).length;
                                const remaining = 2 - completedCount;

                                return allSemiPredicted
                                    ? 'Continuar a Final'
                                    : `Completa ${remaining} más`;
                            })()}
                        </span>
                        <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div> 
            </div>
        </div>
    );
};

export default SemiFinals;