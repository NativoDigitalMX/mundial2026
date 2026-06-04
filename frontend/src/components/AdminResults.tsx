// frontend/src/components/AdminResults.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    Tabs, Tab, Card, CardContent, Grid, Chip, Alert,
    CircularProgress, Snackbar, LinearProgress, Checkbox, Skeleton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import { REAL_TEAMS } from '../data/teams';
import { Link } from 'react-router-dom';

interface PhaseResult {
    stage: string;
    team_codes: string[];
    phase_number: number;
    team_code: string; // Para resultados individuales, si es necesario
}

interface PredictionReport {
    id: number;
    user_id: number;
    user_code: string;
    full_name: string;
    qualified_teams: string[];
    qualified_teams_count: number;
    points: {
        round_of_32: number;
        round_of_16: number;
        quarter_finals: number;
        semi_finals: number;
        final: number;
        champion: number;
        total: number;
    };
    submitted_at: string;
}

const AdminResults: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);
    const [allPredictions, setAllPredictions] = useState<PredictionReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [selectedStage, setSelectedStage] = useState('group');
    const [selectedTeamCodes, setSelectedTeamCodes] = useState<string[]>([]);

    // Función para obtener equipos disponibles según fase
    const getAvailableTeams = (stage: string): Array<{ code: string, name: string, flag: string }> => {
        if (stage === 'group') {
            // Los 48 equipos iniciales del torneo
            return REAL_TEAMS.map(team => ({
                code: team.code,
                name: team.name,
                flag: team.flag
            }));
        }

        // Para fases siguientes, obtener de resultados guardados de fase anterior
        const previousStage = getPreviousStage(stage);

        if (!previousStage) return [];

        // Buscar resultados de la fase anterior
        const previousPhase = phaseResults.find(phase => phase.stage === previousStage);

        if (!previousPhase) {
            // Si no hay resultados previos, mostrar mensaje
            return [];
        }

        // Extraer equipos de la fase anterior
        // Convertir team_code individuales a objetos completos
        const previousTeamCodes = phaseResults
            .filter(r => r.stage === previousStage)
            .map(r => r.team_code);

        // Buscar información completa de cada equipo
        return previousTeamCodes
            .map(code => REAL_TEAMS.find(team => team.code === code))
            .filter(Boolean) as Array<{ code: string, name: string, flag: string }>;
    };

    // Funciones auxiliares
    const getPreviousStage = (stage: string): string | null => {
        const stageOrder = ['group', 'roundOf16', 'quarterFinals', 'semiFinals', 'final', 'champion'];
        const index = stageOrder.indexOf(stage);
        return index > 0 ? stageOrder[index - 1] : null;
    };

    const getExpectedCount = (stage: string): number => {
        const counts: Record<string, number> = {
            group: 32,
            roundOf16: 16,
            quarterFinals: 8,
            semiFinals: 4,
            final: 2,
            champion: 1
        };
        return counts[stage] || 0;
    };

    const toggleTeamSelection = (teamCode: string) => {
        const expectedCount = getExpectedCount(selectedStage);
        const isSelected = selectedTeamCodes.includes(teamCode);

        if (isSelected) {
            // Deseleccionar
            setSelectedTeamCodes(prev => prev.filter(code => code !== teamCode));
        } else {
            // Seleccionar, pero no más del límite
            if (selectedTeamCodes.length < expectedCount) {
                setSelectedTeamCodes(prev => [...prev, teamCode]);
            } else {
                showSnackbar(`Solo puedes seleccionar ${expectedCount} equipos`, 'warning');
            }
        }
    };

    const handleSavePhaseResult = async () => {
        const expectedCount = getExpectedCount(selectedStage);
        if (selectedTeamCodes.length !== expectedCount) {
            showSnackbar(`Debes seleccionar exactamente ${expectedCount} equipos`, 'error');
            return;
        }
        try {
            // Determinar número de fase basado en stage
            const phaseNumberMap: Record<string, number> = {
                group: 1,
                roundOf16: 2,
                quarterFinals: 3,
                semiFinals: 4,
                final: 5,
                champion: 6
            };

            await axios.post('/api/admin/phase-results',
                {
                    stage: selectedStage,
                    team_codes: selectedTeamCodes,
                    phase_number: phaseNumberMap[selectedStage]
                },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
            );

            showSnackbar(`Resultados de ${selectedStage} guardados exitosamente`, 'success');
            // Limpiar selección
            setSelectedTeamCodes([]);
            // Recargar resultados
            loadPhaseResults();

        } catch (error: any) {
            console.error('Error guardando resultados:', error);
            showSnackbar(error.response?.data?.error || 'Error guardando resultados', 'error');
        }
    };

    const loadPhaseResults = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/phase-results', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setPhaseResults(response.data.results || []);
            // console.log('🔍 Resultados de fases cargados:', response.data.results);
        } catch (error) {
            console.error('Error cargando resultados:', error);
            showSnackbar('Error cargando resultados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAllPredictions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/all-predictions', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setAllPredictions(response.data.predictions || []);
            //     Predicciones cargadas
        } catch (error) {
            console.error('Error cargando predicciones:', error);
            showSnackbar('Error cargando predicciones', 'error');
        } finally {
            setLoading(false);
        }
    };

      const handleRecalculatePoints = async () => {
        try {
            await axios.post('/api/admin/recalculate-points', {}, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            
            showSnackbar('Puntos recalculados exitosamente', 'success');
            loadAllPredictions();
        } catch (error) {
            console.error('Error recalculando puntos:', error);
            showSnackbar('Error recalculando puntos', 'error');
        }
    };

    const [phaseValidation, setPhaseValidation] = useState<{
        stage: string;
        phase_number: number;
        completed: boolean;
        count: number;
        expected: number;
    }[]>([]);

    const loadPhaseValidation = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/phase-validation', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });

            // console.log('🔍 Validación de fases:', response.data);
            setPhaseValidation(response.data.validation || []);

        } catch (error) {
            console.error('Error cargando validación de fases:', error);
            showSnackbar('Error cargando validación de fases', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setSnackbar({ open: true, message, severity });
    };
    useEffect(() => {

        if (activeTab === 0) loadPhaseResults();
        if (activeTab === 1) loadAllPredictions();
        if (activeTab === 2) loadPhaseValidation(); // ← NUEVO
    }, [activeTab]);

return (
    <div className="min-h-screen  bg-gray-50">
        <header className="bg-gray-900 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold">🏆 Panel de Administración - Resultados</h1>
                <div className="space-x-4">
                    <span className="text-gray-300 hidden sm:inline">
                        Sesión: Administrador
                    </span>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('token');
                            sessionStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="px-3 py-1 md:px-4 md:py-2 bg-red-600 rounded hover:bg-red-700 transition-colors text-sm md:text-base"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </header>

        <div className="space-y-6">
            <div className="mb-6">
                {/* Contenido Principal */}
                <div className="w-full md:col-span-3">

                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                        {/* Accesos directos - Siempre visibles */}
                        <div className="mb-6">
                            <nav className="grid grid-cols-2 md:flex md:flex-row gap-2">
                                <Link
                                    to="/admin"
                                    className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                                >
                                    <span className="text-lg md:text-xl mr-1 md:mr-2">📊</span>
                                    <span className="text-xs md:text-sm font-medium">Dashboard</span>
                                </Link>

                                <Link
                                    to="/admin/users"
                                    className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                                >
                                    <span className="text-lg md:text-xl mr-1 md:mr-2">👥</span>
                                    <span className="text-xs md:text-sm font-medium">Usuarios</span>
                                </Link>

                                <Link
                                    to="/admin/results"
                                    className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-green-50 rounded-lg shadow border-2 border-green-300 hover:shadow-md transition-all"
                                >
                                    <span className="text-lg md:text-xl mr-1 md:mr-2">⚽</span>
                                    <span className="text-xs md:text-sm font-medium text-green-700">Resultados</span>
                                </Link>

                                <Link
                                    to="/admin/ranking"
                                    className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                                >
                                    <span className="text-lg md:text-xl mr-1 md:mr-2">🏆</span>
                                    <span className="text-xs md:text-sm font-medium">Ranking</span>
                                </Link>
                            </nav>
                        </div>
                        <div className="w-full">
                            <Typography variant="h4" gutterBottom>
                                Resultados Reales
                            </Typography>
                            <Paper sx={{ mb: 3 }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(_, val) => setActiveTab(val)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    sx={{
                                        '& .MuiTab-root': {
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            minWidth: { xs: 'auto', md: 160 },
                                            px: { xs: 1.5, md: 2 }
                                        }
                                    }}
                                >
                                    <Tab label="Ingresar Resultados Reales" />
                                    <Tab label="Reporte de Predicciones" />
                                    <Tab label="Validación de Fases" />
                                </Tabs>
                            </Paper>
                            {activeTab === 0 && (
                                <Grid container spacing={{ xs: 2, md: 3 }}>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Seleccionar Equipos Clasificados
                                                </Typography>

                                                {/* Selector de fase con tabs */}
                                                <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                                                    <Tabs
                                                        value={selectedStage}
                                                        onChange={(_, newValue) => {
                                                            setSelectedStage(newValue);
                                                            setSelectedTeamCodes([]); // Limpiar selección al cambiar fase
                                                        }}
                                                        variant="scrollable"
                                                        scrollButtons="auto"
                                                    >
                                                        <Tab label="Grupos " value="group" />
                                                        <Tab label="Octavos" value="roundOf16" />
                                                        <Tab label="Cuartos" value="quarterFinals" />
                                                        <Tab label="Semifinales" value="semiFinals" />
                                                        <Tab label="Final" value="final" />
                                                        <Tab label="Campeón" value="champion" />
                                                    </Tabs>
                                                </Box>

                                                {/* Contador y estado */}
                                                <Box sx={{
                                                    mb: 3,
                                                    p: 2,
                                                    bgcolor: 'background.default',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <Box>
                                                        <Typography variant="subtitle2">
                                                            {selectedStage === 'group' ? 'Fase de Grupos' :
                                                                selectedStage === 'roundOf16' ? 'Octavos de Final' :
                                                                    selectedStage === 'quarterFinals' ? 'Cuartos de Final' :
                                                                        selectedStage === 'semiFinals' ? 'Semifinales' :
                                                                            selectedStage === 'final' ? 'Final' : 'Campeón'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Selecciona los {getExpectedCount(selectedStage)} equipos clasificados
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${selectedTeamCodes.length} / ${getExpectedCount(selectedStage)}`}
                                                        color={
                                                            selectedTeamCodes.length === 0 ? "default" :
                                                                selectedTeamCodes.length === getExpectedCount(selectedStage) ? "success" : "warning"
                                                        }
                                                        variant="outlined"
                                                    />
                                                </Box>  {/* Lista de equipos */}
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Equipos disponibles:
                                                    </Typography>

                                                    {loading ? (
                                                        <CircularProgress />
                                                    ) : getAvailableTeams(selectedStage).length === 0 ? (
                                                        <Alert severity={selectedStage === 'group' ? 'info' : 'warning'}>
                                                            {selectedStage === 'group'
                                                                ? 'Cargando equipos del torneo...'
                                                                : `⚠️ Debes completar primero la fase anterior (${getPreviousStage(selectedStage)})`}
                                                        </Alert>
                                                    ) : (
                                                        <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                                                            <Grid container spacing={1}>
                                                                {getAvailableTeams(selectedStage).map((team) => (
                                                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={team.code}>
                                                        <Paper
                                                             elevation={selectedTeamCodes.includes(team.code) ? 3 : 0}
                                                             sx={{
                                                                 p: 1,
                                                                 m: 0.5,
                                                                 cursor: 'pointer',
                                                                 bgcolor: selectedTeamCodes.includes(team.code)
                                                                     ? 'primary.light'
                                                                     : 'background.paper',
                                                                 border: selectedTeamCodes.includes(team.code)
                                                                     ? '2px solid #1976d2'
                                                                     : '1px solid #e0e0e0',
                                                                 '&:hover': {
                                                                    bgcolor: selectedTeamCodes.includes(team.code)
                                                                         ? 'primary.light'
                                                                         : 'action.hover'
                                                                 }
                                                             }}
                                                             onClick={() => toggleTeamSelection(team.code)}
                                                         >
                                                             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                 <Checkbox
                                                                     checked={selectedTeamCodes.includes(team.code)}
                                                                     size="small"
                                                                     sx={{ mr: 1 }}
                                                                     disabled={
                                                                         !selectedTeamCodes.includes(team.code) &&
                                                                         selectedTeamCodes.length >= getExpectedCount(selectedStage)
                                                                     }
                                                                 />
                                                                 <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                                     <Box sx={{ flexGrow: 1 }}>
                                                                         <Typography variant="body2" noWrap>
                                                                             {team.name}
                                                                         </Typography>
                                                                         <Typography variant="caption" color="text.secondary">
                                                                             {team.code}
                                                                         </Typography>
                                                                     </Box>
                                                                 </Box>
                                                             </Box>
                                                         </Paper>
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                        </Paper>
                                                    )}
                                                </Box>

                                                {/* Botones de acción */}
                                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    <Button
                                                        size="small"
                                                        sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                                                        variant="contained"
                                                        onClick={handleSavePhaseResult}
                                                        disabled={
                                                            selectedTeamCodes.length !== getExpectedCount(selectedStage) ||
                                                            loading ||
                                                            getAvailableTeams(selectedStage).length === 0
                                                        }
                                                        startIcon={<SaveIcon />}
                                                    >
                                                        Guardar Resultados
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() => setSelectedTeamCodes([])}
                                                        disabled={selectedTeamCodes.length === 0}
                                                        startIcon={<ClearIcon />}
                                                    >
                                                        Limpiar
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Panel derecho: Resultados guardados */}
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Resultados Guardados
                                                </Typography>

                                                {loading ? (
                                                    <CircularProgress />
                                                ) : phaseResults.length === 0 ? (
                                                    <Alert severity="info">
                                                        No hay resultados guardados. Usa el panel izquierdo para ingresar resultados.
                                                    </Alert>
                                                ) : (
                                                    // Agrupar resultados por fase
                                                    Object.entries(
                                                        phaseResults.reduce((acc, result) => {
                                                            const key = `${result.stage}_${result.phase_number}`;
                                                            if (!acc[key]) {
                                                                acc[key] = {
                                                                    stage: result.stage,
                                                                    phase_number: result.phase_number,
                                                                    team_codes: []
                                                                };
                                                            }
                                                            acc[key].team_codes.push(result.team_code);
                                                            return acc;
                                                        }, {} as Record<string, any>)
                                                    ).map(([key, group]: [string, any]) => (
                                                        <Box key={key} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                {group.stage === 'group' ? 'Fase de Grupos' :
                                                                    group.stage === 'roundOf16' ? 'Octavos de Final' :
                                                                        group.stage === 'quarterFinals' ? 'Cuartos de Final' :
                                                                            group.stage === 'semiFinals' ? 'Semifinales' :
                                                                                group.stage === 'final' ? 'Final' : 'Campeón'}
                                                                (Fase {group.phase_number})
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {group.team_codes.length} equipos
                                                            </Typography>
                                                            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                                                                {group.team_codes.slice(0, 8).join(', ')}
                                                                {group.team_codes.length > 8 ? '...' : ''}
                                                            </Typography>
                                                        </Box>
                                                    ))
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            )}

                            {activeTab === 1 && (
                                <Box>
                                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                            📊 Reporte de Predicciones ({allPredictions.length})
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={handleRecalculatePoints}
                                            disabled={loading}
                                            size="small"
                                            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                                        >
                                            Recalcular Puntos
                                        </Button>
                                    </Box>

                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : allPredictions.length === 0 ? (
                                        <Alert severity="info">No hay predicciones registradas</Alert>
                                    ) : (
                                        <TableContainer sx={{
                                            overflowX: 'auto',
                                            '&::-webkit-scrollbar': { height: '8px' },
                                            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }
                                        }}>
                                            <Table sx={{
                                                minWidth: `${(allPredictions.length * 50) + 150}px`,
                                                width: `${(allPredictions.length * 50) + 150}px`,
                                                tableLayout: 'fixed'
                                            }}>
                                                {/* HEADER - Usuarios como columnas */}
                                                <TableHead sx={{ bgcolor: 'primary.main' }}>
                                                    <TableRow>
                                                        <TableCell
                                                            sx={{
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'primary.main',
                                                                zIndex: 20,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150 
                                                                
                                                            }}
                                                        >
                                                            Fase \ Usuario
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell
                                                                key={pred.id}
                                                                align="center"
                                                                sx={{
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    width: 50,
                                                                    minWidth: 50,
                                                                    maxWidth: 50,
                                                                    padding: '8px 4px'
                                                                }}
                                                            >
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    width: '100%'
                                                                }}>
                                                                    <Typography variant="body1" fontWeight="bold" noWrap>
                                                                        {pred.user_code}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {/* Fila: Ronda de 32 */}
                                                    <TableRow hover>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            🏆 Ronda de 32
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Chip
                                                                    label={pred.points.round_of_32}
                                                                    size="small"
                                                                    color={pred.points.round_of_32 > 0 ? "primary" : "default"}
                                                                    variant={pred.points.round_of_32 > 0 ? "filled" : "outlined"}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {/* Fila: Octavos */}
                                                    <TableRow hover>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            ⚽ Octavos
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Chip
                                                                    label={pred.points.round_of_16}
                                                                    size="small"
                                                                    color={pred.points.round_of_16 > 0 ? "primary" : "default"}
                                                                    variant={pred.points.round_of_16 > 0 ? "filled" : "outlined"}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {/* Fila: Cuartos */}
                                                    <TableRow hover>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            🎯 Cuartos
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Chip
                                                                    label={pred.points.quarter_finals}
                                                                    size="small"
                                                                    color={pred.points.quarter_finals > 0 ? "primary" : "default"}
                                                                    variant={pred.points.quarter_finals > 0 ? "filled" : "outlined"}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {/* Fila: Semifinales */}
                                                    <TableRow hover>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            🔥 Semifinales
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Chip
                                                                    label={pred.points.semi_finals}
                                                                    size="small"
                                                                    color={pred.points.semi_finals > 0 ? "primary" : "default"}
                                                                    variant={pred.points.semi_finals > 0 ? "filled" : "outlined"}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {/* Fila: Final */}
                                                    <TableRow hover>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            🥈 Final
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Chip
                                                                    label={pred.points.final}
                                                                    size="small"
                                                                    color={pred.points.final > 0 ? "primary" : "default"}
                                                                    variant={pred.points.final > 0 ? "filled" : "outlined"}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {/* Fila: Campeón */}
                                                    <TableRow hover>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            🏆 Campeón
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Chip
                                                                    label={pred.points.champion || 0}
                                                                    size="small"
                                                                    color={(pred.points.champion || 0) > 0 ? "success" : "default"}
                                                                    variant={(pred.points.champion || 0) > 0 ? "filled" : "outlined"}
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {/* Fila: TOTAL - Destacada */}
                                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                fontSize: '1.1rem',
                                                                position: 'sticky',
                                                                left: 0,
                                                                bgcolor: 'grey.100',
                                                                zIndex: 10,
                                                                width: 150,
                                                                minWidth: 150,
                                                                maxWidth: 150
                                                            }}
                                                        >
                                                            📊 TOTAL
                                                        </TableCell>
                                                        {allPredictions.map((pred) => (
                                                            <TableCell key={pred.id} align="center" sx={{ width: 50, minWidth: 50, maxWidth: 50, padding: '8px 4px' }}>
                                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                    {pred.points.total}
                                                                </Typography>
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>
                            )}
                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Validación de Fases Completadas
                                    </Typography>

                                    {loading ? (
                                        // <CircularProgress />
                                        <Box>
                                            {/* Ajusta las alturas según el contenido */}
                                            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                                            <Skeleton variant="rectangular" height={100} />
                                        </Box>

                                    ) : phaseValidation.length === 0 ? (
                                        <Alert severity="info">No hay datos de validación</Alert>
                                    ) : (
                                        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                                            <Table sx={{ minWidth: { xs: 650, md: '100%' } }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Fase</TableCell>
                                                        <TableCell>Número</TableCell>
                                                        <TableCell align="center">Estado</TableCell>
                                                        <TableCell align="right">Equipos</TableCell>
                                                        <TableCell align="right">Esperados</TableCell>
                                                        <TableCell>Progreso</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {phaseValidation.map((phase, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {phase.stage}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {phase.stage === 'group' ? 'Fase de Grupos (32 equipos)' :
                                                                        phase.stage === 'roundOf16' ? 'Octavos de Final (16 equipos)' :
                                                                            phase.stage === 'quarterFinals' ? 'Cuartos de Final (8 equipos)' :
                                                                                phase.stage === 'semiFinals' ? 'Semifinales (4 equipos)' :
                                                                                    phase.stage === 'final' ? 'Final (2 equipos)' :
                                                                                        'Campeón (1 equipo)'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>{phase.phase_number}</TableCell>
                                                            <TableCell align="center">
                                                                {phase.completed ? (
                                                                    <Chip label="COMPLETA" color="success" size="small" />
                                                                ) : (
                                                                    <Chip label="INCOMPLETA" color="warning" size="small" />
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" fontWeight={phase.completed ? 'bold' : 'normal'}>
                                                                    {phase.count}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {phase.expected}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Box sx={{ width: '100%', mr: 1 }}>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={(phase.count / phase.expected) * 100}
                                                                            color={phase.completed ? "success" : "primary"}
                                                                        />
                                                                    </Box>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {Math.round((phase.count / phase.expected) * 100)}%
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}

                                    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            📊 Resumen:
                                        </Typography>
                                        <Typography variant="body2">
                                            {phaseValidation.filter(p => p.completed).length} de {phaseValidation.length} fases completadas
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Fases completas: {
                                                phaseValidation.filter(p => p.completed)
                                                    .map(p => p.stage)
                                                    .join(', ') || 'Ninguna'
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            <Snackbar
                                open={snackbar.open}
                                autoHideDuration={6000}
                                onClose={() => setSnackbar({ ...snackbar, open: false })}
                                message={snackbar.message}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>                
    </div>
    );
};

export default AdminResults;