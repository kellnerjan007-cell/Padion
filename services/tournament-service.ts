import { supabase } from './supabase';
import type { Tournament } from '@/types/tournament';
import { transformTournament } from '@/utils/transforms';

export const tournamentService = {
  fetchTournaments: async (): Promise<Tournament[]> => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(transformTournament);
  },

  fetchTournamentById: async (id: string): Promise<Tournament> => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformTournament(data);
  },
};
