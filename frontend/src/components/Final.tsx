import React, { useMemo } from 'react';
import type { Team } from '../types/tournament';
import { getCountryColor } from '../data/teams';

interface FinalProps {
    semiFinalsWinners: (Team | null)[];  // Ganadores de partidos 101-102
    finalPrediction: Team | null;        // Ganador de la Final (campeón)
    runnerUpPrediction: Team | null;     // Subcampeón (se calculará automáticamente)
    onPredictionChange: (type: 'champion' | 'runnerUp', team: Team | null) => void;
    onBack: () => void;
    onComplete: () => void;
}

const Final: React.FC<FinalProps> = ({
    semiFinalsWinners,
    finalPrediction,
    runnerUpPrediction,
    onPredictionChange,
    onBack,
    onComplete
}) => {
    // Verificar si las semifinales están completas
    const allSemisPredicted = semiFinalsWinners.length === 2 &&
        semiFinalsWinners.every(winner => winner !== null);

    // Calcular automáticamente el subcampeón
    const calculatedRunnerUp = useMemo(() => {
        if (!finalPrediction || !allSemisPredicted) return null;

        // El subcampeón es el otro equipo de la final
        return semiFinalsWinners.find(team =>
            team && team.id !== finalPrediction.id
        ) || null;
    }, [finalPrediction, semiFinalsWinners, allSemisPredicted]);

    // Actualizar runnerUp cuando cambia el campeón
    React.useEffect(() => {
        if (calculatedRunnerUp && calculatedRunnerUp.id !== runnerUpPrediction?.id) {
            onPredictionChange('runnerUp', calculatedRunnerUp);
        }
    }, [calculatedRunnerUp, runnerUpPrediction, onPredictionChange]);

    // Partido de la Final
    const finalMatch = useMemo(() => ({
        id: 104,
        description: "Final del Mundial 2026",
        team1Source: "Ganador Semifinal 1",
        team2Source: "Ganador Semifinal 2",
        team1: semiFinalsWinners[0],  // Ganador partido 101
        team2: semiFinalsWinners[1]   // Ganador partido 102
    }), [semiFinalsWinners]);

    const handleSelectChampion = (team: Team | null) => {
        onPredictionChange('champion', team);
    };

    if (!allSemisPredicted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Semifinales incompletas
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas completar las predicciones de Semifinales
                        antes de pronosticar la Final.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                    >
                        ← Volver a Semifinales
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gold-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Encabezado con trofeo */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏆</div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                        Final del Mundial 2026
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Partido 104 - Selecciona al Campeón
                    </p>

                    <div className="inline-flex flex-wrap gap-4 justify-center">
                        <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                            <div className="text-sm font-medium text-yellow-800">Puntos por acierto</div>
                            <div className="text-xl font-bold text-yellow-600">32 puntos</div>
                        </div>
                        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <div className="text-sm font-medium text-green-800">Campeón seleccionado</div>
                            <div className="text-xl font-bold text-green-600">
                                {finalPrediction ? '✅' : '❌'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-gradient-to-r from-gold-50 to-yellow-50 rounded-2xl p-6 mb-8 border-2 border-yellow-300 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">🏁 ¡La Gran Final!</h3>
                    <p className="text-gray-600 mb-4">
                        Selecciona quién ganará la Copa del Mundo 2026.
                        El equipo que no selecciones será automáticamente el Subcampeón.
                    </p>
                    <div className="text-sm text-gray-500">
                        <strong>Nota:</strong> Esta es tu última predicción. Después podrás ver tu quiniela completa y descargarla como PDF o imagen.
                    </div>
                </div>

                {/* Partido Final - Estilo especial */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-gold-500">
                    <div className="text-center mb-8">
                        <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-full shadow-lg">
                            <h2 className="text-2xl font-bold">PARTIDO 104</h2>
                            <p className="text-sm opacity-90">Final - Copa Mundial FIFA 2026</p>
                        </div>
                        <p className="text-gray-500 mt-4">
                            {finalMatch.team1Source} vs {finalMatch.team2Source}
                        </p>
                    </div>

                    <div className="space-y-10">
                        {/* Equipo 1 */}
                        <button
                            onClick={() => handleSelectChampion(finalMatch.team1)}
                            className={`w-full p-8 rounded-2xl border-4 transition-all transform hover:scale-[1.02] ${finalPrediction?.id === finalMatch.team1?.id
                                ? 'border-green-600 bg-gradient-to-r from-green-100 to-emerald-100 shadow-2xl'
                                : 'border-gray-300 hover:border-gray-400 hover:shadow-xl'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-8">
                                    <div
                                        className={`w-20 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${getCountryColor(finalMatch.team1!.code).gradient} shadow-2xl border-4 border-white`}
                                    >
                                        <span className={`font-extrabold text-2xl ${getCountryColor(finalMatch.team1!.code).textColor}`}>
                                            {finalMatch.team1!.code}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold block text-2xl">{finalMatch.team1!.name}</span>
                                        <span className="text-sm text-gray-500">Ganador Semifinal 1</span>
                                    </div>
                                </div>
                                {finalPrediction?.id === finalMatch.team1?.id && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl mb-2">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-green-700">CAMPEÓN</span>
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* VS con estilo de final */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-4 border-double border-gold-400"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-3 text-white font-extrabold text-2xl rounded-full border-4 border-white shadow-2xl">
                                    FINAL
                                </div>
                            </div>
                        </div>

                        {/* Equipo 2 */}
                        <button
                            onClick={() => handleSelectChampion(finalMatch.team2)}
                            className={`w-full p-8 rounded-2xl border-4 transition-all transform hover:scale-[1.02] ${finalPrediction?.id === finalMatch.team2?.id
                                ? 'border-green-600 bg-gradient-to-r from-green-100 to-emerald-100 shadow-2xl'
                                : 'border-gray-300 hover:border-gray-400 hover:shadow-xl'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-8">
                                    <div
                                        className={`w-20 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${getCountryColor(finalMatch.team2!.code).gradient} shadow-2xl border-4 border-white`}
                                    >
                                        <span className={`font-extrabold text-2xl ${getCountryColor(finalMatch.team2!.code).textColor}`}>
                                            {finalMatch.team2!.code}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold block text-2xl">{finalMatch.team2!.name}</span>
                                        <span className="text-sm text-gray-500">Ganador Semifinal 2</span>
                                    </div>
                                </div>
                                {finalPrediction?.id === finalMatch.team2?.id && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl mb-2">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-green-700">CAMPEÓN</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Información del subcampeón */}
                {finalPrediction && (
                    <div className="bg-gradient-to-r from-silver-50 to-gray-100 rounded-2xl p-6 mb-8 border-2 border-gray-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">🥈 Subcampeón Automático</h3>
                        <p className="text-gray-600 mb-4">
                            Al seleccionar a <strong>{finalPrediction.name}</strong> como campeón,
                            <strong> {calculatedRunnerUp?.name}</strong> es automáticamente el subcampeón.
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-9 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(calculatedRunnerUp!.code).gradient}`}>
                                <span className={`font-bold text-sm ${getCountryColor(calculatedRunnerUp!.code).textColor}`}>
                                    {calculatedRunnerUp!.code}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">{calculatedRunnerUp!.name}</span>
                                <span className="text-sm text-gray-500 ml-2">(Subcampeón)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resumen de puntos */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Resumen de puntos finales máximos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">32</div>
                            <div className="text-sm text-gray-600">Campeón</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">32</div>
                            <div className="text-sm text-gray-600">Semifinales</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">128</div>
                            <div className="text-sm text-gray-600">Rondas previas</div>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a Semifinales
                    </button>

                    <button
                        onClick={onComplete}
                        disabled={!finalPrediction}
                        className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center ${finalPrediction
                            ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:shadow-lg transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {finalPrediction ? 'Quiniela completa ver Resumen' : 'Selecciona al Campeón'}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Final;