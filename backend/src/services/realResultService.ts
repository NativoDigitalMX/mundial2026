import db from '../config/database';
import { PredictionService } from './predictionService';
import { POINTS } from '../config/constants';

export interface PhaseResult {
    id?: number;
    stage: string;
    team_code: string;
    phase_number: number;
    created_at?: Date;
}

export class RealResultService {
    
    static async savePhaseResults(stage: string, teamCodes: string[], phaseNumber: number): Promise<PhaseResult[]> {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Validar cantidad de equipos según fase
            const expectedCount = await this.getExpectedTeamCount(stage);
            if (teamCodes.length !== expectedCount) {
                throw new Error(`Para la fase ${stage} se requieren ${expectedCount} equipos (recibidos: ${teamCodes.length})`);
            }
            
            // Validar códigos (3 letras)
            const invalidCodes = teamCodes.filter(code => !/^[A-Z]{3}$/.test(code.trim().toUpperCase()));
            if (invalidCodes.length > 0) {
                throw new Error(`Códigos inválidos: ${invalidCodes.join(', ')}. Deben ser 3 letras.`);
            }
            
            // Eliminar resultados previos de esta fase
            await connection.execute(
                'DELETE FROM phase_results WHERE stage = ?',
                [stage]
            );
            
            // Insertar nuevos equipos clasificados
            for (const teamCode of teamCodes) {
                await connection.execute(
                    `INSERT INTO phase_results (stage, team_code, phase_number) 
                     VALUES (?, ?, ?)`,
                    [stage, teamCode.toUpperCase().trim(), phaseNumber]
                );
            }
            
            // Obtener los resultados insertados
            const [results] = await connection.execute(
                'SELECT * FROM phase_results WHERE stage = ? ORDER BY team_code',
                [stage]
            );
            
            await connection.commit();
            
            // Recalcular puntos para todas las predicciones
            await PredictionService.calculateAllPoints();
            return results as PhaseResult[];
            
        } catch (error) {
            await connection.rollback();
            console.error('❌ Error en savePhaseResults:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
    
    static async getPhaseResults(stage?: string): Promise<PhaseResult[]> {
        const connection = await db.getConnection();
        
        let query = 'SELECT * FROM phase_results';
        const params: any[] = [];
        
        if (stage) {
            query += ' WHERE stage = ?';
            params.push(stage);
        }
        
        query += ' ORDER BY phase_number, team_code';
        
        const [results] = await connection.execute(query, params);
        connection.release();
        
        return results as PhaseResult[];
    }
    
    static async getQualifiedTeamsByPhase(phaseNumber: number): Promise<string[]> {
        const connection = await db.getConnection();
        
        const [results] = await connection.execute(
            'SELECT team_code FROM phase_results WHERE phase_number = ?',
            [phaseNumber]
        );
        
        connection.release();
        
        return (results as any[]).map(row => row.team_code);
    }
    
    static async getQualifiedTeamsByStage(stage: string): Promise<string[]> {
        const connection = await db.getConnection();
        
        const [results] = await connection.execute(
            'SELECT team_code FROM phase_results WHERE stage = ? ORDER BY team_code',
            [stage]
        );
        
        connection.release();
        
        return (results as any[]).map(row => row.team_code);
    }
    
    // ====== MÉTODOS AUXILIARES ======
    
    static async getExpectedTeamCount(stage: string): Promise<number> {
        const connection = await db.getConnection();
        
        const [results] = await connection.execute(
            'SELECT expected_teams FROM phase_definitions WHERE stage_name = ?',
            [stage]
        );
        
        connection.release();
        
        const rows = results as any[];
        if (rows.length === 0) {
            throw new Error(`Fase no definida: ${stage}`);
        }
        
        return rows[0].expected_teams;
    }
    
    static async getAllPhaseDefinitions(): Promise<any[]> {
        const connection = await db.getConnection();
        
        const [results] = await connection.execute(
            'SELECT * FROM phase_definitions ORDER BY phase_number'
        );
        
        connection.release();
        
        return results as any[];
    }
    
    static async getStageByPhaseNumber(phaseNumber: number): Promise<string | null> {
        const connection = await db.getConnection();
        
        const [results] = await connection.execute(
            'SELECT stage_name FROM phase_definitions WHERE phase_number = ? LIMIT 1',
            [phaseNumber]
        );
        
        connection.release();
        
        const rows = results as any[];
        return rows.length > 0 ? rows[0].stage_name : null;
    }
    
    //====== INICIALIZACIÓN DE DATOS DE FASE ======
    
    static async initializePhaseData(): Promise<void> {
        const connection = await db.getConnection();
        
        try {
            // Verificar si phase_definitions está vacía
            const [existing] = await connection.execute(
                'SELECT COUNT(*) as count FROM phase_definitions'
            );
            
            const count = (existing as any[])[0].count;
            
            if (count === 0) {
                // FASES DEL TORNEO
                await connection.execute(`
                    INSERT INTO phase_definitions (stage_name, phase_number, expected_teams) VALUES
                    ('group', 1, 32),
                    ('roundOf16', 2, 16),
                    ('quarterFinals', 3, 8),
                    ('semiFinals', 4, 4),
                    ('final', 5, 2'),
                    ('champion', 6, 1)
                `);
            } else {
                console.log('ℹ️  Las definiciones de fases ya existen');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando datos de fase:', error);
        } finally {
            connection.release();
        }
    }
    
    //====== MÉTODOS PARA VERIFICACIÓN ======
    
    static async validatePhaseCompletion(): Promise<{stage: string, phase_number: number, completed: boolean, count: number, expected: number}[]> {
        const definitions = await this.getAllPhaseDefinitions();
        const results = [];
        
        for (const def of definitions) {
            const teams = await this.getQualifiedTeamsByStage(def.stage_name);
            results.push({
                stage: def.stage_name,
                phase_number: def.phase_number,
                completed: teams.length === def.expected_teams,
                count: teams.length,
                expected: def.expected_teams,
                description: def.description || ''
            });
        }
        
        return results;
    }
    
     static async getCurrentPhase(): Promise<number> {
        const validation = await this.validatePhaseCompletion();
        
        // Encontrar la última fase completada
        let currentPhase = 0;
        for (const phase of validation) {
            if (phase.completed) {
                currentPhase = phase.phase_number;
            } else {
                break;
            }
        }
        
        return currentPhase;
    } 
}