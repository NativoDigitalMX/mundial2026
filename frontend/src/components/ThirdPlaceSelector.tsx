// components/ThirdPlaceSelector.tsx
import React, { useMemo } from 'react';
import type { Team, Group } from '../types/tournament';
import { getCountryColor } from '../data/teams';
import ProgressBar from './ProgressBar'; 

interface GroupSelectionData {
    first: Team | null;
    second: Team | null;
    third: Team | null;
    fourth: Team | null;
}

interface ThirdPlaceSelectorProps {
    groups: Group[];
    groupSelections: Record<string, GroupSelectionData>;
    selectedThirdPlaces: Team[];
    onThirdPlacesChange: (teams: Team[]) => void;
    onNext: () => void;
    onBack: () => void;
}

// Interfaz para equipos de tercer lugar con estadísticas
interface ThirdPlaceTeam {
    team: Team;
    group: string;
    isSelected: boolean;
}

const ThirdPlaceSelector: React.FC<ThirdPlaceSelectorProps> = ({
    groups,
    groupSelections,
    selectedThirdPlaces,
    onThirdPlacesChange,
    onNext,
    onBack
    }) => {
    // Calcular equipos de tercer lugar basados en groupSelections
    const thirdPlaceTeams = useMemo<ThirdPlaceTeam[]>(() => {
        const teams: ThirdPlaceTeam[] = [];

        groups.forEach(group => {
            const selection = groupSelections[group.id];
            if (selection?.third) {
                teams.push({
                    team: selection.third!,
                    group: group.id,
                    isSelected: selectedThirdPlaces.some(t => t.id === selection.third?.id)
                })
            }
        });

        return teams;
    }, [groups, groupSelections, selectedThirdPlaces]);

    // Manejar selección/deselección de equipo
    const handleTeamSelection = (team: Team) => {
        const isAlreadySelected = selectedThirdPlaces.some(t => t.id === team.id);
        let newSelection: Team[];

        if (isAlreadySelected) {
            // Deseleccionar
            newSelection = selectedThirdPlaces.filter(t => t.id !== team.id);
        } else {
            // Seleccionar (máximo 8)
            if (selectedThirdPlaces.length >= 8) {
                alert('Solo puedes seleccionar 8 equipos como mejores terceros');
                return;
            }
            newSelection = [...selectedThirdPlaces, team];
        }

        onThirdPlacesChange(newSelection);
    };

    // Renderizar equipo
    const renderTeam = (teamData: ThirdPlaceTeam) => {
        const colors = getCountryColor(teamData.team.code);
        const isSelected = selectedThirdPlaces.some(t => t.id === teamData.team.id);

        return (
            <div
                key={teamData.team.id}
                onClick={() => handleTeamSelection(teamData.team)}
                className={`
          flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer
          transition-all hover:shadow-md
          ${isSelected
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }
        `}
            >
                {/* Información del equipo */}
                <div className="flex items-center space-x-4">
                    {/* Selector */}
                    <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            ${isSelected
                            ? 'bg-green-500 border-green-600'
                            : 'bg-white border-gray-300'
                        }
          `}>
                        {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        )}
                    </div>

                    {/* Bandera y nombre */}
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${colors.gradient} shadow-sm border`}>
                            <span className={`font-bold text-sm ${colors.textColor}`}>
                                {teamData.team.code}
                            </span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">{teamData.team.name}</div>
                            <div className="text-sm text-gray-500">Grupo {teamData.group}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar indicador de selección
    const renderSelectionIndicator = () => {
        const selectedCount = selectedThirdPlaces.length;

        return (
            <div className="sticky top-4 z-10">
                <div className={`
          p-6 rounded-2xl shadow-lg mb-6 transition-all
          ${selectedCount === 8
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                    } `}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <p className={selectedCount === 8 ? 'text-green-100' : 'text-gray-600'}>
                                {selectedCount === 8
                                    ? 'Has seleccionado los 8 equipos que avanzan a octavos'
                                    : `Predice ${8 - selectedCount} equipo${8 - selectedCount !== 1 ? 's' : ''} más`
                                }
                            </p>
                        </div>

                        <div className="mt-4 md:mt-0">
                            <div className="text-4xl font-bold">
                                {selectedCount}<span className="text-2xl">/8</span>
                            </div>
                            <div className="text-sm text-center">Equipos seleccionados</div>
                        </div>
                    </div>

                    <ProgressBar
                        progress={(selectedThirdPlaces.length / 8) * 100}
                        className="mt-4"
                        barClassName="bg-white"
                    />

                    {/* Equipos seleccionados */}
                    {selectedCount > 0 && (
                        <div className="mt-6 pt-4 border-t border-white/30">
                            <h4 className="font-bold mb-2">Equipos seleccionados:</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedThirdPlaces.map(team => (
                                    <div
                                        key={team.id}
                                        className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-2"
                                    >
                                        <span className="font-medium">{team.code}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTeamSelection(team);
                                            }}
                                            className="ml-1 text-red-300 hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Predicción: Mejores Terceros Lugares
                    </h1>
                </div>

                {/* Indicador de selección */}
                {renderSelectionIndicator()}

                {/* Contenido principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de equipos */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Encabezado de tabla */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                              
                            </div>

                            {/* Lista de equipos */}
                            <div className="p-6">
                                {thirdPlaceTeams.length > 0 ?
                                 (
                                    <div className="space-y-3">
                                        {thirdPlaceTeams.map((teamData, index) => (
                                            <div key={teamData.team.id} className="relative">
                                                {/* Posición ranking */}
                                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                                    <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold
                            ${index < 12
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                            : 'bg-gray-200 text-gray-700'
                                                        }
                          `}>
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                {/* Equipo con padding para la posición */}
                                                <div className="ml-12">
                                                    {renderTeam(teamData)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="text-4xl mb-4">🏆</div>
                                        <h3 className="text-xl font-semibold mb-2">Completa primero la fase de grupos</h3>
                                        <p>Necesitas seleccionar los terceros lugares en cada grupo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Panel lateral */}
                <div className="space-y-6">
                    {/* Sistema de puntos*/}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">
                            💰 Sistema de Puntos
                        </h3>
                        <div className="text-sm text-green-700 space-y-3">
                            <div className="flex justify-between items-center">
                                <span>Por cada 3° lugar correcto:</span>
                                <span className="font-bold text-lg">1 punto</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Máximo en esta fase:</span>
                                <span className="font-bold text-lg">8 puntos</span>
                            </div>
                            <div className="pt-3 mt-3 border-t border-green-200">
                                <div className="flex justify-between font-semibold">
                                    <span>Fase de grupos completa:</span>
                                    <span className="text-lg">32 puntos máx</span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    (24 equipos clasificados + 8 terceros)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200">
                    <button
                        onClick={onBack}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a Grupos
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center justify-between w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                            <span className="sm:hidden text-gray-600">Seleccionados:</span>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {selectedThirdPlaces.length}/8
                                </div>
                                <div className="text-sm text-gray-600 hidden sm:block">Equipos seleccionados</div>
                            </div>
                        </div>

                        <button
                            onClick={onNext}
                            disabled={selectedThirdPlaces.length !== 8}
                            className={`
                w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center
                ${selectedThirdPlaces.length === 8
                                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
            `}
                        >
                            <span className="sm:hidden">Siguiente</span>
                            <span className="hidden sm:inline">Siguiente: Predicción de Dieciseisavos</span>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThirdPlaceSelector;