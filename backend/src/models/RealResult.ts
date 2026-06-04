export interface RealResult {
    id: number;
    match_id: number;
    stage: string;
    team1_code: string;
    team2_code: string;
    winner_code: string | null;
    is_played: boolean;
    updated_at: Date;
}

export interface RealResultUpdateInput {
    winner_code: string;
    is_played?: boolean;
}