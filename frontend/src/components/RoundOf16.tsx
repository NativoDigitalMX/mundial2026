import React, { useMemo } from 'react';
import type { Team } from '../types/tournament';
import { getCountryColor } from '../data/teams';

interface RoundOf16Props {
    roundOf32Winners: (Team | null)[];  // Ganadores de partidos 73-88
    roundOf16Predictions: (Team | null)[];  // Predicciones para partidos 89-96
    onPredictionChange: (matchId: number, team: Team | null) => void;
    onBack: () => void;
    onContinue: () => void;
}

const RoundOf16: React.FC<RoundOf16Props> = ({
    roundOf32Winners,
    roundOf16Predictions,
    onPredictionChange,
    onBack,
    onContinue
}) => {

    // Mapeo de partidos de Ronda de 16 (Octavos de final) según FIFA
    const roundOf16Matches = useMemo(() => [
        // Partidos 89-92 (Lado superior del bracket)
        {
            id: 89,
            description: "Partido 89",
            team1Source: "Ganador partido 74",
            team2Source: "Ganador partido 77",
            team1: roundOf32Winners[1],  // Índice 1 = partido 74 (73+1)
            team2: roundOf32Winners[4]   // Índice 4 = partido 77 (73+4)
        },
        {
            id: 90,
            description: "Partido 90",
            team1Source: "Ganador partido 73",
            team2Source: "Ganador partido 75",
            team1: roundOf32Winners[0],  // Índice 0 = partido 73
            team2: roundOf32Winners[2]   // Índice 2 = partido 75
        },
        {
            id: 91,
            description: "Partido 91",
            team1Source: "Ganador partido 76",
            team2Source: "Ganador partido 78",
            team1: roundOf32Winners[3],  // Índice 3 = partido 76
            team2: roundOf32Winners[5]   // Índice 5 = partido 78
        },
        {
            id: 92,
            description: "Partido 92",
            team1Source: "Ganador partido 79",
            team2Source: "Ganador partido 80",
            team1: roundOf32Winners[6],  // Índice 6 = partido 79
            team2: roundOf32Winners[7]   // Índice 7 = partido 80
        },
        // Partidos 93-96 (Lado inferior del bracket)
        {
            id: 93,
            description: "Partido 93",
            team1Source: "Ganador partido 83",
            team2Source: "Ganador partido 84",
            team1: roundOf32Winners[10], // Índice 10 = partido 83 (73+10)
            team2: roundOf32Winners[11]  // Índice 11 = partido 84
        },
        {
            id: 94,
            description: "Partido 94",
            team1Source: "Ganador partido 81",
            team2Source: "Ganador partido 82",
            team1: roundOf32Winners[8],  // Índice 8 = partido 81
            team2: roundOf32Winners[9]   // Índice 9 = partido 82
        },
        {
            id: 95,
            description: "Partido 95",
            team1Source: "Ganador partido 86",
            team2Source: "Ganador partido 88",
            team1: roundOf32Winners[13], // Índice 13 = partido 86
            team2: roundOf32Winners[15]  // Índice 15 = partido 88
        },
        {
            id: 96,
            description: "Partido 96",
            team1Source: "Ganador partido 85",
            team2Source: "Ganador partido 87",
            team1: roundOf32Winners[12], // Índice 12 = partido 85
            team2: roundOf32Winners[14]  // Índice 14 = partido 87
        }
    ], [roundOf32Winners]);

    // Verificar si todos los partidos de R32 tienen ganador
    const allR32Predicted = roundOf32Winners.every(winner => winner !== null);
    const allR16Predicted = roundOf16Predictions.every(prediction => prediction !== null);

    const handleSelectWinner = (matchId: number, team: Team | null) => {
        onPredictionChange(matchId, team);
    };

    if (!allR32Predicted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Ronda de 32 incompleta
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas completar todas las predicciones de la Ronda de 32
                        antes de continuar a Octavos de Final.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                    >
                        ← Volver a Ronda de 32
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
                        Octavos de Final
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Selecciona el ganador de cada partido (89-96)
                    </p>
                   <div className="inline-flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0">
                        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 text-center">
                            <div className="text-sm font-medium text-green-800">Partidos predichos</div>
                            <div className="text-xl font-bold text-green-600">
                                {roundOf16Predictions.filter(p => p !== null).length}/8
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-center">
                            <div className="text-sm font-medium text-blue-800">Máximo puntos</div>
                            <div className="text-xl font-bold text-blue-600">32 puntos</div>
                        </div>
                    </div>
                </div>

                 {/* Partidos - Divididos en Superior e Inferior */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
                    {/* Bracket Superior */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-blue-100 w-full max-w-2xl mx-auto lg:mx-0">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                            <h2 className="text-xl font-bold text-gray-800">Bracket Superior</h2>
                            <div className="w-4 h-4 bg-blue-500 rounded-full ml-3"></div>
                        </div>

                        <div className="space-y-6">
                            {roundOf16Matches.slice(0, 4).map(match => {
                                const predictedWinner = roundOf16Predictions[match.id - 89];

                                return (
                                    <div key={match.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">{match.description}</h3>
                                            <span className="text-sm text-gray-500">{match.team1Source} vs {match.team2Source}</span>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Equipo 1 */}
                                            <button
                                                onClick={() => handleSelectWinner(match.id, match.team1)}
                                                className={`w-full p-4 rounded-lg border-2 transition-all ${predictedWinner?.id === match.team1?.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team1!.code).gradient} shadow-sm border`}
                                                        >
                                                            <span className={`font-bold text-sm ${getCountryColor(match.team1!.code).textColor}`}>
                                                                {match.team1!.code}
                                                            </span>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-medium block">{match.team1!.name}</span>
                                                            <span className="text-xs text-gray-500">Ganador partido {match.id === 89 ? '74' : match.id === 90 ? '73' : match.id === 91 ? '76' : '79'}</span>
                                                        </div>
                                                    </div>
                                                    {predictedWinner?.id === match.team1?.id && (
                                                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>

                                            {/* VS */}
                                            <div className="text-center text-gray-500 font-bold my-2">VS</div>

                                            {/* Equipo 2 */}
                                            <button
                                                onClick={() => handleSelectWinner(match.id, match.team2)}
                                                className={`w-full p-4 rounded-lg border-2 transition-all ${predictedWinner?.id === match.team2?.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team2!.code).gradient} shadow-sm border`}
                                                        >
                                                            <span className={`font-bold text-sm ${getCountryColor(match.team2!.code).textColor}`}>
                                                                {match.team2!.code}
                                                            </span>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-medium block">{match.team2!.name}</span>
                                                            <span className="text-xs text-gray-500">Ganador partido {match.id === 89 ? '77' : match.id === 90 ? '75' : match.id === 91 ? '78' : '80'}</span>
                                                        </div>
                                                    </div>
                                                    {predictedWinner?.id === match.team2?.id && (
                                                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    </div>

                    {/* Bracket Inferior */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-red-100 w-full max-w-2xl mx-auto lg:mx-0">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                            <h2 className="text-xl font-bold text-gray-800">Bracket Inferior</h2>
                            <div className="w-4 h-4 bg-red-500 rounded-full ml-3"></div>
                        </div>

                        <div className="space-y-6">
                            {roundOf16Matches.slice(4, 8).map(match => {
                                const predictedWinner = roundOf16Predictions[match.id - 89];

                                return (
                                    <div key={match.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">{match.description}</h3>
                                            <span className="text-sm text-gray-500">{match.team1Source} vs {match.team2Source}</span>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Equipo 1 */}
                                            <button
                                                onClick={() => handleSelectWinner(match.id, match.team1)}
                                                className={`w-full p-4 rounded-lg border-2 transition-all ${predictedWinner?.id === match.team1?.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team1!.code).gradient} shadow-sm border`}
                                                        >
                                                            <span className={`font-bold text-sm ${getCountryColor(match.team1!.code).textColor}`}>
                                                                {match.team1!.code}
                                                            </span>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-medium block">{match.team1!.name}</span>
                                                            <span className="text-xs text-gray-500">Ganador partido {match.id === 93 ? '83' : match.id === 94 ? '81' : match.id === 95 ? '86' : '85'}</span>
                                                        </div>
                                                    </div>
                                                    {predictedWinner?.id === match.team1?.id && (
                                                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>

                                            {/* VS */}
                                            <div className="text-center text-gray-500 font-bold my-2">VS</div>

                                            {/* Equipo 2 */}
                                            <button
                                                onClick={() => handleSelectWinner(match.id, match.team2)}
                                                className={`w-full p-4 rounded-lg border-2 transition-all ${predictedWinner?.id === match.team2?.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team2!.code).gradient} shadow-sm border`}
                                                        >
                                                            <span className={`font-bold text-sm ${getCountryColor(match.team2!.code).textColor}`}>
                                                                {match.team2!.code}
                                                            </span>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-medium block">{match.team2!.name}</span>
                                                            <span className="text-xs text-gray-500">Ganador partido {match.id === 93 ? '84' : match.id === 94 ? '82' : match.id === 95 ? '88' : '87'}</span>
                                                        </div>
                                                    </div>
                                                    {predictedWinner?.id === match.team2?.id && (
                                                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    </div>
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
                        <span className="truncate">Volver a Dieciseisavos</span>
                    </button>

                    <button
                        onClick={onContinue}
                        disabled={!allR16Predicted}
                        className={`
            w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center text-sm sm:text-base
            ${allR16Predicted
                                ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
        `}
                    >
                        <span className="truncate">
                            {allR16Predicted
                                ? 'Continuar a Cuartos de Final'
                                : `Completa ${8 - roundOf16Predictions.filter(p => p !== null).length} más`
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

export default RoundOf16;