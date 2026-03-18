export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  country: string;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  predictionsCount: number;
  correctPredictionsCount: number;
  dailyPredictionsCount: number;
  dailyPredictionsResetAt: string;
  dailyChatCount: number;
  dailyChatResetAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string;
  country?: string;
}
