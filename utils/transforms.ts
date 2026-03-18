import type { Tables } from '@/types/database';
import type { Match, Player, MatchScore } from '@/types/match';
import type { Tournament } from '@/types/tournament';
import type { Prediction } from '@/types/prediction';
import type { Profile } from '@/types/profile';
import type { ChatSession, ChatMessage } from '@/types/chat';
import type { LeaderboardEntry } from '@/types/leaderboard';
import type { Achievement } from '@/types/achievement';
import type { Friendship } from '@/types/friendship';

type DbPlayer = Tables<'players'>;
type DbTournament = Tables<'tournaments'>;
type DbPrediction = Tables<'predictions'>;
type DbProfile = Tables<'profiles'>;
type DbChatSession = Tables<'chat_sessions'>;
type DbChatMessage = Tables<'chat_messages'>;
type DbLeaderboardEntry = Tables<'leaderboard_entries'>;
type DbAchievement = Tables<'achievements'>;
type DbFriendship = Tables<'friendships'>;

export function transformPlayer(db: DbPlayer): Player {
  return {
    id: db.id,
    name: db.name,
    country: db.country,
    ranking: db.ranking,
    avatarUrl: db.avatar_url,
    position: db.position,
    birthDate: db.birth_date,
    handedness: db.handedness ?? 'right',
  };
}

export function transformTournament(db: DbTournament): Tournament {
  return {
    id: db.id,
    name: db.name,
    location: db.location,
    country: db.country,
    category: db.category,
    status: db.status ?? 'upcoming',
    startDate: db.start_date,
    endDate: db.end_date,
    drawSize: db.draw_size ?? 32,
    surface: db.surface ?? 'indoor',
    prizeMoney: db.prize_money,
    imageUrl: db.image_url,
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}

// Match rows come joined with player data
export function transformMatch(db: Record<string, unknown>): Match {
  const score = (db.score as MatchScore | null) ?? { sets: [] };
  return {
    id: db.id as string,
    tournamentId: db.tournament_id as string,
    team1Player1: transformPlayer(db.team1_p1 as DbPlayer),
    team1Player2: transformPlayer(db.team1_p2 as DbPlayer),
    team2Player1: transformPlayer(db.team2_p1 as DbPlayer),
    team2Player2: transformPlayer(db.team2_p2 as DbPlayer),
    score,
    status: (db.status as Match['status']) ?? 'upcoming',
    round: db.round as string,
    court: (db.court as string | null) ?? null,
    scheduledAt: db.scheduled_at as string,
    completedAt: (db.completed_at as string | null) ?? null,
    winnerTeam: (db.winner_team as number | null) ?? null,
    tournament: db.tournament
      ? transformTournament(db.tournament as DbTournament)
      : undefined,
  };
}

export function transformPrediction(db: DbPrediction): Prediction {
  return {
    id: db.id,
    userId: db.user_id ?? '',
    matchId: db.match_id ?? '',
    predictedWinnerTeam: db.predicted_winner_team as 1 | 2,
    predictedScore: db.predicted_score,
    pointsEarned: db.points_earned ?? 0,
    status: db.status ?? 'pending',
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}

export function transformProfile(db: DbProfile): Profile {
  return {
    id: db.id,
    username: db.username,
    displayName: db.display_name,
    avatarUrl: db.avatar_url,
    country: db.country ?? 'CH',
    isPremium: db.is_premium ?? false,
    premiumExpiresAt: db.premium_expires_at,
    totalPoints: db.total_points ?? 0,
    currentStreak: db.current_streak ?? 0,
    bestStreak: db.best_streak ?? 0,
    predictionsCount: db.predictions_count ?? 0,
    correctPredictionsCount: db.correct_predictions_count ?? 0,
    dailyPredictionsCount: db.daily_predictions_count ?? 0,
    dailyPredictionsResetAt: db.daily_predictions_reset_at ?? new Date().toISOString().split('T')[0],
    dailyChatCount: db.daily_chat_count ?? 0,
    dailyChatResetAt: db.daily_chat_reset_at ?? new Date().toISOString().split('T')[0],
    createdAt: db.created_at ?? new Date().toISOString(),
    updatedAt: db.updated_at ?? new Date().toISOString(),
  };
}

export function transformChatSession(db: DbChatSession): ChatSession {
  return {
    id: db.id,
    userId: db.user_id ?? '',
    title: db.title ?? 'Neue Unterhaltung',
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}

export function transformChatMessage(db: DbChatMessage): ChatMessage {
  return {
    id: db.id,
    sessionId: db.session_id ?? '',
    role: db.role,
    content: db.content,
    tokensUsed: db.tokens_used ?? 0,
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}

export function transformLeaderboardEntry(db: DbLeaderboardEntry): LeaderboardEntry {
  return {
    id: db.id,
    userId: db.user_id ?? '',
    period: db.period,
    periodStart: db.period_start,
    totalPoints: db.total_points ?? 0,
    rank: db.rank,
    correctPredictions: db.correct_predictions ?? 0,
    totalPredictions: db.total_predictions ?? 0,
    streak: db.streak ?? 0,
    bestStreak: db.best_streak ?? 0,
    updatedAt: db.updated_at ?? new Date().toISOString(),
  };
}

export function transformAchievement(db: DbAchievement): Achievement {
  return {
    id: db.id,
    userId: db.user_id ?? '',
    achievementType: db.achievement_type,
    earnedAt: db.earned_at ?? new Date().toISOString(),
  };
}

export function transformFriendship(db: DbFriendship): Friendship {
  return {
    id: db.id,
    userId: db.user_id ?? '',
    friendId: db.friend_id ?? '',
    status: db.status ?? 'pending',
    createdAt: db.created_at ?? new Date().toISOString(),
  };
}
