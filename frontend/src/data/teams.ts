// data/teams.ts
import type { Team, Group } from '../types/tournament';
export const createRealTeams = (): Team[] => {
  const teams: Team[] = [];
  const groupsData = [
    {
      id: 'A',
      teams: [
        { name: 'México', code: 'MEX', isHost: true },
        { name: 'Sudáfrica', code: 'RSA' },
        { name: 'Corea del Sur', code: 'KOR' },
        { name: 'Chequia', code: 'CZE' } // Cambiado de placeholder a equipo real despues de las eliminatorias
      ]
    },
    {
      id: 'B',
      teams: [
        { name: 'Canadá', code: 'CAN', isHost: true },
        { name: 'Bosnia', code: 'BIH' }, // Cambiado de placeholder a equipo real 
        { name: 'Qatar', code: 'QAT' },
        { name: 'Suiza', code: 'SUI' }
      ]
    },
    {
      id: 'C',
      teams: [
        { name: 'Brasil', code: 'BRA' },
        { name: 'Marruecos', code: 'MAR' },
        { name: 'Haití', code: 'HAI' },
        { name: 'Escocia', code: 'SCO' }
      ]
    },
    {
      id: 'D',
      teams: [
        { name: 'Estados Unidos', code: 'USA', isHost: true },
        { name: 'Paraguay', code: 'PAR' },
        { name: 'Australia', code: 'AUS' },
        { name: 'Turquía', code: 'TUR' } // Cambiado de placeholder a equipo real 
      ]
    },
    {
      id: 'E',
      teams: [
        { name: 'Alemania', code: 'GER' },
        { name: 'Curazao', code: 'CUW' },
        { name: 'Costa de Marfil', code: 'CIV' },
        { name: 'Ecuador', code: 'ECU' }
      ]
    },
    {
      id: 'F',
      teams: [
        { name: 'Países Bajos', code: 'NED' },
        { name: 'Japón', code: 'JPN' },
        { name: 'Suecia', code: 'SWE' }, // Cambiado de placeholder a equipo real 
        { name: 'Túnez', code: 'TUN' }
      ]
    },
    {
      id: 'G',
      teams: [
        { name: 'Bélgica', code: 'BEL' },
        { name: 'Egipto', code: 'EGY' },
        { name: 'Irán', code: 'IRN' },
        { name: 'Nueva Zelanda', code: 'NZL' }
      ]
    },
    {
      id: 'H',
      teams: [
        { name: 'España', code: 'ESP' },
        { name: 'Cabo Verde', code: 'CPV' },
        { name: 'Arabia Saudita', code: 'KSA' },
        { name: 'Uruguay', code: 'URU' }
      ]
    },
    {
      id: 'I',
      teams: [
        { name: 'Francia', code: 'FRA' },
        { name: 'Senegal', code: 'SEN' },
        { name: 'Irak', code: 'IRQ' }, // Cambiado de placeholder a equipo real 
        { name: 'Noruega', code: 'NOR' }
      ]
    },
    {
      id: 'J',
      teams: [
        { name: 'Argentina', code: 'ARG' },
        { name: 'Argelia', code: 'ALG' },
        { name: 'Austria', code: 'AUT' },
        { name: 'Jordania', code: 'JOR' }
      ]
    },
    {
      id: 'K',
      teams: [
        { name: 'Portugal', code: 'POR' },
        { name: 'Congo', code: 'COD' }, // Cambiado de placeholder a equipo real 
        { name: 'Uzbekistán', code: 'UZB' },
        { name: 'Colombia', code: 'COL' }
      ]
    },
    {
      id: 'L',
      teams: [
        { name: 'Inglaterra', code: 'ENG' },
        { name: 'Croacia', code: 'CRO' },
        { name: 'Ghana', code: 'GHA' },
        { name: 'Panamá', code: 'PAN' }
      ]
    },
  ];

  // Convertir a estructura de Team
  groupsData.forEach(groupData => {
    groupData.teams.forEach((teamData, index) => {
      teams.push({
        id: `${groupData.id.toLowerCase()}-${teamData.code.toLowerCase()}-${index}`,
        name: teamData.name,
        code: teamData.code,
        group: groupData.id,
        flag: getFlagForCode(teamData.code),
        isHost: teamData.isHost || false,
      });
    });
  });

  return teams;
};

