export type PredictionStatus = 'pending' | 'correct' | 'partial' | 'wrong';

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedWinnerTeam: 1 | 2;
  predictedScore: string | null;
  pointsEarned: number;
  status: PredictionStatus;
  createdAt: string;
  match?: import('./match').Match;
}

export interface CreatePredictionInput {
  matchId: string;
  predictedWinnerTeam: 1 | 2;
  predictedScore?: string;
}
