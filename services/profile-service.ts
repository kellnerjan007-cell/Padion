import { supabase } from './supabase';
import type { Achievement } from '@/types/achievement';
import { transformAchievement } from '@/utils/transforms';

interface UserReward {
  id: string;
  prizeDescription: string;
  periodStart: string;
  claimed: boolean;
}

export const profileService = {
  fetchAchievements: async (userId: string): Promise<Achievement[]> => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data ?? []).map(transformAchievement);
  },

  fetchRewards: async (userId: string): Promise<UserReward[]> => {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('id, period_start, claimed, reward:rewards(prize_description)')
      .eq('user_id', userId)
      .order('period_start', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      prizeDescription: (r.reward as Record<string, string>)?.prize_description ?? '',
      periodStart: r.period_start as string,
      claimed: r.claimed as boolean,
    }));
  },
};
