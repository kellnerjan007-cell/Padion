export type LeaderboardPeriod = 'weekly' | 'monthly' | 'seasonal' | 'alltime';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  period: LeaderboardPeriod;
  periodStart: string;
  totalPoints: number;
  rank: number | null;
  correctPredictions: number;
  totalPredictions: number;
  streak: number;
  bestStreak: number;
  updatedAt: string;
  profile?: import('./profile').Profile;
}
