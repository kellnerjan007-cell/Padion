import { supabase } from './supabase';
import type { Match } from '@/types/match';
import { transformMatch } from '@/utils/transforms';

const MATCH_SELECT = `
  *,
  tournament:tournaments(*),
  team1_p1:players!team1_player1(*),
  team1_p2:players!team1_player2(*),
  team2_p1:players!team2_player1(*),
  team2_p2:players!team2_player2(*)
`;

export const matchService = {
  fetchLiveMatches: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('status', 'live')
      .order('scheduled_at');

    if (error) throw error;
    return (data ?? []).map(transformMatch);
  },

  fetchRecentResults: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return (data ?? []).map(transformMatch);
  },

  fetchUpcomingMatches: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('status', 'upcoming')
      .order('scheduled_at')
      .limit(30);

    if (error) throw error;
    return (data ?? []).map(transformMatch);
  },

  fetchMatchesByTournament: async (tournamentId: string): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('tournament_id', tournamentId)
      .order('scheduled_at');

    if (error) throw error;
    return (data ?? []).map(transformMatch);
  },

  fetchMatchById: async (id: string): Promise<Match> => {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformMatch(data);
  },
};
