import React, { useMemo } from 'react';
import type { Team } from '../types/tournament';
import { getCountryColor } from '../data/teams';

interface QuarterFinalsProps {
    roundOf16Winners: (Team | null)[];  // Ganadores de partidos 89-96
    quarterFinalsPredictions: (Team | null)[];  // Predicciones para partidos 97-100
    onPredictionChange: (matchId: number, team: Team | null) => void;
    onBack: () => void;
    onContinue: () => void;
}

const QuarterFinals: React.FC<QuarterFinalsProps> = ({
    roundOf16Winners,
    quarterFinalsPredictions,
    onPredictionChange,
    onBack,
    onContinue
}) => {
    // Mapeo de partidos de Cuartos de Final según FIFA
    const quarterFinalsMatches = useMemo(() => [
        // Partido 97: Ganador 89 vs Ganador 90
        {
            id: 97,
            description: "Partido 97",
            team1Source: "Ganador partido 89",
            team2Source: "Ganador partido 90",
            team1: roundOf16Winners[0],  // Índice 0 = partido 89
            team2: roundOf16Winners[1]   // Índice 1 = partido 90
        },
        // Partido 98: Ganador 93 vs Ganador 94
        {
            id: 98,
            description: "Partido 98",
            team1Source: "Ganador partido 93",
            team2Source: "Ganador partido 94",
            team1: roundOf16Winners[4],  // Índice 4 = partido 93
            team2: roundOf16Winners[5]   // Índice 5 = partido 94
        },
        // Partido 99: Ganador 91 vs Ganador 92
        {
            id: 99,
            description: "Partido 99",
            team1Source: "Ganador partido 91",
            team2Source: "Ganador partido 92",
            team1: roundOf16Winners[2],  // Índice 2 = partido 91
            team2: roundOf16Winners[3]   // Índice 3 = partido 92
        },
        // Partido 100: Ganador 95 vs Ganador 96
        {
            id: 100,
            description: "Partido 100",
            team1Source: "Ganador partido 95",
            team2Source: "Ganador partido 96",
            team1: roundOf16Winners[6],  // Índice 6 = partido 95
            team2: roundOf16Winners[7]   // Índice 7 = partido 96
        }
    ], [roundOf16Winners]);

    // Verificar si todos los partidos de R16 tienen ganador
    const allR16Predicted = roundOf16Winners.length === 8 &&
        roundOf16Winners.every(winner => winner !== null);

    const allQuarterPredicted = (() => {
        if (!Array.isArray(quarterFinalsPredictions)) return false;
        // Tomar solo los primeros 4 elementos
        const firstFour = quarterFinalsPredictions.slice(0, 4);
        return firstFour.length === 4 && firstFour.every(prediction => prediction !== null);
    })();

    const handleSelectWinner = (matchId: number, team: Team | null) => {
        onPredictionChange(matchId, team);
    };
    if (!allR16Predicted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Octavos de Final incompletos
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas completar todas las predicciones de Octavos de Final
                        antes de continuar a Cuartos de Final.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                    >
                        ← Volver a Octavos de Final
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Cuartos de Final
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Selecciona el ganador de cada partido (97-100)
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0">
                        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 text-center flex-1 sm:flex-none">
                            <div className="text-sm font-medium text-green-800">Partidos predichos</div>
                            <div className="text-xl font-bold text-green-600">
                                {quarterFinalsPredictions.filter(p => p !== null).length}/4
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-center flex-1 sm:flex-none">
                            <div className="text-sm font-medium text-blue-800">Máximo puntos</div>
                            <div className="text-xl font-bold text-blue-600">32 puntos</div>
                        </div>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-8 border border-orange-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">🏆 Instrucciones</h3>
                    <p className="text-gray-600 mb-4">
                        Basado en tus predicciones de Octavos de Final, selecciona los ganadores, quiénes avanzarán a Semifinales (partidos 101-102).
                        Cada acierto vale 8 puntos.
                    </p>
                </div>

                {/* Partidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {quarterFinalsMatches.map((match) => {
                        const predictedWinner = quarterFinalsPredictions[match.id - 97];

                        return (
                            
                            <div key={match.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-purple-100 hover:shadow-xl transition-shadow w-full max-w-lg mx-auto md:mx-0">
                              <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">{match.description}</h3>
                                    <span className="text-sm text-gray-500">{match.team1Source} vs {match.team2Source}</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Equipo 1 */}
                                    <button
                                        onClick={() => handleSelectWinner(match.id, match.team1)}
                                        className={`w-full p-5 rounded-xl border-3 transition-all ${predictedWinner?.id === match.team1?.id
                                            ? 'border-green-500 bg-green-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className={`w-12 h-9 rounded-lg flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team1!.code).gradient} shadow-lg border-2`}
                                                >
                                                    <span className={`font-bold text-sm ${getCountryColor(match.team1!.code).textColor}`}>
                                                        {match.team1!.code}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-bold block text-lg">{match.team1!.name}</span>
                                                    <span className="text-xs text-gray-500">Ganador {match.team1Source}</span>
                                                </div>
                                            </div>
                                            {predictedWinner?.id === match.team1?.id && (
                                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* VS con decoración */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-4 text-gray-500 font-bold text-lg">VS</span>
                                        </div>
                                    </div>

                                    {/* Equipo 2 */}
                                    <button
                                        onClick={() => handleSelectWinner(match.id, match.team2)}
                                        className={`w-full p-5 rounded-xl border-3 transition-all ${predictedWinner?.id === match.team2?.id
                                            ? 'border-green-500 bg-green-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className={`w-12 h-9 rounded-lg flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team2!.code).gradient} shadow-lg border-2`}
                                                >
                                                    <span className={`font-bold text-sm ${getCountryColor(match.team2!.code).textColor}`}>
                                                        {match.team2!.code}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-bold block text-lg">{match.team2!.name}</span>
                                                    <span className="text-xs text-gray-500">Ganador {match.team2Source}</span>
                                                </div>
                                            </div>
                                            {predictedWinner?.id === match.team2?.id && (
                                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className="truncate">Volver a Octavos de Final</span>
                    </button>

                    <button
                        onClick={onContinue}
                        disabled={!allQuarterPredicted}
                        className={`
            w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center text-sm sm:text-base
            ${allQuarterPredicted
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
        `}
                    >
                        <span className="truncate">
                            {allQuarterPredicted
                                ? 'Continuar a Semifinales'
                                : `Completa ${4 - quarterFinalsPredictions.filter(p => p !== null).length} más`
                            }
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

export default QuarterFinals;