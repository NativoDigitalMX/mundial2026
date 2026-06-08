// components/TournamentWizard.tsx
import React, { useState, useEffect } from 'react';
import type { Team, UserPrediction, GroupSelection } from '../types/tournament';
import { REAL_GROUPS } from '../data/teams';
// Importar contexto de autenticación
import { useAuth } from '../contexts/AuthContext';
import { predictionsAPI } from '../services/api';

// Importar componentes
import WelcomeScreen from './WelcomeScreen';
import GroupStage from './GroupStage';
import ThirdPlaceSelector from './ThirdPlaceSelector';
import ResultsView from './ResultsView';
import KnockoutStage from './KnockoutStage';
import Navigation from './Navigation';
import RoundOf16 from './RoundOf16';
import QuarterFinals from './QuarterFinals';
import SemiFinals from './SemiFinals';
import Final from './Final';

// Definir pasos del wizard

export type WizardStep =
    | 'welcome'
    | 'groups'
    | 'thirdPlace'
    | 'roundOf32'    // Dieciseisavos
    | 'roundOf16'    // Octavos de final
    | 'quarterFinals'// Cuartos de final
    | 'semiFinals'  
    | 'final'  // Final
    | 'results';
export type KnockoutPredictionType = {
    roundOf32: (Team | null)[];
    roundOf16: (Team | null)[];
    quarterFinals: (Team | null)[];
    semiFinals: (Team | null)[];
    thirdPlace: Team | null;
    final: Team | null;
    champion: Team | null;
    runnerUp: Team | null;
};
interface TournamentWizardProps {
    onComplete: (prediction: UserPrediction) => void;
}
const TournamentWizard: React.FC<TournamentWizardProps> = ({ onComplete }) => {
    // Estados
    const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
    const [userName, setUserName] = useState<string>('Usuario');
    const [poolName, setPoolName] = useState<string>('Mi Quiniela Mundial 2026');
    const [groupSelections, setGroupSelections] = useState<UserPrediction['groupSelections']>({});
    const [bestThirdPlaces, setBestThirdPlaces] = useState<Team[]>([]);
    const [knockoutPredictions, setKnockoutPredictions] = useState<KnockoutPredictionType>(() => ({
        roundOf32: Array(16).fill(null),
        roundOf16: Array(8).fill(null),
        quarterFinals: Array(4).fill(null),
        semiFinals: Array(2).fill(null),
        thirdPlace: null,
        final: null,
        champion: null,
        runnerUp: null,
    }));
    const [predictionId, setPredictionId] = useState<string>('');
    const { isAuthenticated, user } = useAuth();
    const [saveMessage, setSaveMessage] = useState('');

    // Agrega esta función después de los estados
    const convertCodeToTeam = (code: string): Team | null => {
        if (!code) return null;

        // Buscar en todos los grupos
        for (const group of REAL_GROUPS) {
            const team = group.teams.find(t => t.code === code);
            if (team) return team;
        }
        return null;
    };
    const transformPredictionForBackend = () => {
        // 1. Convertir groupSelections a formato del backend
        const group_predictions: Record<string, { first: string; second: string }> = {};

        Object.entries(groupSelections).forEach(([groupId, selection]) => {
            if (selection) {
                group_predictions[groupId] = {
                    first: selection.first?.code || '',
                    second: selection.second?.code || '',
               };
            }
        });
        interface ThirdPlaceSelection {
            team_code: string;
            team_name: string;
            group: string;
        }
            const third_place_selections: ThirdPlaceSelection[] = bestThirdPlaces.map(team => ({
            team_code: team.code,
            team_name: team.name,
            group: team.group
            }));
        // 2. Calcular qualified_teams (24 + 8 = 32 equipos)
            const qualified_teams: string[] = [];

        // 3. Agregar 24 equipos de group_predictions
        Object.values(group_predictions).forEach(group => {
            if (group.first) qualified_teams.push(group.first);
            if (group.second) qualified_teams.push(group.second);
        });

        // 4. Agregar 8 equipos de third_place_selections
        third_place_selections.forEach(team => {
            if (team.team_code) qualified_teams.push(team.team_code);
        });

        // 5. Convertir knockoutPredictions a formato del backend
        const knockout_predictions = {
            roundOf32: knockoutPredictions.roundOf32.map(team => team?.code || ''),
            roundOf16: knockoutPredictions.roundOf16.map(team => team?.code || ''),
            quarterFinals: knockoutPredictions.quarterFinals.map(team => team?.code || ''),
            semiFinals: knockoutPredictions.semiFinals.map(team => team?.code || ''),
            thirdPlace: knockoutPredictions.thirdPlace?.code || '',
            final: {
                champion: knockoutPredictions.final?.code || knockoutPredictions.champion?.code || '',
                runnerUp: knockoutPredictions.runnerUp?.code || ''
            }
        };

        return {
            group_predictions,
            third_place_selections,
            qualified_teams,
            knockout_predictions,
            is_completed: true 
};
    };
    // Cargar datos guardados
    useEffect(() => {
        const loadData = async () => {
            // Intentar cargar del backend si está autenticado
            if (isAuthenticated && user) {
                setUserName(user.full_name || user.user_code);
                try {
                    const response = await predictionsAPI.getMyPrediction();
                    if (response.data.prediction) {
                        const backendPred = response.data.prediction;

                        // Convertir group_predictions del backend
                        const newGroupSelections: UserPrediction['groupSelections'] = {};
                        Object.entries(backendPred.group_predictions).forEach(([groupId, data]: [string, any]) => {
                            newGroupSelections[groupId] = {
                                first: convertCodeToTeam(data.first),
                                second: convertCodeToTeam(data.second),
                                third: convertCodeToTeam(data.third),
                                fourth: convertCodeToTeam(data.fourth)
                            };
                        });

                        // Convertir knockout_predictions del backend
                        const newKnockoutPredictions: KnockoutPredictionType = {
                            roundOf32: backendPred.knockout_predictions.roundOf32.map(convertCodeToTeam),
                            roundOf16: backendPred.knockout_predictions.roundOf16.map(convertCodeToTeam),
                            quarterFinals: backendPred.knockout_predictions.quarterFinals.map(convertCodeToTeam),
                            semiFinals: backendPred.knockout_predictions.semiFinals.map(convertCodeToTeam),
                            thirdPlace: convertCodeToTeam(backendPred.knockout_predictions.thirdPlace),
                            final: convertCodeToTeam(backendPred.knockout_predictions.final.champion),
                            champion: convertCodeToTeam(backendPred.knockout_predictions.final.champion),
                            runnerUp: convertCodeToTeam(backendPred.knockout_predictions.final.runnerUp)
                        };
                        // Modificaciones Junio 3 
                        // Convertir third_place_selections del backend a bestThirdPlaces
                        const newBestThirdPlaces: Team[] = (backendPred.third_place_selections || []).map((selection: any) => {
                            return convertCodeToTeam(selection.team_code);
                        }).filter((team: Team | null): team is Team => team !== null);
// fin de modificaciones junio 3
                        // Diferir los setState 
                        setTimeout(() => {
                            // Actualizar userName con el nombre del usuario autenticado
                            setUserName(user.full_name || user.user_code);
                            setGroupSelections(newGroupSelections);
                            setKnockoutPredictions(newKnockoutPredictions);
                            // Modificada junio 3:
                            
                            setBestThirdPlaces(newBestThirdPlaces);  // 👈 Agrega esta línea
                            // Determinar step actual basado en datos cargados
                            
                            if (backendPred.is_completed) setCurrentStep('results');
                            else if (newKnockoutPredictions.final || newKnockoutPredictions.champion) setCurrentStep('final');
                            else if (newKnockoutPredictions.semiFinals?.some(p => p !== null)) setCurrentStep('semiFinals')
                            else if (newKnockoutPredictions.quarterFinals?.some(p => p !== null)) setCurrentStep('quarterFinals');
                            else if (newKnockoutPredictions.roundOf16?.some(p => p !== null)) setCurrentStep('roundOf16');
                            else if (newKnockoutPredictions.roundOf32?.some(p => p !== null)) setCurrentStep('roundOf32');
                            else if (Object.keys(newGroupSelections || {}).length > 0) setCurrentStep('groups');
                        }, 0);
                        return; // No cargar de sessionStorage
                    }
                } catch (error) {
                //No hay predicción en backend
                }
            }

            // SEGUNDO: Cargar de sessionStorage
            const savedPrediction = sessionStorage.getItem('worldCupPrediction');
           
            if (savedPrediction) {
                try {
                    const parsed: UserPrediction = JSON.parse(savedPrediction);
                    setTimeout(() => {
                        setUserName(parsed.userName || 'Usuario');
                        setGroupSelections(parsed.groupSelections || {});
                        setBestThirdPlaces(parsed.bestThirdPlaces || []);
                        setKnockoutPredictions(parsed.knockoutPredictions as KnockoutPredictionType || {
                            roundOf32: Array(16).fill(null),
                            roundOf16: Array(8).fill(null),
                            quarterFinals: Array(4).fill(null),
                            semiFinals: Array(2).fill(null),
                            thirdPlace: null,
                            final: null,
                            champion: null,
                            runnerUp: null,
                        });
                        setPredictionId(parsed.id || '');
                        if (parsed.completed) setCurrentStep('results');
                        else if (parsed.knockoutPredictions?.final || parsed.knockoutPredictions?.champion) setCurrentStep('final'); 
                        else if (parsed.knockoutPredictions?.semiFinals?.some(p => p !== null)) setCurrentStep('semiFinals')
                        else if (parsed.knockoutPredictions?.quarterFinals?.some(p => p !== null)) setCurrentStep('quarterFinals');
                        else if (parsed.knockoutPredictions?.roundOf16?.some(p => p !== null)) setCurrentStep('roundOf16');
                        else if (parsed.knockoutPredictions?.roundOf32?.some(p => p !== null)) setCurrentStep('roundOf32');
                        else if (parsed.bestThirdPlaces?.length > 0) setCurrentStep('thirdPlace');
                        else if (Object.keys(parsed.groupSelections || {}).length > 0) setCurrentStep('groups');
                    }, 0);

                } catch (error) {
                    console.error('Error al cargar datos guardados:', error);
                }
            }
        };

        loadData();
    }, [isAuthenticated, user]); // Añade dependencias

    // Handlers

    const updateGroupSelection = (groupId: string, selection: GroupSelection) => {
        setGroupSelections(prev => ({ ...prev, [groupId]: selection }));
    };

    const updateBestThirdPlaces = (teams: Team[]) => {
        setBestThirdPlaces(teams);
    };

    const updateKnockoutPrediction = (
        stage: keyof KnockoutPredictionType,
        predictions: Team | null | (Team | null)[]
    ) => {
        setKnockoutPredictions(prev => ({
            ...prev,
            [stage]: predictions
        } as KnockoutPredictionType));
    };

    // Navegación

    const handleNextStep = () => {
        const steps: WizardStep[] = ['welcome', 'groups', 'thirdPlace', 'roundOf32', 'roundOf16', 'quarterFinals', 'semiFinals', 'final', 'results'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };
    const handlePrevStep = () => {
        const steps: WizardStep[] = ['welcome', 'groups', 'thirdPlace', 'roundOf32', 'roundOf16', 'quarterFinals', 'semiFinals', 'final', 'results'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    // Calcular progreso
    const calculateProgress = () => {
        switch (currentStep) {
            case 'welcome': return 0;
            case 'groups': {
                const groupsWithSelection = Object.keys(groupSelections).filter(
                    groupId => groupSelections[groupId]?.first && groupSelections[groupId]?.second
                ).length;
                return (groupsWithSelection / REAL_GROUPS.length) * 25 + 25;
            }
            case 'thirdPlace':
                return bestThirdPlaces.length > 0 ? 50 : 25;
            case 'roundOf32': {
                const completedMatches = knockoutPredictions.roundOf32.filter(p => p !== null).length;
                return 50 + (completedMatches / 16) * 25; // 50-75%
            }
            case 'roundOf16': {
                const completedMatches = knockoutPredictions.roundOf16.filter(p => p !== null).length;
                return 75 + (completedMatches / 8) * 25; // 75-100%
            }
            case 'quarterFinals': {
                const completedMatches = knockoutPredictions.quarterFinals.filter(p => p !== null).length;
                return 87.5 + (completedMatches / 4) * 12.5; // 87.5-100%
            }
            case 'semiFinals': {
                const completedMatches = knockoutPredictions.semiFinals.filter(p => p !== null).length;
                return 93.7 + (completedMatches / 2) * 6.25; // 93.7-100%
            }
            case 'results': return 100;
            default: return 0;
        }
    };

    // Completar quiniela
    const handleComplete = async () => {
        const timestamp = Date.now();
        const id = `prediction-${timestamp}`;
        setPredictionId(id);
        // USAR EL NOMBRE DEL USUARIO AUTENTICADO, NO EL DEL STATE
        const finalUserName = isAuthenticated ? (user?.full_name || user?.user_code || userName) : userName;
        const finalPrediction: UserPrediction = {
            id,
            userName: finalUserName,
            groupSelections,
            bestThirdPlaces,
            knockoutPredictions,
            timestamp,
            completed: true,
        };

        // 1. Guardar en sessionStorage
        sessionStorage.setItem('worldCupPrediction', JSON.stringify(finalPrediction));

        // 2. Guardar en backend SOLO si está autenticado (IMPORTANTE)
        let backendSuccess = false;
        if (isAuthenticated && user) {

            try {
                // Obtener TODOS los datos transformados
                const backendData = transformPredictionForBackend();
//               📤 Enviando al backend:
                await predictionsAPI.savePrediction(backendData);
                setSaveMessage('✅ Predicción guardada en el servidor');
                backendSuccess = true;
            } catch (error: any) {
                console.error('Error guardando en backend:', error);
                setSaveMessage('❌ Error al guardar en servidor');
                // Aún así continuamos a results para mostrar la predicción
            } 
        } else {
            setSaveMessage('⚠️ No autenticado - solo vista previa');
        }

        // 3. Solo avanzar a results si se guardó exitosamente o si estamos en modo vista
        if (backendSuccess || !isAuthenticated) {
            setCurrentStep('results');
        } else {
            alert('Error al guardar. Intenta nuevamente.');
        }
    };

    // Reiniciar quiniela
    const handleReset = () => {
        setGroupSelections({});
        setBestThirdPlaces([]);
        setKnockoutPredictions({
            roundOf32: Array(16).fill(null),
            roundOf16: Array(8).fill(null),
            quarterFinals: Array(4).fill(null),
            semiFinals: Array(2).fill(null),
            thirdPlace: null,
            final: null,
            champion: null,
            runnerUp: null,
        });
        setUserName('Usuario');
        setPoolName('Mi Quiniela Mundial 2026');
        sessionStorage.removeItem('worldCupPrediction');
    };

    // Renderizar paso actual
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'welcome':
                // Si está autenticado, saltar a groups
                if (isAuthenticated && user) {
                    // Usar timeout para evitar warning de actualización durante render
                    setTimeout(() => setCurrentStep('groups'), 0);
                    return null; // O unloading
                }
                return (
                     <WelcomeScreen
                        userName={userName}
                        onUserNameChange={setUserName}
                        poolName={poolName}
                        onPoolNameChange={setPoolName}
                        onStart={handleNextStep}
                    /> 
                );
            case 'groups':
                return (
                    <GroupStage
                        groups={REAL_GROUPS}
                        groupSelections={groupSelections}
                        onGroupSelectionChange={updateGroupSelection}
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                    />
                );
            case 'thirdPlace':
                return (
                    <ThirdPlaceSelector
                        groups={REAL_GROUPS}
                        groupSelections={groupSelections}
                        selectedThirdPlaces={bestThirdPlaces}
                        onThirdPlacesChange={updateBestThirdPlaces}
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                    />
                );
            case 'roundOf32':
                return (
                    <KnockoutStage
                        groups={REAL_GROUPS}
                        groupSelections={groupSelections}
                        bestThirdPlaces={bestThirdPlaces}
                        knockoutPredictions={knockoutPredictions}
                        onKnockoutPredictionChange={updateKnockoutPrediction}
                        onComplete={() => setCurrentStep('roundOf16')}
                        onBack={handlePrevStep}
                    />
                );
            case 'roundOf16':
                return (
                    <RoundOf16
                        roundOf32Winners={knockoutPredictions.roundOf32}
                        roundOf16Predictions={knockoutPredictions.roundOf16}
                        onPredictionChange={(matchId: number, team: Team | null) => {
                            const newPredictions = [...knockoutPredictions.roundOf16];
                            newPredictions[matchId - 89] = team; // 89 es el primer partido de R16
                            setKnockoutPredictions({
                                ...knockoutPredictions,
                                roundOf16: newPredictions
                            });
                        }}
                        onBack={() => setCurrentStep('roundOf32')}
                        onContinue={() => setCurrentStep('quarterFinals')}
                    />
                );
            case 'quarterFinals':
                return (
                    <QuarterFinals
                        roundOf16Winners={knockoutPredictions.roundOf16}
                        quarterFinalsPredictions={knockoutPredictions.quarterFinals}
                        onPredictionChange={(matchId: number, team: Team | null) => {
                            const newPredictions = [...knockoutPredictions.quarterFinals];
                            newPredictions[matchId - 97] = team; // 97 es el primer partido de cuartos
                            setKnockoutPredictions({
                                ...knockoutPredictions,
                                quarterFinals: newPredictions
                            });
                        }}
                        onBack={() => setCurrentStep('roundOf16')}
                        onContinue={() => setCurrentStep('semiFinals')}
                    />
                );
            case 'semiFinals':
                return (
                    <SemiFinals
                        quarterFinalsWinners={knockoutPredictions.quarterFinals}
                        semiFinalsPredictions={knockoutPredictions.semiFinals}
                        onPredictionChange={(matchId: number, team: Team | null) => {
                            const newPredictions = [...knockoutPredictions.semiFinals];
                            newPredictions[matchId - 101] = team;
                            setKnockoutPredictions({
                                ...knockoutPredictions,
                                semiFinals: newPredictions
                            });
                        }}
                        onBack={() => setCurrentStep('quarterFinals')}
                        onContinue={() => setCurrentStep('final')}
                    />
                );
            case 'final':
                return (
                    <Final
                        semiFinalsWinners={knockoutPredictions.semiFinals}
                        finalPrediction={knockoutPredictions.final}
                        runnerUpPrediction={knockoutPredictions.runnerUp}
                        onPredictionChange={(type: 'champion' | 'runnerUp', team: Team | null) => {
                            setKnockoutPredictions({
                                ...knockoutPredictions,
                                [type === 'champion' ? 'final' : 'runnerUp']: team
                            });
                        }}
                        onBack={() => setCurrentStep('semiFinals')}
                        onComplete={() => {
                            // Asegurar que champion y runnerUp estén sincronizados
                            const champion = knockoutPredictions.final;
                            const runnerUp = knockoutPredictions.runnerUp ||
                                knockoutPredictions.semiFinals.find(t => t && t.id !== champion?.id) || null;

                            setKnockoutPredictions({
                                ...knockoutPredictions,
                                champion: champion,
                                runnerUp: runnerUp
                            });
                            handleComplete(); 
                        }}
                    />
                );
            case 'results': {
                // Usar los estados actuales para crear la predicción
                const currentPrediction: UserPrediction = {
                    id: predictionId || `pred-${Date.now()}`,
                    userName: isAuthenticated ? (user?.full_name || user?.user_code || userName) : userName,
                    groupSelections,
                    bestThirdPlaces,
                    knockoutPredictions,
                    timestamp: Date.now(),
                    completed: true,
                };
                // console.log('Predicción final para resultados:', currentPrediction);

                return (
                    <ResultsView
                        prediction={currentPrediction}
                        groups={REAL_GROUPS}
                        onReset={handleReset}
                        onFinish={() => {
                            // 1. Limpiar sessionStorage
                            sessionStorage.removeItem('worldCupPrediction');
                            // 2. Llamar a App.tsx para logout
                            onComplete(currentPrediction);
                        }}
                        isAuthenticated={isAuthenticated}
                        saveMessage={saveMessage}
                        userCode={user?.user_code || ''}
                    />
                );
            }
        }
    };

    // Calcular estadísticas
    const getStats = () => {
        const totalGroups = REAL_GROUPS.length;
        const completedGroups = Object.keys(groupSelections).filter(
            groupId => groupSelections[groupId]?.first && groupSelections[groupId]?.second
        ).length;
        const thirdPlacesSelected = bestThirdPlaces.length;

        return {
            totalGroups,
            completedGroups,
            thirdPlacesSelected,
            progressPercentage: calculateProgress()
        };
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* SOLO mostrar Navigation si NO estamos en results */}
            {currentStep !== 'results' && (
            <Navigation
                currentStep={currentStep}
                progress={calculateProgress()}
                poolName={poolName}
                userName={userName}
                stats={getStats()}
                knockoutPredictions={knockoutPredictions}
                onStepClick={setCurrentStep}
            />
            )}

            <div className="mt-4">
                {saveMessage && (
                    <div className={`px-4 py-2 rounded text-sm ${saveMessage.includes('✅') ? 'bg-green-100 text-green-800' :
                        saveMessage.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {saveMessage}
                    </div>
                )}
                {!isAuthenticated && currentStep !== 'welcome' && (
                    <div className="mt-2 text-sm text-gray-600">
                        <span>⚠️ </span>
                        <span>Inicia sesión para guardar en el servidor</span>
                    </div>
                )}
            </div>
            <main className="pt-4 pb-12">
                {renderCurrentStep()}
            </main>
            <footer className="bg-white border-t border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="text-sm text-gray-600 mb-2 md:mb-0">
                        Mundial FIFA 2026 • Estados Unidos, Canadá y México
                    </div>
                    <div className="flex space-x-4">
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TournamentWizard;