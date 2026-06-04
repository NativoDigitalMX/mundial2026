import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RealResultService } from '../services/realResultService';
import { PredictionService } from '../services/predictionService';
import { UserService } from '../services/userService';
import db from '../config/database';

export class AdminController {


//  OBTENER TODOS LOS USUARIOS    
static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsers();
            
            res.json({
                success: true,
                count: users.length,
                users
            });
            
        } catch (error: any) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    } 

static async savePhaseResults(req: AuthRequest, res: Response): Promise<void> {
        try {
            // 1. Type assertion para req.body
            const body = req.body as {
                stage?: string;
                team_codes?: string[];
                phase_number?: number;
            };
            
            const { stage, team_codes, phase_number } = body;
            
            // 2. Validaciones explícitas
            if (!stage || !team_codes || phase_number === undefined) {
                res.status(400).json({ 
                    error: 'Se requieren: stage, team_codes (array) y phase_number' 
                });
                return;
            }
            
            if (!Array.isArray(team_codes)) {
                res.status(400).json({ error: 'team_codes debe ser un array' });
                return;
            }
            
            // 3. Convertir a tipos correctos
            const stageStr = String(stage);
            const phaseNumber = Number(phase_number);
            
            if (isNaN(phaseNumber)) {
                res.status(400).json({ error: 'phase_number debe ser un número válido' });
                return;
            }
            
            // 4. Llamar al servicio
            const results = await RealResultService.savePhaseResults(
                stageStr,
                team_codes,
                phaseNumber
            );
            
            res.json({
                success: true,
                message: `Resultados de ${stageStr} guardados correctamente`,
                count: team_codes.length,
                results
            });
            
        } catch (error: any) {
            console.error('❌ Error en savePhaseResults:', error);
            res.status(400).json({ 
                success: false, 
                error: error.message || 'Error guardando resultados de fase' 
            });
        }
    }

