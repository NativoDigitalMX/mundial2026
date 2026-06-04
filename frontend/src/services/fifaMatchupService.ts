import axios from 'axios';

export interface FifaMatchup {
    combination: string;          // "EFGHIJKL", "DFGHIJKL", "DEGHIJKL"
    matchups: {
        "1A": string;  // Columna 1A
        "1B": string;  // Columna 1B  
        "1D": string;  // Columna 1D
        "1E": string;  // Columna 1E
        "1G": string;  // Columna 1G
        "1I": string;  // Columna 1I
        "1K": string;  // Columna 1K
        "1L": string;  // Columna 1L
    };
}

// Configuración de la API (AJUSTAR SEGÚN EL PUERTO)


const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';
 //    Obtiene los matchups FIFA desde la API real (base de datos)

export const findFifaMatchup = async (combination: string): Promise<FifaMatchup | null> => {
    try {
        // Asegurar que la combinación esté ordenada y en mayúsculas
        const sortedCombination = combination.split('').sort().join('').toUpperCase();
        
        //📡 [Frontend] Consultando API para combinación: ${sortedCombination}`);
        
        const response = await axios.get<FifaMatchup>(
            `${API_BASE_URL}/fifa/matchup/${sortedCombination}`,
            {
                timeout: 10000, // 10 segundos timeout
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        
        //`✅ [Frontend] Datos recibidos de API para: ${sortedCombination}`);
        return response.data;
        
    } catch (error: any) {
        console.error('❌ [Frontend] Error consultando API FIFA:', {
            combination,
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        }); 
        return null;
    }
};

//  Valida si una combinación existe en la base de datos FIFA
export const validateFifaCombination = async (combination: string): Promise<boolean> => {
    try {
        const sortedCombination = combination.split('').sort().join('').toUpperCase();
        
        const response = await axios.post<{ valid: boolean }>(
            `${API_BASE_URL}/fifa/validate`,
            { combination: sortedCombination },
            { timeout: 5000 }
        );
        return response.data.valid;
        
    } catch (error) {
        console.error('Error validando combinación:', error);
        return false;
    }
};

//   Obtiene todas las combinaciones disponibles desde la API
export const getAllFifaCombinations = async (): Promise<string[]> => {
    try {
        const response = await axios.get<{ combinations: string[] }>(
            `${API_BASE_URL}/fifa/combinations`,
            { timeout: 10000 }
        );
        
        return response.data.combinations;
        
    } catch (error) {
        console.error('Error obteniendo combinaciones:', error);
       return [];
    }
};


  //Verifica el estado de la API (health check)
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
        return response.data.database === 'connected';
    } catch (error) {
        console.error('API no disponible:', error);
        return false;
    }
};
