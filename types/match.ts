export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface SetScore {
  team1: number;
  team2: number;
}

export interface MatchScore {
  sets: SetScore[];
}

export interface Player {
  id: string;
  name: string;
  country: string;
  ranking: number | null;
  avatarUrl: string | null;
  position: string | null;
  birthDate: string | null;
  handedness: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  team1Player1: Player;
  team1Player2: Player;
  team2Player1: Player;
  team2Player2: Player;
  score: MatchScore;
  status: MatchStatus;
  round: string;
  court: string | null;
  scheduledAt: string;
  completedAt: string | null;
  winnerTeam: number | null;
  tournament?: import('./tournament').Tournament;
}
