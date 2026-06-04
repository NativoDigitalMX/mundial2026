import React, { useMemo, useState, useEffect } from 'react';
import type { Team, Group, GroupSelection } from '../types/tournament';
import { getCountryColor } from '../data/teams';
import type { KnockoutPredictionType } from './TournamentWizard';
import ProgressBar from './ProgressBar';
import { findFifaMatchup, type FifaMatchup } from '../services/fifaMatchupService';

interface KnockoutStageProps {
    groups: Group[];
    groupSelections: Record<string, GroupSelection>;
    bestThirdPlaces: Team[];
    knockoutPredictions: KnockoutPredictionType;
    onKnockoutPredictionChange: (
        stage: keyof KnockoutPredictionType,
        predictions: Team | null | (Team | null)[]
    ) => void;
    onComplete: () => void;
    onBack: () => void;
}

const getTeamByPosition = (
    groupSelections: Record<string, GroupSelection>,
    position: string // Ej: "1A", "2B", "3C"
): Team | null => {
    const pos = position[0]; // "1", "2", "3"
    const group = position[1]; // "A", "B", etc.

    if (!groupSelections[group]) return null;
    switch (pos) {
        case '1': return groupSelections[group].first;
        case '2': return groupSelections[group].second;
        case '3': return groupSelections[group].third;
        default: return null;
    }
};