static async getPhaseResults(req: AuthRequest, res: Response): Promise<void> {
        try {
            // stage puede ser undefined si la ruta no tiene parámetro
            const stage = req.params.stage as string | undefined;
            
            // Si stage es string vacío, tratarlo como undefined
            const stageParam = stage?.trim() || undefined;
            
            const results = await RealResultService.getPhaseResults(stageParam);
            
            res.json({
                success: true,
                stage: stageParam || 'all',
                count: results.length,
                results
            });
            
        } catch (error: any) {
            console.error('❌ Error en getPhaseResults:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    static async getQualifiedTeams(req: AuthRequest, res: Response): Promise<void> {
        try {
            // req.params.stage es string | undefined según Express
            const stage = req.params.stage as string | undefined;
            
            if (!stage) {
                res.status(400).json({ error: 'Se requiere el parámetro stage en la URL' });
                return;
            }
            const teams = await RealResultService.getQualifiedTeamsByStage(stage);
            
            res.json({
                success: true,
                stage,
                count: teams.length,
                teams
            });
            
        } catch (error: any) {
            console.error('❌ Error en getQualifiedTeams:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    static async getPhaseValidation(req: AuthRequest, res: Response): Promise<void> {
        try {
            const validation = await RealResultService.validatePhaseCompletion();
            res.json({
                success: true,
                validation
            });
            
        } catch (error: any) {
            console.error('❌ Error en getPhaseValidation:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async recalculateAllPoints(req: AuthRequest, res: Response): Promise<void> {
        try { 
        await PredictionService.calculateAllPoints();
        
        res.json({
            success: true,
            message: 'Todos los puntos han sido recalculados exitosamente'
        });
        
    } catch (error: any) {
        console.error('❌ Error recalculando puntos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
// Crear usuario
static async createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { user_code, full_name, password, is_active = true } = req.body;
    
    // Validaciones
    if (!user_code || !full_name || !password) {
      res.status(400).json({ error: 'Código, nombre y contraseña son requeridos' });
      return;
    }
    
    if (user_code.length !== 3) {
      res.status(400).json({ error: 'El código debe tener 3 caracteres' });
      return;
    }
    
    // Verificar que no exista el código
    const existingUser = await UserService.getUserByCode(user_code);
    if (existingUser) {
      res.status(400).json({ error: 'El código de usuario ya existe' });
      return;
    }
    
    // Crear usuario (SIEMPRE is_admin = false para usuarios nuevos)
    const userData = {
      user_code: user_code.toUpperCase(),
      full_name,
      password, // El servicio debería hashear la contraseña
      is_admin: false, // ← IMPORTANTE: Solo ADM puede ser admin
      is_active
    };
    
    const newUser = await UserService.createUser({
      user_code: user_code.toUpperCase(),
      full_name,
      password, // UserService debería hashear esto
      is_admin: false, // ← IMPORTANTE: Solo ADM puede ser admin
      is_active: is_active !== false // default true
    });
    
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        user_code: newUser.user_code,
        full_name: newUser.full_name,
        is_admin: newUser.is_admin,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    });
    
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//  Actualizar usuario
static async updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = typeof req.params.id === 'string' 
      ? parseInt(req.params.id) 
      : parseInt(req.params.id[0]);
    
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }
    const { full_name, password, is_active } = req.body;
    
    // Verificar que el usuario existe
    const existingUser = await UserService.getUserById(userId);
    if (!existingUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    // NO permitir cambiar is_admin (solo ADM es admin)
      const updateData: any = {};
    
    if (full_name !== undefined) updateData.full_name = full_name;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Solo actualizar contraseña si se proporciona
    if (password && password.trim() !== '') {
      updateData.password_hash = password;
    }
     // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No hay datos para actualizar' });
      return;
    }
    
    const updatedUser = await UserService.updateUser(userId, updateData);
    
    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        user_code: updatedUser.user_code,
        full_name: updatedUser.full_name,
        is_admin: updatedUser.is_admin,
        is_active: updatedUser.is_active,
        updated_at: updatedUser.updated_at
      }
    });
    
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//  Obtener estadísticas
static async getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const connection = await db.getConnection();
    
    // Usuarios activos (excluyendo admin)
    const [usersResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE is_active = true AND user_code != "ADM"'
    );
    
    // Predicciones completadas
    const [predictionsResult] = await connection.execute(
      'SELECT COUNT(DISTINCT user_id) as count FROM predictions WHERE is_completed = true'
    );
    
    // Total de predicciones (completadas y no completadas)
    const [totalPredictionsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM predictions'
    );
    
    connection.release();
    
    const usersCount = (usersResult as any[])[0]?.count || 0;
    const completedPredictions = (predictionsResult as any[])[0]?.count || 0;
    const totalPredictions = (totalPredictionsResult as any[])[0]?.count || 0;
    
    res.json({
      success: true,
      stats: {
        active_users: usersCount,
        completed_predictions: completedPredictions,
        total_predictions: totalPredictions,
        completion_rate: totalPredictions > 0 ? 
          Math.round((completedPredictions / usersCount) * 100) : 0
      }
    });
    
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Eliminar usuario
static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userIdParam = req.params.id;
    const userId = Array.isArray(userIdParam) 
      ? parseInt(userIdParam[0]) 
      : parseInt(userIdParam);
    
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }
    const { delete_predictions } = req.body; // Nuevo parámetro
    
    // Si tiene predicciones y no se especificó delete_predictions, devolver info
    const hasPredictions = await UserService.userHasPredictions(userId);
    
    if (hasPredictions && !delete_predictions) {
      res.status(400).json({ 
        error: 'USER_HAS_PREDICTIONS',
        message: 'El usuario tiene predicciones asociadas',
        prediction_count: await UserService.getPredictionCount(userId)
      });
      return;
    }
    
    // Eliminar usuario (con o sin predicciones según parámetro)
    await UserService.deleteUser(userId, delete_predictions === true);
    
    res.json({
      success: true,
      message: delete_predictions 
        ? 'Usuario y sus predicciones eliminados correctamente' 
        : 'Usuario eliminado correctamente'
    });
    
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    
    if (error.message === 'USER_HAS_PREDICTIONS') {
      res.status(400).json({ 
        error: 'USER_HAS_PREDICTIONS',
        message: 'El usuario tiene predicciones asociadas'
      });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

static async getAllPredictions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const connection = await db.getConnection();
        
        const [predictions] = await connection.execute(`
            SELECT p.*, u.full_name 
            FROM predictions p
            JOIN users u ON p.user_id = u.id
            WHERE p.is_completed = true
            ORDER BY p.total_points DESC
        `);
        
        const predictionsArray = predictions as any[];
        
        // Función para parsear qualified_teams de MySQL
        const parseQualifiedTeams = (data: any): string[] => {
            if (!data) return [];
            
            // MySQL devuelve un array especial que se serializa como CSV
            if (Array.isArray(data)) {
                // Convertir cada elemento a string y limpiar
                return data
                    .map(item => String(item).trim().toUpperCase())
                    .filter(item => item.length === 3);
            }
            
            // Si es string (backup)
            if (typeof data === 'string') {
                // Intentar como JSON
                if (data.trim().startsWith('[')) {
                    try {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed)) {
                            return parsed.map(item => String(item).trim().toUpperCase())
                                        .filter(item => item.length === 3);
                        }
                    } catch {
                        // Continuar
                    }
                }
                // Intentar como CSV (fallback)
                return data.split(',')
                    .map(item => item.trim().toUpperCase())
                    .filter(item => item.length === 3);
            }
            
            return [];
        };
        
        connection.release();
        
        res.json({
            success: true,
            count: predictionsArray.length,
            predictions: predictionsArray.map(p => ({
                id: p.id,
                user_id: p.user_id,
                user_code: p.user_code,
                full_name: p.full_name,
                qualified_teams: parseQualifiedTeams(p.qualified_teams),
                qualified_teams_count: parseQualifiedTeams(p.qualified_teams).length,
                points: {
                    round_of_32: p.round_of_32_points,
                    round_of_16: p.round_of_16_points,
                    quarter_finals: p.quarter_finals_points,
                    semi_finals: p.semi_finals_points,
                    final: p.final_points,
                    champion: p.champion_points || 0,
                    total: p.total_points
                },
                submitted_at: p.submitted_at
            }))
        });
        
    } catch (error: any) {
        console.error('Error obteniendo todas las predicciones:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

static async getUserPrediction(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userIdParam = req.params.id;
        const userId = Array.isArray(userIdParam) 
            ? parseInt(userIdParam[0]) 
            : parseInt(userIdParam);
        
        if (isNaN(userId)) {
            res.status(400).json({ error: 'ID de usuario inválido' });
            return;
        }
        
        const connection = await db.getConnection();
        
        const [predictions] = await connection.execute(
            `SELECT 
                p.*,
                u.user_code,
                u.full_name
            FROM predictions p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ? AND p.is_completed = true
            ORDER BY p.submitted_at DESC LIMIT 1`,
            [userId]
        );
        
        connection.release();
        
        const predictionRows = predictions as any[];
        if (!predictionRows || predictionRows.length === 0) {
            res.status(404).json({ 
                error: 'PREDICTION_NOT_FOUND',
                message: 'El usuario no tiene predicciones completadas'
            });
            return;
        }
        
        const prediction = predictionRows[0];
        // Función para parsear datos de MySQL
        const parseMySQLData = (data: any): any => {
            if (!data) return data;
            
            // Si es array (caso de MySQL)
            if (Array.isArray(data)) {
                return data.map(item => String(item).trim());
            }
            
            // Si es string, intentar como JSON
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                } catch {
                    // Si falla, podría ser CSV
                    if (data.includes(',')) {
                        return data.split(',').map(item => item.trim());
                    }
                    return data;
                }
            }
            return data;
        };
        
        res.json({
            success: true,
            prediction: {
                id: prediction.id,
                user_id: prediction.user_id,
                user_code: prediction.user_code,
                full_name: prediction.full_name,
                
                // Usar función de parseo
                qualified_teams: parseMySQLData(prediction.qualified_teams),
                qualified_teams_count: Array.isArray(prediction.qualified_teams) 
                    ? prediction.qualified_teams.length 
                    : (parseMySQLData(prediction.qualified_teams)?.length || 0),
                
                group_predictions: parseMySQLData(prediction.group_predictions),
                third_place_selections: prediction.third_place_selections,
                knockout_predictions: parseMySQLData(prediction.knockout_predictions),
                
                points: {
                    round_of_32: prediction.round_of_32_points,
                    round_of_16: prediction.round_of_16_points,
                    quarter_finals: prediction.quarter_finals_points,
                    semi_finals: prediction.semi_finals_points,
                    final: prediction.final_points,
                    champion: prediction.champion_points,
                    total: prediction.total_points
                },
                
                submitted_at: prediction.submitted_at,
                created_at: prediction.created_at
            }
        });
        
    } catch (error: any) {
        console.error('❌ Error en getUserPrediction:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message
        });
    }
}
}