// Función para obtener bandera por código
const getFlagForCode = (code: string): string => {
  const flagMap: Record<string, string> = {
    'MEX': '🇲🇽', 'RSA': '🇿🇦', 'KOR': '🇰🇷',
    'CAN': '🇨🇦', 'QAT': '🇶🇦', 'SUI': '🇨🇭',
    'BRA': '🇧🇷', 'MAR': '🇲🇦', 'HAI': '🇭🇹', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'USA': '🇺🇸', 'PAR': '🇵🇾', 'AUS': '🇦🇺',
    'GER': '🇩🇪', 'CUW': '🇨🇼', 'CIV': '🇨🇮', 'ECU': '🇪🇨',
    'NED': '🇳🇱', 'JPN': '🇯🇵', 'TUN': '🇹🇳',
    'BEL': '🇧🇪', 'EGY': '🇪🇬', 'IRN': '🇮🇷', 'NZL': '🇳🇿',
    'ESP': '🇪🇸', 'CPV': '🇨🇻', 'KSA': '🇸🇦', 'URU': '🇺🇾',
    'FRA': '🇫🇷', 'SEN': '🇸🇳', 'NOR': '🇳🇴',
    'ARG': '🇦🇷', 'ALG': '🇩🇿', 'AUT': '🇦🇹', 'JOR': '🇯🇴',
    'POR': '🇵🇹', 'UZB': '🇺🇿', 'COL': '🇨🇴',
    'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'CRO': '🇭🇷', 'GHA': '🇬🇭', 'PAN': '🇵🇦',
    'CZE': '🇨🇿',    // Czechia
    'BIH': '🇧🇦',    // Bosnia
    'TUR': '🇹🇷',    // Turquía
    'SWE': '🇵🇱',    // Suecia
    'IRQ': '🇸🇷',    // Irak
    'COD': '🇨🇩',    // Congo
  };
  
  return flagMap[code] || '🏳️';
};

