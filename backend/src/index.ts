import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';


import { FifaService } from './services/fifaService';
import authRoutes from './routes/authRoutes';
import predictionRoutes from './routes/predictionRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    process.env.FRONTEND_URL || 'https://mundial2026-pink.vercel.app'
];


// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

// Probar conexión a la base de datos al iniciar
async function initializeDatabase() {
    const isConnected = await testConnection();
    
    if (!isConnected) {
        console.log('⚠️  Usando datos temporales (modo fallback)');
    }
    
    return isConnected;
}

// Ruta de prueba
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Mundial 2026 API',
        environment: process.env.NODE_ENV,
        port: PORT,
        database: dbConnected ? 'connected' : 'disconnected'
    });
});

// Ruta FIFA matchups
app.get('/api/fifa/matchup/:combination', async (req, res) => {
    try {
        const { combination } = req.params;
        
        if (!combination || combination.length !== 8) {
            return res.status(400).json({ 
                error: 'Combinación inválida',
                received: combination,
                expectedLength: 8
            });
        }
        
        try {
            const dbCombination = await FifaService.getCombination(combination);
            
            if (dbCombination) {
                const matchupResponse = FifaService.toMatchupResponse(dbCombination);
                return res.json(matchupResponse);
            }
            
        } catch (dbError: unknown) {
            const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
            console.error('Error de DB:', errorMessage);
        }
        
        // MODO FALLBACK: Datos temporales
        const TEMP_DATA: Record<string, any> = {
            "EFGHIJKL": {
                combination: "EFGHIJKL",
                matchups: {
                    "1A": "3E", "1B": "3J", "1D": "3I", "1E": "3F",
                    "1G": "3H", "1I": "3G", "1K": "3L", "1L": "3K"
                }
            },
            "DFGHIJKL": {
                combination: "DFGHIJKL",
                matchups: {
                    "1A": "3H", "1B": "3G", "1D": "3I", "1E": "3D",
                    "1G": "3J", "1I": "3F", "1K": "3L", "1L": "3K"
                }
            },
            "DEGHIJKL": {
                combination: "DEGHIJKL",
                matchups: {
                    "1A": "3E", "1B": "3J", "1D": "3I", "1E": "3D",
                    "1G": "3H", "1I": "3G", "1K": "3L", "1L": "3K"
                }
            }
        };
        
        const matchup = TEMP_DATA[combination.toUpperCase()];
        
        if (matchup) {
            return res.json(matchup);
        }
        
        return res.status(404).json({ 
            error: `Combinación '${combination}' no encontrada`,
            hint: 'La combinación debe tener 8 letras únicas de la A a la L, ordenadas alfabéticamente'
        });
        
    } catch (error) {
        console.error('Error en matchup:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// Nueva ruta: Obtener todas las combinaciones disponibles
app.get('/api/fifa/combinations', async (req, res) => {
    try {
        try {
            const combinations = await FifaService.getAllCombinations();
            
            res.json({
                success: true,
                count: combinations.length,
                combinations: combinations
            });
            
        } catch (dbError: unknown) {
            const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
            console.error('Error de DB:', errorMessage);
            
            const TEMP_COMBINATIONS = ["EFGHIJKL", "DFGHIJKL", "DEGHIJKL"];
            
            res.json({
                success: true,
                count: TEMP_COMBINATIONS.length,
                combinations: TEMP_COMBINATIONS,
                note: 'Datos temporales (modo fallback)'
            });
        }
        
    } catch (error) {
        console.error('Error obteniendo combinaciones:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Ruta para verificar una combinación
app.post('/api/fifa/validate', async (req, res) => {
    try {
        const { combination } = req.body;
        
        if (!combination) {
            return res.status(400).json({
                valid: false,
                error: 'Se requiere el parámetro "combination"'
            });
        }
        
        if (combination.length !== 8) {
            return res.json({
                valid: false,
                error: 'La combinación debe tener exactamente 8 caracteres'
            });
        }
        
        const validRegex = /^[A-L]{8}$/i;
        if (!validRegex.test(combination)) {
            return res.json({
                valid: false,
                error: 'Solo se permiten letras de la A a la L'
            });
        }
        
        const sortedCombination = combination.split('').sort().join('').toUpperCase();
        
        const uniqueLetters = new Set(sortedCombination.split(''));
        if (uniqueLetters.size !== 8) {
            return res.json({
                valid: false,
                error: 'No puede haber letras repetidas'
            });
        }
        
        try {
            const exists = await FifaService.getCombination(sortedCombination);
            
            return res.json({
                valid: exists !== null,
                combination: sortedCombination,
                exists: exists !== null
            });
            
        } catch (dbError: unknown) {
            const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
            console.error('Error de DB:', errorMessage);
            
            const TEMP_COMBINATIONS = ["EFGHIJKL", "DFGHIJKL", "DEGHIJKL"];
            const isValid = TEMP_COMBINATIONS.includes(sortedCombination);
            
            return res.json({
                valid: isValid,
                combination: sortedCombination,
                exists: isValid,
                note: 'Validación en modo fallback'
            });
        }
        
    } catch (error) {
        console.error('Error validando combinación:', error);
        res.status(500).json({
            valid: false,
            error: 'Error interno del servidor'
        });
    }
});

// Ruta adicional para debug
app.get('/api/debug', async (req, res) => {
    const dbConnected = await testConnection();
    
    res.json({
        message: 'Debug endpoint',
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT
        },
        database: {
            connected: dbConnected,
            host: process.env.DB_HOST,
            name: process.env.DB_NAME
        },
        endpoints: {
            health: '/api/health',
            fifaMatchup: '/api/fifa/matchup/{combination}',
            fifaCombinations: '/api/fifa/combinations',
            validate: '/api/fifa/validate (POST)'
        }
    });
});
// Rutas de predicciones
app.use('/api/predictions', predictionRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

// Middleware para manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Inicializar y arrancar servidor
async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 ======================================`);
            console.log(`✅ Backend Mundial 2026 API`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Frontend: http://localhost:3000`);
            console.log(`======================================\n`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
