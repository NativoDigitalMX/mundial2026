export const POINTS = {
    ROUND_OF_32: 1,      // 1 punto por cada equipo acertado que pasa de grupos (32 equipos)
    ROUND_OF_16: 2,      // 2 puntos por cada equipo acertado en octavos (16 equipos)
    QUARTER_FINALS: 4,   // 4 puntos por cada equipo acertado en cuartos (8 equipos)
    SEMI_FINALS: 8,      // 8 puntos por cada equipo acertado en semifinales (4 equipos)
    FINAL: 16,           // 16 puntos por cada finalista acertado (2 equipos)
    CHAMPION: 32         // 32 puntos por acertar el campeón (bonus)
} as const;