export interface GroupPrediction {
    [group: string]: {
        first: string;
        second: string;
        third: string;
        fourth: string;
    };
}

export interface KnockoutPrediction {
    roundOf32: string[];  // 16 equipos
    roundOf16: string[];  // 8 equipos
    quarterFinals: string[];  // 4 equipos
    semiFinals: string[];  // 2 equipos
    thirdPlace: string;  // equipo 3er lugar
    final: {
        champion: string;
        runnerUp: string;
    };
}

export interface Prediction {
    id: number;
    user_id: number;
    user_code: string;
    group_predictions: any;
    third_place_selections: any[];    
    qualified_teams: string[];   
    knockout_predictions: KnockoutPrediction;
    group_stage_points: number;
    round_of_32_points: number;
    round_of_16_points: number;
    quarter_finals_points: number;
    semi_finals_points: number;
    final_points: number;
    total_points: number;
    is_completed: boolean;
    submitted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface PredictionCreateInput {
    user_id: number;
    user_code: string;
    group_predictions: GroupPrediction;
        third_place_selections: any[];   
    qualified_teams: string[];        
    knockout_predictions: KnockoutPrediction;
    is_completed: boolean;
}

export interface PredictionUpdateInput {
    group_predictions?: GroupPrediction;
    knockout_predictions?: KnockoutPrediction;
}