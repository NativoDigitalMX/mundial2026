// components/GroupStage.tsx
import React, { useState } from 'react';
import GroupSelector from './GroupSelector';
import type { Group, GroupSelection } from '../types/tournament';
import ProgressBar from './ProgressBar';

interface GroupStageProps {
    groups: Group[];
     groupSelections: Record<string, GroupSelection>;
   onGroupSelectionChange: (groupId: string, selection: GroupSelection) => void;
    onNext: () => void;
    onBack: () => void;
}

const GroupStage: React.FC<GroupStageProps> = ({
    groups,
    groupSelections,
    onGroupSelectionChange,
    onNext,
    onBack
}) => {
    const [selectedGroup, setSelectedGroup] = useState<string>('A');
    

    // Encontrar el grupo seleccionado
    const currentGroup = groups.find(g => g.id === selectedGroup);

    // Calcular progreso
    const completedGroups = Object.keys(groupSelections).filter(
        groupId => groupSelections[groupId]?.first && groupSelections[groupId]?.second
    ).length;

    const totalGroups = groups.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-3 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Fase de Grupos
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Selecciona el grupo. Y a continuacion asigna los equipos a sus posiciones para ordenarlos. Avanzan los dos primeros lugares de cada grupo y el tercer lugar compite para estar entre los 8 mejores
                    </p>

                    {/* Progreso */}
                    <div className="flex flex-col sm:flex-row items-center bg-white rounded-xl sm:rounded-full px-4 sm:px-6 py-4 sm:py-3 shadow-md w-full sm:w-auto">
                        <div className="flex items-center justify-between w-full sm:w-auto sm:mr-4">
                            <span className="sm:hidden text-gray-600">Grupos completados:</span>
                            <div className="text-2xl font-bold text-blue-600">
                                {completedGroups}/{totalGroups}
                            </div>
                        </div>
                        <div className="w-full sm:w-48 mt-2 sm:mt-0">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <ProgressBar
                                    progress={(completedGroups / totalGroups) * 100}
                                    className="h-2 bg-gray-200"
                                    barClassName="bg-gradient-to-r from-green-500 to-blue-600"
                                />
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center sm:text-left">
                                {Math.round((completedGroups / totalGroups) * 100)}% completado
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selector rápido de grupos */}
                <div className="mb-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                            Grupos disponibles
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {groups.map((group) => {
                            const isCompleted = groupSelections[group.id]?.first && groupSelections[group.id]?.second;

                            return (
                                <div key={group.id} className="relative">
                                    <button
                                        onClick={() => {
                                            setSelectedGroup(group.id);
                                          }}
                                        className={`
    w-full py-3 sm:py-4 px-1 sm:px-2 rounded-xl transition-all transform hover:scale-[1.02]
    text-sm sm:text-base
                      ${selectedGroup === group.id
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                                : isCompleted
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                                    : 'bg-white text-gray-700 shadow hover:shadow-md'
                                            }
                    `}
                                    >
                                        <div className="text-base sm:text-lg font-bold mb-1">Grupo {group.id}</div>
                                        <div className="text-sm opacity-90">
                                            {group.teams.length} equipos
                                        </div>

                                        {/* Indicador de estado */}
                                        <div className="absolute top-2 right-2">
                                            {isCompleted ? (
                                                <div className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : groupSelections[group.id] ? (
                                                <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold">!</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </button>

                                    {/* Badge de completado */}
                                    {isCompleted && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel del grupo seleccionado */}
                    <div className="lg:col-span-2 w-full">
                        {currentGroup && (
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                Grupo {currentGroup.id}
                                            </h2>
                                            <p className="text-blue-100 mt-1">
                                                Selecciona el orden de clasificación
                                            </p>
                                        </div>
                                        <div className="text-white">
                                            <div className="text-sm opacity-90">Equipos en este grupo:</div>
                                            <div className="text-xl font-bold">{currentGroup.teams.length}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <GroupSelector
                                        group={currentGroup}
                                        selection={groupSelections[currentGroup.id] || {}}
                                        onSelectionChange={(selection) =>
                                            onGroupSelectionChange(currentGroup.id, selection)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Panel de resumen */}
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
                        Volver
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center justify-between w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                            <span className="sm:hidden text-gray-600">Progreso:</span>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 hidden sm:block">Grupos completados</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {completedGroups}/{totalGroups}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onNext}
                            disabled={completedGroups !== totalGroups}
                            className={`
            w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center
            ${completedGroups === totalGroups
                                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
        `}
                        >
                            <span className="sm:hidden">Siguiente</span>
                            <span className="hidden sm:inline">Siguiente: Seleccionar los mejores Terceros Lugares</span>
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

export default GroupStage;