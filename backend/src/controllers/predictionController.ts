import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PredictionService } from '../services/predictionService';
import { UserService } from '../services/userService';

export class PredictionController {
    static async savePrediction(req: AuthRequest, res: Response): Promise<void> {
        // Guardar la predicción del usuario autenticado
        try {
            const userId = req.user!.id;
            const userCode = req.user!.user_code;
            
            const { 
                group_predictions,
                 third_place_selections, 
                qualified_teams, 
                 knockout_predictions,
                 is_completed =true
                 } = req.body;
            
            if (!group_predictions || !knockout_predictions || !third_place_selections || !qualified_teams) { // ← MODIFICADO
                res.status(400).json({ error: 'Faltan campos requeridos: group_predictions, knockout_predictions, third_place_selections o qualified_teams'  });
                return;
            }
              // VALIDACIÓN ADICIONAL: 32 equipos en qualified_teams
        if (!Array.isArray(qualified_teams) || qualified_teams.length !== 32) {
            res.status(400).json({ 
                error: 'qualified_teams debe ser un array con exactamente 32 equipos' 
            });
            return;
        }
        
        // 3. VALIDACIÓN: 8 terceros lugares
        if (!Array.isArray(third_place_selections) || third_place_selections.length !== 8) {
            res.status(400).json({ 
                error: 'third_place_selections debe ser un array con exactamente 8 terceros lugares' 
            });
            return;
        }
            // Validar que el usuario existe
            const user = await UserService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }
            // Crear la predicción
            const prediction = await PredictionService.createPrediction({
                user_id: userId,
            user_code: userCode,
            group_predictions,
            third_place_selections,    
            qualified_teams,    
            knockout_predictions,
            is_completed
            });
            
            res.json({
                success: true,
                message: 'Predicción guardada exitosamente',
                prediction: {
                    id: prediction.id,
                user_code: prediction.user_code,
                is_completed: prediction.is_completed,
                submitted_at: prediction.submitted_at,
                total_points: prediction.total_points,
                qualified_teams_count: qualified_teams.length  // ← Opcional para debug
                }
            });
            
        } catch (error: any) {
            console.error('Error guardando predicción:', error);
            res.status(400).json({ 
                success: false, 
                error: error.message || 'Error guardando predicción' 
            });
        }
    }
    
    static async getMyPrediction(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userCode = req.user!.user_code;
            
            const prediction = await PredictionService.getPredictionByUserCode(userCode);
            
            if (!prediction) {
                res.status(404).json({ 
                    success: false, 
                    error: 'No se encontró predicción para este usuario' 
                });
                return;
            }
            
            res.json({
                success: true,
                prediction
            });
            
        } catch (error: any) {
            console.error('Error obteniendo predicción:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
    
    static async getPredictionByCode(req: Request, res: Response): Promise<void> {
        try {
            const { userCode } = req.params;
            
        const code = Array.isArray(userCode) ? userCode[0] : userCode;
        
        if (!code) {
            res.status(400).json({ 
                success: false, 
                error: 'Código de usuario requerido' 
            });
            return;
        }
        
        const prediction = await PredictionService.getPredictionByUserCode(code);
            
            if (!prediction) {
                res.status(404).json({ 
                    success: false, 
                    error: 'No se encontró predicción para este usuario' 
                });
                return;
            }
            
            res.json({
                success: true,
                prediction
            });
            
        } catch (error: any) {
            console.error('Error obteniendo predicción:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
    
    static async getRanking(req: Request, res: Response): Promise<void> {
        try {
            const ranking = await PredictionService.getRanking();
            
            res.json({
                success: true,
                ranking
            });
            
        } catch (error: any) {
            console.error('Error obteniendo ranking:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
}