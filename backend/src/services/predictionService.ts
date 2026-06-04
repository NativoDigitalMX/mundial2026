import mysql from 'mysql2/promise';
import { 
    Prediction, 
    PredictionCreateInput, 
    GroupPrediction, 
    KnockoutPrediction 
} from '../models/Prediction';
import db  from '../config/database';
import { RealResultService } from './realResultService';
import { POINTS } from '../config/constants';

export class PredictionService {    
    static async createPrediction(predictionData: PredictionCreateInput): Promise<Prediction> {
        const connection = await db.getConnection();
        
        // Verificar si el usuario ya tiene una predicción
        const [existing] = await connection.execute(
            'SELECT id FROM predictions WHERE user_code = ?',
            [predictionData.user_code]
        );
        
        if ((existing as any[]).length > 0) {
            throw new Error('El usuario ya tiene una predicción registrada');
        }
        
        // Calcular puntos iniciales (se actualizan cuando hay resultados reales)
        const [result] = await connection.execute(
            `INSERT INTO predictions 
             (user_id, user_code,
              group_predictions,
              third_place_selections, 
              qualified_teams,
              knockout_predictions, is_completed, submitted_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                predictionData.user_id,
                predictionData.user_code,
                JSON.stringify(predictionData.group_predictions),
                JSON.stringify(predictionData.third_place_selections || []),  // ← NUEVO
                JSON.stringify(predictionData.qualified_teams || []),         // ← NUEVO
                JSON.stringify(predictionData.knockout_predictions),
                predictionData.is_completed !== false
            ]
        );
        
        const insertedId = (result as mysql.ResultSetHeader).insertId;
        
        const [predictions] = await connection.execute(
            'SELECT * FROM predictions WHERE id = ?',
            [insertedId]
        );
        
        connection.release();
        
        return (predictions as Prediction[])[0];
    }
    
    static async getPredictionByUserCode(userCode: string): Promise<Prediction | null> {
    const connection = await db.getConnection();
    
    try {
        const [predictions] = await connection.execute(
            'SELECT * FROM predictions WHERE user_code = ?',
            [userCode]
        );
        
        const predictionArray = predictions as any[];
        
        if (predictionArray.length === 0) {
            return null;
        }
        
        const prediction = predictionArray[0];
                // Parsear solo si son strings
        if (typeof prediction.group_predictions === 'string') {
            try {
                prediction.group_predictions = JSON.parse(prediction.group_predictions);
            } catch (error) {
                console.error('Error parseando group_predictions:', error);
            }
        }
        
        if (typeof prediction.knockout_predictions === 'string') {
            try {
                prediction.knockout_predictions = JSON.parse(prediction.knockout_predictions);
            } catch (error) {
                console.error('Error parseando knockout_predictions:', error);
            }
        }
       
        return prediction as Prediction;
        
    } catch (error) {
        console.error('Error en getPredictionByUserCode:', error);
        throw error;
    } finally {
        connection.release();
    }
}
    
    static async getAllPredictions(): Promise<Prediction[]> {
    const connection = await db.getConnection();
    
    const [predictions] = await connection.execute(
        'SELECT * FROM predictions ORDER BY total_points DESC, submitted_at ASC'
    );
    
    connection.release();
    
    const predictionArray = predictions as any[];
    
    // Parsear solo strings a JSON
    return predictionArray.map(pred => {
        const prediction = { ...pred };
        
        if (typeof prediction.group_predictions === 'string') {
            prediction.group_predictions = JSON.parse(prediction.group_predictions);
        }
        
        if (typeof prediction.knockout_predictions === 'string') {
            prediction.knockout_predictions = JSON.parse(prediction.knockout_predictions);
        }
        
        return prediction as Prediction;
    });
}
    static async getRanking(): Promise<any[]> {
        const connection = await db.getConnection();
        
        const [ranking] = await connection.execute(`
            SELECT 
                p.user_code,
                u.full_name,
                p.total_points,
                p.group_stage_points,
                p.round_of_32_points,
                p.round_of_16_points,
                p.quarter_finals_points,
                p.semi_finals_points,
                p.final_points,
                p.submitted_at
            FROM predictions p
            JOIN users u ON p.user_id = u.id
            WHERE p.is_completed = TRUE
            ORDER BY p.total_points DESC, p.submitted_at ASC
        `);
        
        connection.release();
        
        return ranking as any[];
    }
    
static async calculatePoints(prediction: any): Promise<{
    round_of_32_points: number;  
    round_of_16_points: number;
    quarter_finals_points: number;
    semi_finals_points: number;
    final_points: number;        
    champion_points: number;  
    total: number;
}> {
    try {
        
        // Obtener resultados reales por fase
        const realResults = await RealResultService.getPhaseResults();
        
        // Agrupar resultados reales por stage
        const realByStage: Record<string, string[]> = {};
        realResults.forEach(result => {
            if (!realByStage[result.stage]) {
                realByStage[result.stage] = [];
            }
            realByStage[result.stage].push(result.team_code);
        });

        // Función helper para parsear seguro
        const parseQualifiedTeams = (data: any): string[] => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
        return data;
    }
    
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch {
            // Si falla JSON, intentar como CSV
            return data.split(',').map((t: string) => t.trim()).filter((t: string) => t);
        }
    }
    
    return [];
};
        // Parsear predicciones del usuario
        const userPredictions = {

			//  32 equipos:
            roundOf32: parseQualifiedTeams(prediction.qualified_teams),
            // Fases knockout
			//16 equipos:
            roundOf16: prediction.knockout_predictions?.roundOf32 || [],
			// 8 equipos:
            quarterFinals: prediction.knockout_predictions?.roundOf16 || [],
			
			//4 equipos
            semiFinals: prediction.knockout_predictions?.quarterFinals || [],
            
            // Final: array de 2 equipos [champion, runnerUp]
            final: [
                prediction.knockout_predictions?.final?.champion || '',
                prediction.knockout_predictions?.final?.runnerUp || ''
            ].filter(t => t),
            
            // Campeón: string individual
            champion: prediction.knockout_predictions?.final?.champion || ''
        };
        //  Predicciones del usuario: userPredictions
        // Función para contar coincidencias
        const countMatches = (predicted: string[], real: string[]): number => {
            if (!predicted || !real || predicted.length === 0 || real.length === 0) {
                return 0;
            }
            const predictedSet = new Set(predicted.map(t => t?.toUpperCase()?.trim()).filter(t => t));
            const realSet = new Set(real.map(t => t?.toUpperCase()?.trim()).filter(t => t));
            
            let matches = 0;
            for (const team of predictedSet) {
                if (realSet.has(team)) matches++;
            }
            return matches;
        };
        
        // Calcular puntos por fase
        const roundOf32Points = countMatches(userPredictions.roundOf32, realByStage['group'] || []) * POINTS.ROUND_OF_32;
        const roundOf16Points = countMatches(userPredictions.roundOf16, realByStage['roundOf16'] || []) * POINTS.ROUND_OF_16;
        const quarterFinalsPoints = countMatches(userPredictions.quarterFinals, realByStage['quarterFinals'] || []) * POINTS.QUARTER_FINALS;
        const semiFinalsPoints = countMatches(userPredictions.semiFinals, realByStage['semiFinals'] || []) * POINTS.SEMI_FINALS;
        
        // Final (2 equipos)
        let finalPoints = 0;
        if (userPredictions.final.length > 0 && realByStage['final']) {
            const finalMatches = countMatches(userPredictions.final, realByStage['final']);
            finalPoints = finalMatches * POINTS.FINAL;
        }
        
        // Campeón (puntos extra)
        let championPoints = 0;
        if (userPredictions.champion && realByStage['champion'] && realByStage['champion'].length > 0) {
            const predictedChamp = userPredictions.champion.toUpperCase().trim();
            const realChamp = realByStage['champion'][0].toUpperCase().trim();
            if (predictedChamp === realChamp) {
                championPoints = POINTS.CHAMPION; // 32 puntos
            }
        }
        
        const total = roundOf32Points + roundOf16Points + quarterFinalsPoints + 
                     semiFinalsPoints + finalPoints + championPoints
                return {
            round_of_32_points: roundOf32Points,
            round_of_16_points: roundOf16Points,
            quarter_finals_points: quarterFinalsPoints,
            semi_finals_points: semiFinalsPoints,
            final_points: finalPoints,
            champion_points: championPoints,
            total
        };
        
    } catch (error) {
        console.error('❌ Error calculando puntos:', error);
        return {
            round_of_32_points: 0,
            round_of_16_points: 0,
            quarter_finals_points: 0,
            semi_finals_points: 0,
            final_points: 0,
            champion_points: 0,
            total: 0
        };
    }
}
   static async calculateAllPoints(): Promise<void> {
    try {
        const connection = await db.getConnection();
    
        // Obtener todas las predicciones completadas
        const [predictions] = await connection.execute(
            'SELECT * FROM predictions WHERE is_completed = true'
        );
        // Recalculando puntos para predicciones...
        const predictionsArray = predictions as any[];
        // Calcular puntos para cada predicción
        for (const pred of predictions as any[]) {
            const points = await this.calculatePoints(pred);
            // Actualizar puntos en la base de datos
            await connection.execute(
                `UPDATE predictions SET 
                 round_of_32_points = ?,
                 round_of_16_points = ?,
                 quarter_finals_points = ?,
                 semi_finals_points = ?,
                 final_points = ?, 
                 champion_points = ?, 
                 total_points = ?,
                 updated_at = NOW()
                 WHERE id = ?`,
                [
                    points.round_of_32_points,
                    points.round_of_16_points,
                    points.quarter_finals_points,
                    points.semi_finals_points,
                    points.final_points,
                    points.champion_points,
                    points.total,
                    pred.id
                ]
            );
        }
        
        connection.release();
        
    } catch (error) {
        console.error('❌ Error en calculateAllPoints:', error);
        throw error;
    }
}
}