// Función para obtener colores de bandera
export const getCountryColor = (code: string): { gradient: string, textColor: string } => {
  const colorMap: Record<string, { gradient: string, textColor: string }> = {
    // Anfitriones
    'MEX': { gradient: 'from-green-600 via-white to-red-600', textColor: 'text-black' },
    'CAN': { gradient: 'from-red-600 via-white to-red-600', textColor: 'text-black' },
    'USA': { gradient: 'from-red-600 via-white to-blue-600', textColor: 'text-black' },

    // Sudamérica
    'ARG': { gradient: 'from-sky-400 via-white to-sky-400', textColor: 'text-black' },
    'BRA': { gradient: 'from-green-600 via-yellow-500 to-blue-600', textColor: 'text-black' },
    'URU': { gradient: 'from-white via-blue-400 to-white', textColor: 'text-black' },
    'PAR': { gradient: 'from-red-600 via-white to-blue-600', textColor: 'text-black' },
    'COL': { gradient: 'from-yellow-400 via-blue-600 to-red-600', textColor: 'text-white' },
    'ECU': { gradient: 'from-yellow-400 via-blue-600 to-red-600', textColor: 'text-white' },

    // Europa
    'ESP': { gradient: 'from-red-600 via-yellow-400 to-red-600', textColor: 'text-black' },
    'GER': { gradient: 'from-black via-red-600 to-yellow-400', textColor: 'text-white' },
    'FRA': { gradient: 'from-blue-600 via-white to-red-600', textColor: 'text-black' },
    'ENG': { gradient: 'from-white via-red-600 to-white', textColor: 'text-black' },
    'POR': { gradient: 'from-green-600 via-red-600 to-green-600', textColor: 'text-white' },
    'BEL': { gradient: 'from-black via-yellow-500 to-red-600', textColor: 'text-white' },
    'NED': { gradient: 'from-red-600 via-white to-blue-600', textColor: 'text-black' },
    'SUI': { gradient: 'from-red-600 via-white to-red-600', textColor: 'text-black' },
    'CRO': { gradient: 'from-red-600 via-white to-blue-600', textColor: 'text-black' },
    'AUT': { gradient: 'from-red-600 via-white to-red-600', textColor: 'text-black' },
    'NOR': { gradient: 'from-red-600 via-white to-blue-600', textColor: 'text-black' },
    'SCO': { gradient: 'from-blue-600 via-white to-blue-600', textColor: 'text-black' },

    // África
    'RSA': { gradient: 'from-red-600 via-white to-green-600', textColor: 'text-black' },
    'MAR': { gradient: 'from-red-600 via-green-600 to-red-600', textColor: 'text-white' },
    'SEN': { gradient: 'from-green-600 via-yellow-500 to-red-600', textColor: 'text-white' },
    'EGY': { gradient: 'from-red-600 via-white to-black', textColor: 'text-white' },
    'CPV': { gradient: 'from-blue-600 via-white to-red-600', textColor: 'text-black' },
    'TUN': { gradient: 'from-red-600 via-white to-red-600', textColor: 'text-black' },
    'ALG': { gradient: 'from-green-600 via-white to-red-600', textColor: 'text-black' },
    'GHA': { gradient: 'from-red-600 via-yellow-500 to-green-600', textColor: 'text-white' },
    'CIV': { gradient: 'from-orange-500 via-white to-green-600', textColor: 'text-black' },

    // Asia
    'KOR': { gradient: 'from-red-600 via-white to-blue-600', textColor: 'text-black' },
    'JPN': { gradient: 'from-white via-red-600 to-white', textColor: 'text-black' },
    'KSA': { gradient: 'from-green-600 via-white to-green-600', textColor: 'text-black' },
    'IRN': { gradient: 'from-green-600 via-white to-red-600', textColor: 'text-black' },
    'QAT': { gradient: 'from-purple-700 via-white to-purple-700', textColor: 'text-white' },
    'JOR': { gradient: 'from-black via-white to-green-600', textColor: 'text-white' },
    'UZB': { gradient: 'from-blue-600 via-white to-green-600', textColor: 'text-black' },

    // Otros
    'HAI': { gradient: 'from-blue-600 via-red-600 to-blue-600', textColor: 'text-white' },
    'CUW': { gradient: 'from-blue-600 via-yellow-500 to-blue-600', textColor: 'text-black' },
    'AUS': { gradient: 'from-blue-600 via-white to-red-600', textColor: 'text-black' },
    'NZL': { gradient: 'from-blue-600 via-white to-red-600', textColor: 'text-black' },
    'PAN': { gradient: 'from-blue-600 via-white to-red-600', textColor: 'text-black' },
    'DEN': { gradient: 'from-red-600 via-white to-red-600', textColor: 'text-black' }, // Dinamarca
    'ITA': { gradient: 'from-green-600 via-white to-red-600', textColor: 'text-black' }, // Italia
    'TUR': { gradient: 'from-red-600 via-white to-red-600', textColor: 'text-black' }, // Turquía
    'POL': { gradient: 'from-white via-red-600 to-white', textColor: 'text-black' }, // Polonia
    'SUR': { gradient: 'from-green-600 via-white to-red-600', textColor: 'text-black' }, // Surinam
    'JAM': { gradient: 'from-green-600 via-yellow-500 to-black', textColor: 'text-white' }, // Jamaica
	'CZE': { gradient: 'from-blue-800 via-white to-red-600', textColor: 'text-black' },
	'BIH': { gradient: 'from-blue-800 via-yellow-400 to-blue-800', textColor: 'text-white' },
	'SWE': { gradient: 'from-blue-600 via-yellow-400 to-blue-600', textColor: 'text-black' },
	'IRQ': { gradient: 'from-red-600 via-white to-black', textColor: 'text-black' },
	'COD': { gradient: 'from-blue-500 via-yellow-400 to-red-600', textColor: 'text-white' },
  };

  return colorMap[code] || { gradient: 'from-gray-500 via-gray-300 to-gray-500', textColor: 'text-black' };
};

// Función para crear grupos desde equipos
export const createGroupsFromTeams = (teams: Team[]): Group[] => {
  const groupsMap: Record<string, Team[]> = {};
  // Agrupar equipos por grupo
  teams.forEach(team => {
    if (!groupsMap[team.group]) {
      groupsMap[team.group] = [];
    }
    groupsMap[team.group].push(team);
  });
  // Convertir a array de grupos
  return Object.entries(groupsMap).map(([id, groupTeams]) => ({
    id,
    name: `Grupo ${id}`,
    teams: groupTeams.slice(0, 4) // Asegurar máximo 4 equipos por grupo
  }));
};

// Exportar datos reales
export const REAL_TEAMS = createRealTeams();
export const REAL_GROUPS = createGroupsFromTeams(REAL_TEAMS);

// Mantener funciones originales para compatibilidad
export const INITIAL_TEAMS = createRealTeams(); 
export const INITIAL_GROUPS = createGroupsFromTeams(REAL_TEAMS); // Mismos datos