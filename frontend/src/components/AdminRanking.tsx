// frontend/src/components/AdminRanking.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Container, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    Chip, Alert, CircularProgress, Snackbar,
    Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { exportRankingToPDF} from '../utils/pdfExporter';
import type { RankingData } from '../utils/pdfExporter'

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}
// const pdfExporter = await import('../utils/pdfExporter');
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

const AdminRanking: React.FC = () => {
    const [predictions, setPredictions] = useState<PredictionReport[]>([]);
    const [filteredPredictions, setFilteredPredictions] = useState<PredictionReport[]>([]);
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
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // Función para cargar todas las predicciones
    const loadAllPredictions = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get('/api/admin/all-predictions', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const predictionsData: PredictionReport[] = response.data.predictions || [];

            // Ordenar por puntos totales (mayor a menor)
            const sortedPredictions = [...predictionsData].sort((a, b) =>
                b.points.total - a.points.total
            );

            setPredictions(sortedPredictions);
            setFilteredPredictions(sortedPredictions);

            // Guardar fecha de última actualización
            setLastUpdated(new Date().toLocaleString());

            showSnackbar(`Ranking actualizado - ${sortedPredictions.length} usuarios`, 'success');

        } catch (error: any) {
            console.error('Error cargando predicciones:', error);
            showSnackbar('Error cargando ranking', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadAllPredictions();
    }, []);

    // Función para mostrar snackbar
    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setSnackbar({ open: true, message, severity });
    };
    
    // Función para exportar a PDF usando la utilidad compartida
    const exportToPDF = () => {
        try {
            // Preparar datos en formato para la utilidad
            const rankingData: RankingData[] = filteredPredictions.map((pred, index) => ({
                position: index + 1,
                user_code: pred.user_code,
                points: {
                    round_of_32: pred.points.round_of_32,
                    round_of_16: pred.points.round_of_16,
                    quarter_finals: pred.points.quarter_finals,
                    semi_finals: pred.points.semi_finals,
                    final: pred.points.final,
                    champion: pred.points.champion || 0,
                    total: pred.points.total
                },
                submitted_at: pred.submitted_at
            }));

            // Usar la utilidad compartida
            exportRankingToPDF(rankingData, `Ranking Mundial 2026 - ${new Date().toLocaleDateString()}`);

            showSnackbar('Ranking exportado a PDF exitosamente', 'success');

        } catch (error) {
            console.error('Error exportando a PDF:', error);
            showSnackbar(error instanceof Error ? error.message : 'Error exportando a PDF', 'error');
        }
    };
        return (
        // <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Container maxWidth={false} sx={{
                mt: 2, mb: 4, 
                width: '100%' }} >
            {/* Encabezado */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
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
                                className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-white rounded-lg shadow hover:bg-blue-50 hover:shadow-md transition-all border border-gray-200"
                            >
                                <span className="text-lg md:text-xl mr-1 md:mr-2">⚽</span>
                                <span className="text-xs md:text-sm font-medium">Resultados</span>
                            </Link>

                            <Link
                                to="/admin/ranking"
                                className="flex items-center justify-center md:justify-start p-2 md:p-3 bg-green-50 rounded-lg shadow border-2 border-green-300 hover:shadow-md transition-all"
                            >
                                <span className="text-lg md:text-xl mr-1 md:mr-2">🏆</span>
                                <span className="text-xs md:text-sm font-medium text-green-700">Ranking</span>
                            </Link>
                        </nav>
                    </div>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        🏆 Ranking Mundial 2026
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Clasificación de usuarios por puntos totales
                        {lastUpdated && ` • Última actualización: ${lastUpdated}`}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Tooltip title="Actualizar ranking">
                        <Button
                            variant="outlined"
                            onClick={loadAllPredictions}
                            disabled={loading}
                            startIcon={<RefreshIcon />}
                            size="small"
                            sx={{
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                minWidth: 'auto', 
                                '& .MuiButton-startIcon': {
                                    mr: 0.5,
                                    ml: -0.2
                                }
                            }}
                        >
                            Actualizar
                        </Button>
                    </Tooltip>

                    <Tooltip title="Exportar a PDF">
                        <Button
                            variant="contained"
                            onClick={exportToPDF}
                            disabled={loading || predictions.length === 0}
                            startIcon={<PictureAsPdfIcon />}
                            color="secondary"
                            size="small"
                            sx={{
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                minWidth: 'auto',
                                '& .MuiButton-startIcon': {
                                    mr: 0.5,
                                    ml: -0.2
                                }
                            }}
                        >
                            Bajar PDF
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            {/* Estadísticas rápidas */}
            {predictions.length > 0 && (
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    flexWrap: 'wrap'
                }}>
                    <Chip
                        label={`${predictions.length} usuarios`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`Máximo: ${predictions[0]?.points.total || 0} puntos`}
                        color="success"
                        variant="outlined"
                    />
                </Box>
            )}

            {/* Tabla de ranking */}
                <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>Cargando ranking...</Typography>
                    </Box>
                ) : predictions.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Alert severity="info" sx={{ mb: 2 }}>No hay predicciones registradas</Alert>
                        <Button variant="outlined" onClick={loadAllPredictions} startIcon={<RefreshIcon />}>
                            Intentar nuevamente
                        </Button>
                    </Box>
                ) : (
                <TableContainer sx={{
                        width: '100%',
                        minWidth: '100%',

                        overflowX: 'auto',
                        '&::-webkit-scrollbar': {
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                        }
                    }}>
                    <Table sx={{
                        minWidth: `${(predictions.length * 50) + 150}px`,
                        width: `${(predictions.length * 50) + 150}px`, 
                        // Usa minWidth para que respete tu cálculo de columnas...
                        // minWidth: `${(predictions.length * 90) + 100}px`,
                        // // ...pero width: '100%' para que se estire si la pantalla es más grande
                        // width: '100%', 
                        tableLayout: 'fixed'
                    }}>
                            {/* HEADER - Usuarios como columnas con ANCHO FIJO */}
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
                                            width: 150, // Ancho fijo para columna de fases
                                            minWidth: 150,
                                            maxWidth: 150
                                        }}
                                    >
                                        Fase \ Usuario
                                    </TableCell>
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left" 
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                width: 50, // Ancho fijo para cada usuario
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px', 
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word'
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                                <Typography variant="body1" fontWeight="bold" noWrap>
                                                    {pred.user_code}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            {/* BODY - Fases como filas */}
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
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
                                    {filteredPredictions.map((pred) => (
                                        <TableCell
                                            key={pred.id}
                                            align="left"
                                            sx={{
                                                width: 50,
                                                minWidth: 50,
                                                maxWidth: 50,
                                                padding: '8px 4px'
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'primary.main',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {pred.points.total}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Información adicional */}
            {predictions.length > 0 && (
                <Box sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="subtitle2" gutterBottom>
                        📋 Información del ranking:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • Total de usuarios en ranking: {predictions.length}
                        <br />
                        • Rango de puntos: {predictions[predictions.length - 1]?.points.total || 0} - {predictions[0]?.points.total || 0}
                        <br />
                        • Última predicción recibida: {new Date(predictions[0]?.submitted_at || '').toLocaleDateString()}
                    </Typography>
                </Box>
            )}

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Container>
    );
};

export default AdminRanking;