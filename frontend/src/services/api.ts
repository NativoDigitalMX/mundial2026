import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';



// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Definir interfaces para los datos
export interface BackendPredictionData {
  group_predictions: Record<string, { first: string; second: string }>;
  third_place_selections: Array<{
    team_code: string;
    team_name: string;
    group: string;
    
  }>;
  qualified_teams: string[];
  knockout_predictions: {
    roundOf32: string[];
    roundOf16: string[];
    quarterFinals: string[];
    semiFinals: string[];
    thirdPlace: string;
    final: {
      champion: string;
      runnerUp: string;
    };
  };
  is_completed: boolean;
}


// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
        const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (userCode: string, password: string) =>
    api.post('/auth/login', { user_code: userCode, password }),

  // Login admin
  adminLogin: (userCode: string, password: string) =>
    api.post('/auth/admin-login', { user_code: userCode, password }),
  
  register: (userData: { user_code: string; full_name: string; password: string; is_admin?: boolean }) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// Servicios de predicciones
export const predictionsAPI = {
  savePrediction: (predictionData: BackendPredictionData) =>
    api.post('/predictions/save', predictionData),
  
  getMyPrediction: () =>
    api.get('/predictions/my-prediction'),
  
  getPredictionByCode: (userCode: string) =>
    api.get(`/predictions/${userCode}`),
  
  getRanking: () =>
    api.get('/predictions/ranking/all'),
};

// Servicios de administración
export const adminAPI = {
  updateResult: (matchId: number, winnerCode: string) =>
    api.put(`/admin/results/${matchId}`, { winner_code: winnerCode }),
  
  getAllUsers: () =>
    api.get('/admin/users'),
};

// Servicios FIFA (ya existentes)
export const fifaAPI = {
  getMatchup: (combination: string) =>
    api.get(`/fifa/matchup/${combination}`),
  
  getCombinations: () =>
    api.get('/fifa/combinations'),
  
  validateCombination: (combination: string) =>
    api.post('/fifa/validate', { combination }),
};

export default api;
