// ─── Match / Tournament / Player ────────────────────────────────────────────

export type MatchStatus = "upcoming" | "live" | "completed";
export type TournamentStatus = "upcoming" | "live" | "completed";
export type TournamentCategory = "major" | "p1" | "p2";

export interface Player {
  id: string;
  name: string;
  country: string;
  ranking: number | null;
  avatarUrl: string | null;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName?: string;
  team1Player1: Player;
  team1Player2: Player;
  team2Player1: Player;
  team2Player2: Player;
  score: MatchScore | null;
  status: MatchStatus;
  round: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
}

export interface MatchScore {
  sets: SetScore[];
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  country: string | null;
  startDate: string;
  endDate: string;
  category: TournamentCategory;
  status: TournamentStatus;
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export type PredictionStatus = "pending" | "correct" | "partial" | "wrong";

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  match?: Match;
  predictedWinnerTeam: 1 | 2;
  predictedScore: string | null;
  pointsEarned: number;
  status: PredictionStatus;
  createdAt: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  isPremium: boolean;
  totalPoints: number;
  createdAt: string;
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  source: string | null;
  publishedAt: string;
}
