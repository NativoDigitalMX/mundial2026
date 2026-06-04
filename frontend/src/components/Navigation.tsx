// components/Navigation.tsx
import React from 'react';
import type { WizardStep, KnockoutPredictionType } from './TournamentWizard';
import { useEffect, useRef } from 'react';
import styles from './Navigation.module.css';

interface NavigationProps {
    currentStep: WizardStep;
    progress: number;
    poolName: string;
    userName: string;
    stats: {
        totalGroups: number;
        completedGroups: number;
        thirdPlacesSelected: number;
        progressPercentage: number;
    };
    knockoutPredictions?: KnockoutPredictionType;
    onStepClick: (step: WizardStep) => void;
}

const Navigation: React.FC<NavigationProps> = ({
    currentStep,
    progress,
    poolName,
    userName,
    stats,
    knockoutPredictions = {
        roundOf32: [],
        roundOf16: [],
        quarterFinals: [],
        semiFinals: [],
        thirdPlace: null,
        final: null,
        champion: null,
        runnerUp: null
    },
    onStepClick
}) => {
    const progressBarRef = useRef<HTMLDivElement>(null);

    const steps = [
        {
            id: 'welcome',
            label: 'Inicio',
            icon: '🏠',
            description: 'Configuración',
            available: true
        },
        {
            id: 'groups',
            label: 'Grupos',
            icon: '⚽',
            description: `${stats.completedGroups}/${stats.totalGroups} Total de equipos: ${2 * stats.completedGroups}`,
            available: true
        },
        {
            id: 'thirdPlace',
            label: '3ros',
            icon: '🥉',
            description: `${stats.thirdPlacesSelected}/8`,
            available: stats.completedGroups === stats.totalGroups
        },
        {
            id: 'roundOf32',
            label: 'Dieciseisavos',
            icon: '🏆',
            description: '16 partidos',
            available: stats.thirdPlacesSelected === 8
        },
        {
            id: 'roundOf16',
            label: 'Octavos',
            icon: '⚔️',
            description: '8 partidos',
            available: knockoutPredictions?.roundOf32?.every(p => p !== null) || false
        },
        {
            id: 'quarterFinals',
            label: 'Cuartos',
            icon: '🎯',
            description: '4 partidos',
            available: knockoutPredictions?.roundOf16?.every(p => p !== null) || false
        },
        {
            id: 'semiFinals',
            label: 'Semifinales',
            icon: '🔥',
            description: '2 partidos',
            available: knockoutPredictions?.quarterFinals?.every(p => p !== null) || false
        },
        {
            id: 'final',
            label: 'Final',
            icon: '🏆',
            description: '1 partido',
            available: knockoutPredictions?.semiFinals?.every(p => p !== null) || false
        },
        {
            id: 'results',
            label: 'Resultados',
            icon: '📋',
            description: 'Ver quiniela',
            available: true
        },
    ] as const;

    const stepOrder = ['welcome', 'groups', 'thirdPlace', 'roundOf32', 'roundOf16', 'quarterFinals', 'semiFinals', 'final', 'results'];

    const getStepStatus = (stepId: WizardStep) => {
        const currentIndex = stepOrder.indexOf(currentStep);
        const stepIndex = stepOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    const isStepAvailable = (stepId: WizardStep) => {
        const step = steps.find(s => s.id === stepId);
        return step?.available || false;
    };

    useEffect(() => {
        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${progress}%`;
        }
    }, [progress]);

    const getBadgeCount = (stepId: string) => {
        switch (stepId) {
            case 'groups':
                return stats.completedGroups;
            case 'thirdPlace':
                return stats.thirdPlacesSelected;
            case 'roundOf32':
                return knockoutPredictions?.roundOf32?.filter(p => p !== null).length || 0;
            case 'roundOf16':
                return knockoutPredictions?.roundOf16?.filter(p => p !== null).length || 0;
            case 'quarterFinals':
                return knockoutPredictions?.quarterFinals?.filter(p => p !== null).length || 0;
            case 'semiFinals':
                return knockoutPredictions?.semiFinals?.filter(p => p !== null).length || 0;
            default:
                return 0;
        }
    };

    const getBadgeColor = (stepId: string) => {
        switch (stepId) {
            case 'groups':
                return 'bg-blue-600';
            case 'thirdPlace':
                return 'bg-yellow-500';
            case 'roundOf32':
                return 'bg-blue-600';
            case 'roundOf16':
                return 'bg-green-600';
            case 'quarterFinals':
            case 'semiFinals':
                return 'bg-purple-600';
            default:
                return 'bg-gray-600';
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
                <div className={styles.progressContainer}>
                    <div ref={progressBarRef} className={styles.progressBar} />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center py-4">
                    {/* Información del usuario */}
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-gray-800 truncate max-w-[200px]">
                                {poolName}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {userName} • Progreso: {Math.round(progress)}%
                            </p>
                        </div>
                    </div>

                    {/* Navegación - Desktop */}
                    <div className="hidden md:flex items-center space-x-2">
                        {steps.map((step) => {
                            const status = getStepStatus(step.id);
                            const available = isStepAvailable(step.id);
                            const badgeCount = getBadgeCount(step.id);
                            const badgeColor = getBadgeColor(step.id);

                            return (
                                <div key={step.id} className="relative group">
                                    <button
                                        onClick={() => available && onStepClick(step.id)}
                                        disabled={!available}
                                        className={`
                                            ${status === 'current'
                                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md'
                                                : status === 'completed'
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                            }
                                            ${!available ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {/* Icono y etiqueta */}
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-xl">{step.icon}</span>
                                            <span className={`
                                                font-semibold text-sm
                                                ${status === 'current' ? 'text-blue-700' :
                                                    status === 'completed' ? 'text-green-700' : 'text-gray-700'}
                                            `}>
                                                {step.label}
                                            </span>
                                        </div>

                                        {/* Descripción */}
                                        <div className={`
                                            text-xs
                                            ${status === 'current' ? 'text-blue-600' :
                                                status === 'completed' ? 'text-green-600' : 'text-gray-500'}
                                        `}>
                                            {step.description}
                                        </div>

                                        {/* Indicador de estado */}
                                        <div className="absolute top-2 right-2">
                                            {status === 'current' && (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse ring-2 ring-blue-300"></div>
                                            )}
                                            {status === 'completed' && (
                                                <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-300">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badge de conteo */}
                                        {badgeCount > 0 && (
                                            <div className={`
                                                absolute -top-2 -right-2 w-6 h-6 text-white text-xs rounded-full 
                                                flex items-center justify-center font-bold shadow
                                                ${badgeColor}
                                            `}>
                                                {badgeCount}
                                            </div>
                                        )}
                                    </button>

                                    {/* Tooltip para pasos no disponibles */}
                                    {!available && step.id === 'thirdPlace' && (
                                        <div className="absolute z-10 invisible group-hover:visible w-48 p-2 mt-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                            Completa todos los grupos primero
                                        </div>
                                    )}
                                    {!available && step.id === 'roundOf32' && (
                                        <div className="absolute z-10 invisible group-hover:visible w-48 p-2 mt-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                            Selecciona los 8 terceros lugares primero
                                        </div>
                                    )}
                                    {!available && (step.id === 'roundOf16' || step.id === 'quarterFinals' || step.id === 'semiFinals' || step.id === 'final') && (
                                        <div className="absolute z-10 invisible group-hover:visible w-48 p-2 mt-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                            Completa las predicciones de la ronda anterior
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Navegación móvil */}
                <div className="md:hidden py-3 border-t border-gray-200">
                    <div className="flex flex-col space-y-3">
                        {/* Información de progreso */}
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    {currentStep === 'welcome' && 'Paso 1: Configuración'}
                                    {currentStep === 'groups' && `Paso 2: Grupos (${stats.completedGroups}/${stats.totalGroups})`}
                                    {currentStep === 'thirdPlace' && `Paso 3: Terceros (${stats.thirdPlacesSelected}/8)`}
                                    {currentStep === 'roundOf32' && 'Paso 4: Dieciseisavos'}
                                    {currentStep === 'roundOf16' && 'Paso 5: Octavos de final'}
                                    {currentStep === 'quarterFinals' && 'Paso 6: Cuartos de final'}
                                    {currentStep === 'semiFinals' && 'Paso 7: Semifinales'}
                                    {currentStep === 'final' && 'Paso 8: Final'}
                                    {currentStep === 'results' && 'Paso 9: Resultados'}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-blue-600">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        {/* Botones de navegación */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    const currentIndex = stepOrder.indexOf(currentStep);
                                    if (currentIndex > 0) {
                                        onStepClick(stepOrder[currentIndex - 1] as WizardStep);
                                    }
                                }}
                                disabled={currentStep === 'welcome'}
                                className={`
                                    flex items-center space-x-1 px-2.5 py-2 rounded-lg
                                    ${currentStep === 'welcome'
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <span className="text-lg">←</span>
                                <span className="text-sm font-medium">Anterior</span>
                            </button>

                            <div className="flex space-x-2">
                                {steps.map((step) => {
                                    const badgeCount = getBadgeCount(step.id);
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => step.available && onStepClick(step.id)}
                                            disabled={!step.available}
                                            className={`
                                                relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                                ${currentStep === step.id
                                                    ? 'bg-blue-600 text-white'
                                                    : step.available
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }
                                            `}
                                            title={step.label}
                                        >
                                            {step.icon}
                                            {badgeCount > 0 && currentStep !== step.id && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                                                    {badgeCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    const currentIndex = stepOrder.indexOf(currentStep);
                                    const nextStep = stepOrder[currentIndex + 1] as WizardStep;
                                    const nextStepInfo = steps.find(s => s.id === nextStep);

                                    if (nextStep && nextStepInfo?.available) {
                                        onStepClick(nextStep);
                                    }
                                }}
                                disabled={currentStep === 'results' || !steps.find(s => s.id === currentStep)?.available}
                                className={`
                                    flex items-center space-x-1 px-2.5 py-2 rounded-lg
                                    ${currentStep === 'results' || !steps.find(s => s.id === currentStep)?.available
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <span className="text-sm font-medium">Siguiente</span>
                                <span className="text-lg">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;