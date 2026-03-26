import { createClient } from "@/lib/supabase/client";
import type { Match, Prediction } from "@/types";

const supabase = createClient();

function mapPrediction(row: Record<string, unknown>): Prediction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    matchId: row.match_id as string,
    predictedWinnerTeam: row.predicted_winner_team as 1 | 2,
    predictedScore: row.predicted_score as string | null,
    pointsEarned: row.points_earned as number,
    status: row.status as Prediction["status"],
    createdAt: row.created_at as string,
  };
}

export async function fetchUpcomingMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      tournaments(name),
      team1_player1_data:players!team1_player1(id, name, country, ranking, avatar_url),
      team1_player2_data:players!team1_player2(id, name, country, ranking, avatar_url),
      team2_player1_data:players!team2_player1(id, name, country, ranking, avatar_url),
      team2_player2_data:players!team2_player2(id, name, country, ranking, avatar_url)
    `)
    .eq("status", "upcoming")
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    tournamentName: (row.tournaments as Record<string, unknown> | null)?.name as string | undefined,
    team1Player1: { id: (row.team1_player1_data as Record<string, unknown>).id as string, name: (row.team1_player1_data as Record<string, unknown>).name as string, country: (row.team1_player1_data as Record<string, unknown>).country as string, ranking: (row.team1_player1_data as Record<string, unknown>).ranking as number | null, avatarUrl: (row.team1_player1_data as Record<string, unknown>).avatar_url as string | null },
    team1Player2: { id: (row.team1_player2_data as Record<string, unknown>).id as string, name: (row.team1_player2_data as Record<string, unknown>).name as string, country: (row.team1_player2_data as Record<string, unknown>).country as string, ranking: (row.team1_player2_data as Record<string, unknown>).ranking as number | null, avatarUrl: (row.team1_player2_data as Record<string, unknown>).avatar_url as string | null },
    team2Player1: { id: (row.team2_player1_data as Record<string, unknown>).id as string, name: (row.team2_player1_data as Record<string, unknown>).name as string, country: (row.team2_player1_data as Record<string, unknown>).country as string, ranking: (row.team2_player1_data as Record<string, unknown>).ranking as number | null, avatarUrl: (row.team2_player1_data as Record<string, unknown>).avatar_url as string | null },
    team2Player2: { id: (row.team2_player2_data as Record<string, unknown>).id as string, name: (row.team2_player2_data as Record<string, unknown>).name as string, country: (row.team2_player2_data as Record<string, unknown>).country as string, ranking: (row.team2_player2_data as Record<string, unknown>).ranking as number | null, avatarUrl: (row.team2_player2_data as Record<string, unknown>).avatar_url as string | null },
    score: row.score as Match["score"],
    status: row.status as Match["status"],
    round: row.round as string | null,
    scheduledAt: row.scheduled_at as string | null,
    completedAt: row.completed_at as string | null,
  }));
}

export async function fetchMyPredictions(userId: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPrediction);
}

export async function createPrediction(
  userId: string,
  matchId: string,
  predictedWinnerTeam: 1 | 2,
  predictedScore?: string
): Promise<Prediction> {
  const { data, error } = await supabase
    .from("predictions")
    .insert({
      user_id: userId,
      match_id: matchId,
      predicted_winner_team: predictedWinnerTeam,
      predicted_score: predictedScore ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPrediction(data);
}

export async function getDailyPredictionCount(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("predictions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());

  if (error) throw error;
  return count ?? 0;
}