const KnockoutStage: React.FC<KnockoutStageProps> = ({
    groupSelections,
    bestThirdPlaces,
    knockoutPredictions,
    onKnockoutPredictionChange,
    onComplete,
    onBack
}) => {
    // Estados para manejar la carga de datos FIFA
    const [fifaMatchup, setFifaMatchup] = useState<FifaMatchup | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calcular combinación de grupos de terceros lugares
    const thirdPlaceCombination = useMemo(() => {
        if (bestThirdPlaces.length !== 8) return '';
        return bestThirdPlaces
            .map(team => team.group)
            .sort()
            .join('');
    }, [bestThirdPlaces]);

    // Cargar datos FIFA desde API
    useEffect(() => {
        const loadFifaMatchup = async () => {
            if (thirdPlaceCombination.length !== 8) {
                setFifaMatchup(null);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
              
                const matchup = await findFifaMatchup(thirdPlaceCombination);
                if (matchup) {
                    setFifaMatchup(matchup);
                } else {
                    setError(`Combinación "${thirdPlaceCombination}" no encontrada en la base de datos FIFA`);
                    setFifaMatchup(null);
                }
            } catch (error) {
                console.error('❌ Error cargando combinación FIFA:', error);
                setError('Error al conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3001');
                setFifaMatchup(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadFifaMatchup();
    }, [thirdPlaceCombination]);

    // Calcular todos los partidos de ronda de 32
    const calculateMatchTeams = useMemo(() => {
        if (!fifaMatchup || bestThirdPlaces.length !== 8) {
            return [];
        }

        // 1. Partidos ESPECIALES (según tabla FIFA - 8 partidos)
        const specialMatches = [
            { id: 79, topTeam: "1A", thirdPlace: fifaMatchup.matchups["1A"], description: `1A vs ${fifaMatchup.matchups["1A"]}` },
            { id: 85, topTeam: "1B", thirdPlace: fifaMatchup.matchups["1B"], description: `1B vs ${fifaMatchup.matchups["1B"]}` },
            { id: 81, topTeam: "1D", thirdPlace: fifaMatchup.matchups["1D"], description: `1D vs ${fifaMatchup.matchups["1D"]}` },
            { id: 74, topTeam: "1E", thirdPlace: fifaMatchup.matchups["1E"], description: `1E vs ${fifaMatchup.matchups["1E"]}` },
            { id: 82, topTeam: "1G", thirdPlace: fifaMatchup.matchups["1G"], description: `1G vs ${fifaMatchup.matchups["1G"]}` },
            { id: 77, topTeam: "1I", thirdPlace: fifaMatchup.matchups["1I"], description: `1I vs ${fifaMatchup.matchups["1I"]}` },
            { id: 87, topTeam: "1K", thirdPlace: fifaMatchup.matchups["1K"], description: `1K vs ${fifaMatchup.matchups["1K"]}` },
            { id: 80, topTeam: "1L", thirdPlace: fifaMatchup.matchups["1L"], description: `1L vs ${fifaMatchup.matchups["1L"]}` }
        ].map(match => ({
            id: match.id,
            team1: getTeamByPosition(groupSelections, match.topTeam),
            team2: getTeamByPosition(groupSelections, match.thirdPlace),
            description: match.description,
            predictedWinner: knockoutPredictions.roundOf32[match.id - 73] || null
        }));

        // 2. Partidos FIJOS (8 partidos)
        const fixedMatchesData = [
            { id: 73, team1Pos: "2A", team2Pos: "2B", description: "2A vs 2B" },
            { id: 75, team1Pos: "1F", team2Pos: "2C", description: "1F vs 2C" },
            { id: 76, team1Pos: "1C", team2Pos: "2F", description: "1C vs 2F" },
            { id: 78, team1Pos: "2E", team2Pos: "2I", description: "2E vs 2I" },
            { id: 83, team1Pos: "2K", team2Pos: "2L", description: "2K vs 2L" },
            { id: 84, team1Pos: "1H", team2Pos: "2J", description: "1H vs 2J" },
            { id: 86, team1Pos: "1J", team2Pos: "2H", description: "1J vs 2H" },
            { id: 88, team1Pos: "2D", team2Pos: "2G", description: "2D vs 2G" }
        ];

        const fixedMatches = fixedMatchesData.map(match => ({
            id: match.id,
            team1: getTeamByPosition(groupSelections, match.team1Pos),
            team2: getTeamByPosition(groupSelections, match.team2Pos),
            description: match.description,
            predictedWinner: knockoutPredictions.roundOf32[match.id - 73] || null
        }));

        // 3. Combinar y ordenar por ID de partido
        const allMatches = [...specialMatches, ...fixedMatches]
            .sort((a, b) => a.id - b.id);

        return allMatches;
    }, [groupSelections, bestThirdPlaces, knockoutPredictions.roundOf32, fifaMatchup]);

    // Manejar selección de ganador
    const handleSelectWinner = (matchId: number, team: Team | null) => {
        const newPredictions = [...knockoutPredictions.roundOf32];
        newPredictions[matchId - 73] = team;
        onKnockoutPredictionChange('roundOf32', newPredictions);
    };

    // Verificar si todos los partidos tienen predicción
    const allMatchesPredicted = calculateMatchTeams.every(
        match => match.predictedWinner !== null
    );

    // ========== RENDER CON ESTADOS ==========

    // Validación - si no tenemos 8 terceros lugares
    if (bestThirdPlaces.length !== 8) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Selección incompleta
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas seleccionar <strong>8 equipos</strong> como mejores terceros lugares.
                        Actualmente tienes: <strong>{bestThirdPlaces.length}/8</strong>
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                    >
                        ← Volver a completar selección
                    </button>
                </div>
            </div>
        );
    }

    // Estado de carga
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Consultando tabla FIFA...
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Buscando combinación: <strong>{thirdPlaceCombination}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                        Conectando con backend en http://localhost:3001
                    </p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-6">❌</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Error al cargar datos FIFA
                        </h2>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <div className="bg-yellow-50 p-6 rounded-xl mb-6">
                            <h3 className="font-bold text-yellow-800 mb-2">Combinación generada:</h3>
                            <div className="text-2xl font-mono bg-gray-100 p-3 rounded">
                                {thirdPlaceCombination}
                            </div>
                            <p className="text-sm text-yellow-600 mt-2">
                                Esta combinación no está en nuestra base de datos temporal.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onBack}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                            >
                                ← Ajustar terceros lugares
                            </button>
                            <button
                                onClick={() => window.open('http://localhost:3001/api/health', '_blank')}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                Verificar backend
                            </button>
                            {/* <button
                                onClick={async () => {
                                    // Prueba directa de API
                                    try {
                                        const response = await fetch('http://localhost:3001/api/fifa/matchup/EFGHIJKL');
                                        const data = await response.json();

                                        alert(`Backend responde. Combinación de prueba EFGHIJKL encontrada.`);
                                    } catch (err) {
                                        alert('Backend no responde. Verifica que esté corriendo.');
                                    }
                                }}
                                className="px-6 py-3 bg-green-200 text-green-700 rounded-lg hover:bg-green-300 font-medium"
                            > */}
                                Probar API
                            {/* </button> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Verificar que fifaMatchup existe antes de calcular partidos
    if (!fifaMatchup) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-6">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Datos FIFA no disponibles
                    </h2>
                    <p className="text-gray-600 mb-6">
                        No se pudieron cargar los datos de la tabla FIFA para la combinación.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium"
                    >
                        ← Volver a intentar
                    </button>
                </div>
            </div>
        );
    }

    // ========== RENDER PRINCIPAL ==========
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Encabezado con info de combinación */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Predicción: Dieciseisavos
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Selecciona el ganador de cada partido (73-88)
                    </p>
                    <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow">
                    </div>
                </div>

                {/* Panel de información */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <p className="text-gray-600">
                                Partidos de los mejores terceros lugares determinados según criterio FIFA
                            </p>
                            <p className="text-gray-600">
                               Para la combinación de letras de los grupos a los que pertenecen los mejores 3os: {fifaMatchup.combination}
                            </p>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center space-x-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {calculateMatchTeams.filter(m => m.predictedWinner !== null).length}/16
                                </div>
                                <div className="text-sm text-gray-600">Partidos predichos</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">2</div>
                                <div className="text-sm text-gray-600">Puntos por acierto</div>
                            </div>
                        </div>
                    </div>

                    <ProgressBar
                        progress={(calculateMatchTeams.filter(m => m.predictedWinner !== null).length / 16) * 100}
                        className="mt-4 h-3 bg-gray-200"
                        barClassName="bg-gradient-to-r from-green-500 to-blue-600"
                    />

                    <div className="text-xs text-gray-500 mt-2 text-right">
                        Máximo: 32 puntos en esta ronda
                    </div>
                </div>

                {/* Partidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {calculateMatchTeams.map((match) => (
                        <div key={match.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow w-full max-w-md mx-auto sm:mx-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Partido {match.id}</h3>
                                <span className="text-sm text-gray-500">{match.description}</span>
                            </div>

                            <div className="space-y-4">
                                {/* Equipo 1 */}
                                <button
                                    onClick={() => handleSelectWinner(match.id, match.team1)}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${match.predictedWinner?.id === match.team1?.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    disabled={!match.team1}
                                >
                                    {match.team1 ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team1.code).gradient} shadow-sm border`}
                                                    title={`${match.team1.name} (${match.team1.code})`}
                                                >
                                                    <span className={`font-bold text-sm ${getCountryColor(match.team1.code).textColor}`}>
                                                        {match.team1.code}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-medium block">{match.team1.name}</span>
                                                    <span className="text-xs text-gray-500">Grupo {match.team1.group}</span>
                                                </div>
                                            </div>
                                            {match.predictedWinner?.id === match.team1.id && (
                                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic">Equipo por determinar</div>
                                    )}
                                </button>

                                {/* VS */}
                                <div className="text-center text-gray-500 font-bold my-2">VS</div>

                                {/* Equipo 2 */}
                                <button
                                    onClick={() => handleSelectWinner(match.id, match.team2)}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${match.predictedWinner?.id === match.team2?.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    disabled={!match.team2}
                                >
                                    {match.team2 ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${getCountryColor(match.team2.code).gradient} shadow-sm border`}
                                                    title={`${match.team2.name} (${match.team2.code})`}
                                                >
                                                    <span className={`font-bold text-sm ${getCountryColor(match.team2.code).textColor}`}>
                                                        {match.team2.code}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-medium block">{match.team2.name}</span>
                                                    <span className="text-xs text-gray-500">Grupo {match.team2.group}</span>
                                                </div>
                                            </div>
                                            {match.predictedWinner?.id === match.team2.id && (
                                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic">Equipo por determinar</div>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
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
                        <span className="truncate">Volver a Seleccionar Mejores Terceros Lugares</span>
                    </button>

                    <button
                        onClick={() => {
                            if (allMatchesPredicted) {
                                onComplete();
                            }
                        }}
                        disabled={!allMatchesPredicted}
                        className={`
            w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center text-sm sm:text-base
            ${allMatchesPredicted
                                ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
        `}
                    >
                        <span className="truncate">
                            {allMatchesPredicted
                                ? 'Continuar a Octavos de Final'
                                : `Completa ${16 - calculateMatchTeams.filter(m => m.predictedWinner !== null).length} más`
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

export default KnockoutStage;