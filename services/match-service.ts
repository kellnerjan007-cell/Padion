import { createClient } from "@/lib/supabase/client";
import type { Match, Tournament } from "@/types";

const supabase = createClient();

function mapPlayer(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    country: row.country as string,
    ranking: row.ranking as number | null,
    avatarUrl: row.avatar_url as string | null,
  };
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    tournamentName: (row.tournaments as Record<string, unknown> | null)?.name as string | undefined,
    team1Player1: mapPlayer(row.team1_player1_data as Record<string, unknown>),
    team1Player2: mapPlayer(row.team1_player2_data as Record<string, unknown>),
    team2Player1: mapPlayer(row.team2_player1_data as Record<string, unknown>),
    team2Player2: mapPlayer(row.team2_player2_data as Record<string, unknown>),
    score: row.score as Match["score"],
    status: row.status as Match["status"],
    round: row.round as string | null,
    scheduledAt: row.scheduled_at as string | null,
    completedAt: row.completed_at as string | null,
  };
}

export async function fetchLiveMatches(): Promise<Match[]> {
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
    .eq("status", "live")
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapMatch);
}

export async function fetchRecentResults(): Promise<Match[]> {
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
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return (data ?? []).map(mapMatch);
}

export async function fetchTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    location: row.location as string,
    country: row.country as string | null,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    category: row.category as Tournament["category"],
    status: row.status as Tournament["status"],
  }));
}

export async function fetchMatchById(id: string): Promise<Match | null> {
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
    .eq("id", id)
    .single();

  if (error) return null;
  return mapMatch(data);
}
