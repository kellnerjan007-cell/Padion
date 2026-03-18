export type AchievementType =
  | 'first_prediction'
  | 'streak_3'
  | 'streak_5'
  | 'streak_10'
  | 'perfect_week'
  | 'tournament_winner'
  | 'century'
  | 'sharpshooter';

export interface Achievement {
  id: string;
  userId: string;
  achievementType: AchievementType | string;
  earnedAt: string;
}
