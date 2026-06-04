// components/GroupSelector.tsx
import React, { useState } from 'react';
import type { Team, Group, GroupSelection } from '../types/tournament';
import { getCountryColor } from '../data/teams';

interface GroupSelectorProps {
    group: Group;
    selection: GroupSelection;
    onSelectionChange: (selection: GroupSelection) => void;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
    group,
    selection,
    onSelectionChange
}) => {
    const [positionToFill, setPositionToFill] = useState<'first' | 'second' | 'third' | 'fourth' | null>(null);
    const positions = ['first', 'second', 'third', 'fourth'] as const;

    // Equipos disponibles para asignar (no están en ninguna posición)
    const getAvailableTeams = () => {
        return group.teams.filter(team =>
            !positions.some(position => selection[position]?.id === team.id)
        );
    };

    // Equipos no asignados
    const unassignedTeams = getAvailableTeams();

    // Manejar selección de equipo para una posición
    const handleSelectTeam = (position: 'first' | 'second' | 'third' | 'fourth', team: Team) => {
        const newSelection = { ...selection };

        // Remover equipo de cualquier otra posición
        positions.forEach(pos => {
            if (newSelection[pos]?.id === team.id) {
                newSelection[pos] = null;
            }
        });

        // Asignar a la nueva posición
        newSelection[position] = team;
        onSelectionChange(newSelection);
        // Auto-avanzar a la siguiente posición disponible
        const nextPosition = positions.find(pos => !newSelection[pos]);
        // Si no hay siguiente posición pero aún quedan equipos sin asignar, 
        // mantener el selector cerrado
        if (!nextPosition) {
            setPositionToFill(null);
        } else {
            setPositionToFill(nextPosition);

            // Si solo queda una posición vacía y un equipo sin asignar, auto-asignarlo
            const unassignedTeamsCount = group.teams.filter(t =>
                !positions.some(pos => newSelection[pos]?.id === t.id)
            ).length;

            const emptyPositionsCount = positions.filter(pos => !newSelection[pos]).length;

            if (unassignedTeamsCount === 1 && emptyPositionsCount === 1) {
                const lastTeam = group.teams.find(t =>
                    !positions.some(pos => newSelection[pos]?.id === t.id)
                );
                const lastPosition = positions.find(pos => !newSelection[pos]);

                if (lastTeam && lastPosition) {
                    // Auto-asignar el último equipo
                    setTimeout(() => {
                        const finalSelection = { ...newSelection };
                        finalSelection[lastPosition] = lastTeam;
                        onSelectionChange(finalSelection);
                        setPositionToFill(null);
                    }, 100);
                }
            }
        }
    };

    // Remover equipo de una posición
    const handleRemoveTeam = (position: 'first' | 'second' | 'third' | 'fourth') => {
        const newSelection = { ...selection };
        newSelection[position] = null;
        onSelectionChange(newSelection);
    };

    // Renderizar equipo en posición
    const renderTeamInPosition = (team: Team) => {
        const colors = getCountryColor(team.code);

        return (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${colors.gradient} shadow-sm border`}>
                        <span className={`font-bold text-sm ${colors.textColor}`}>
                            {team.code}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-800 text-sm">{team.name}</div>
                        <div className="text-xs text-gray-500">Grupo {team.group}</div>
                    </div>
                </div>
            </div>
        );
    };
    // Renderizar posición de clasificación
    const renderPosition = (position: 'first' | 'second' | 'third' | 'fourth',
        label: string, description: string, color: string) => {
        const team = selection[position];
        const isSelected = positionToFill === position;

        return (
            <div className={`
                p-4 rounded-xl border-2 transition-all
                ${team
                    ? `border-${color}-400 bg-${color}-50/50`
                    : isSelected
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                }
            `}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                        <h3 className="font-bold text-gray-800">{label}</h3>
                    </div>
                    {team && (
                        <button
                            onClick={() => handleRemoveTeam(position)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remover"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="min-h-[100px]">
                    {team ? (
                        renderTeamInPosition(team) // ✅ Pasar la posición actual
                    ) : (
                        <button
                            onClick={() => setPositionToFill(isSelected ? null : position)}
                            className={`
                                w-full p-4 rounded-lg border-2 border-dashed transition-all
                                ${isSelected
                                    ? 'border-blue-400 bg-blue-100/50'
                                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
                                }
                            `}
                        >
                            <div className="text-center">
                                <div className={`text-4xl mb-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {isSelected ? '✓' : '+'}
                                </div>
                                <p className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {isSelected ? 'Selecciona un equipo' : 'Agregar equipo'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{description}</p>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Posiciones de clasificación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderPosition('first', '1º Lugar', 'A dieciseisavos', 'green')}
                {renderPosition('second', '2º Lugar', 'A dieciseisavos', 'blue')}
                {renderPosition('third', '3º Lugar', 'Posible mejor 3o', 'yellow')}
                {renderPosition('fourth', '4º Lugar', 'Eliminado', 'red')}
            </div>

            {/* Selector de equipos */}
            {positionToFill && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-semibold text-blue-800">
                                Seleccionar equipo para {positionToFill === 'first' && '1º Lugar'}
                                {positionToFill === 'second' && '2º Lugar'}
                                {positionToFill === 'third' && '3º Lugar'}
                                {positionToFill === 'fourth' && '4º Lugar'}
                            </h3>
                            <p className="text-sm text-blue-600">
                                Equipos disponibles: {unassignedTeams.length}
                            </p>
                        </div>
                        <button
                            onClick={() => setPositionToFill(null)}
                            className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors border border-blue-200"
                        >
                            Cancelar
                        </button>
                    </div>

                    {unassignedTeams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {unassignedTeams.map(team => {
                                const colors = getCountryColor(team.code);
                                return (
                                    <button
                                        key={team.id}
                                        onClick={() => handleSelectTeam(positionToFill, team)}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all text-left"
                                    >
                                        <div className={`w-10 h-7 rounded flex items-center justify-center bg-gradient-to-r ${colors.gradient} shadow-sm border`}>
                                            <span className={`font-bold text-sm ${colors.textColor}`}>
                                                {team.code}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800 text-sm">{team.name}</div>
                                            <div className="text-xs text-gray-500">Grupo {team.group}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white rounded-lg">
                            <p className="text-gray-500">No hay más equipos disponibles</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Todos los equipos ya están asignados a posiciones
                            </p>
                        </div>
                    )}
                </div>
            )}           
            {/* Instrucciones */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-2">
                            Cómo ordenar los grupos:
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>Selecciona la primera posición (1er lugar del grupo), la lista de equipos a asignar se despliega abajo</span>
                            </li>
                           
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>Selecciona los equipos de la lista de disponibles normalmente siguiendo el orden: 1o, 2o, 3o</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>El último equipo se selecciona por default en cualquier posición</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>Si quierees cambiar el orden de tu selección, des-selecciona uno o más equipos y vuelve a ordenar</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>Los 2 primeros lugares avanzan a 16avos y el 3er lugar del grupo compite para estar entre los mejores 8</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupSelector;