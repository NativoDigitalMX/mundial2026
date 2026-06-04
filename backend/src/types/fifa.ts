export interface FifaCombination {
    id: number;
    combination: string;           // Ej: "EFGHIJKL"
    matchup_1A: string;           // Ej: "3E"
    matchup_1B: string;           // Ej: "3J"
    matchup_1D: string;           // Ej: "3I"
    matchup_1E: string;           // Ej: "3F"
    matchup_1G: string;           // Ej: "3H"
    matchup_1I: string;           // Ej: "3G"
    matchup_1K: string;           // Ej: "3L"
    matchup_1L: string;           // Ej: "3K"
}

export interface FifaMatchupResponse {
    combination: string;
    matchups: {
        "1A": string;
        "1B": string;
        "1D": string;
        "1E": string;
        "1G": string;
        "1I": string;
        "1K": string;
        "1L": string;
    };
}