import { supabase } from './supabase';
import type { Prediction, CreatePredictionInput } from '@/types/prediction';
import { transformPrediction } from '@/utils/transforms';

export const predictionService = {
  createPrediction: async (input: CreatePredictionInput): Promise<Prediction> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht eingeloggt');

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        match_id: input.matchId,
        predicted_winner_team: input.predictedWinnerTeam,
        predicted_score: input.predictedScore ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return transformPrediction(data);
  },

  fetchMyPredictions: async (): Promise<Prediction[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(transformPrediction);
  },

  fetchPredictionForMatch: async (matchId: string): Promise<Prediction | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .maybeSingle();

    if (error) throw error;
    return data ? transformPrediction(data) : null;
  },

  getDailyCount: async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('profiles')
      .select('daily_predictions_count, daily_predictions_reset_at')
      .eq('id', user.id)
      .single();

    if (error) return 0;

    // Reset if new day
    if (data.daily_predictions_reset_at !== today) {
      await supabase
        .from('profiles')
        .update({ daily_predictions_count: 0, daily_predictions_reset_at: today })
        .eq('id', user.id);
      return 0;
    }

    return data.daily_predictions_count ?? 0;
  },

  incrementDailyCount: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('increment_daily_predictions', { p_user_id: user.id });
  },
};
