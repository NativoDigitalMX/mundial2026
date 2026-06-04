import db from '../config/database';
import { FifaCombination } from '../types/fifa';

export class FifaService {
    /**
     * Obtiene una combinación FIFA específica de la base de datos
     */
    static async getCombination(combination: string): Promise<FifaCombination | null> {
        try {
            // La combinación debe estar ordenada alfabéticamente
            const sortedCombination = combination.split('').sort().join('').toUpperCase();
            
            const [rows] = await db.execute(
                `SELECT * FROM fifa_combinations WHERE combination = ?`,
                [sortedCombination]
            );
            
            // Type assertion 
            const combinations = rows as any[];
            
            if (!Array.isArray(combinations) || combinations.length === 0) {
                return null;
            }
            
            return combinations[0] as FifaCombination;
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ [DB] Error obteniendo combinación:', errorMessage);
            throw new Error(`Error de base de datos: ${errorMessage}`);
        }
    }
    
    /**
     * Obtiene todas las combinaciones disponibles
     */
    static async getAllCombinations(): Promise<string[]> {
        try {
            const [rows] = await db.execute(
                `SELECT combination FROM fifa_combinations ORDER BY combination`
            );
            
            // Type assertion
            const combinations = rows as any[];
            
            if (!Array.isArray(combinations)) {
                throw new Error('Resultado de consulta no es un array');
            }
            
            return combinations.map(row => row.combination);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ [DB] Error obteniendo todas las combinaciones:', errorMessage);
            throw new Error(`Error de base de datos: ${errorMessage}`);
        }
    }
    
    /**
     * Convierte una FifaCombination a FifaMatchupResponse
     */
    static toMatchupResponse(combination: FifaCombination): any {
        if (!combination) {
            throw new Error('Combinación no puede ser nula');
        }
        
        return {
            combination: combination.combination,
            matchups: {
                "1A": combination.matchup_1A,
                "1B": combination.matchup_1B,
                "1D": combination.matchup_1D,
                "1E": combination.matchup_1E,
                "1G": combination.matchup_1G,
                "1I": combination.matchup_1I,
                "1K": combination.matchup_1K,
                "1L": combination.matchup_1L
            }
        };
    }
}