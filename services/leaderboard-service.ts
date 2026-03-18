import { supabase } from './supabase';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/leaderboard';
import { transformLeaderboardEntry, transformProfile } from '@/utils/transforms';

function periodStart(period: LeaderboardPeriod): string {
  const now = new Date();
  if (period === 'weekly') {
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay());
    return d.toISOString().split('T')[0];
  }
  if (period === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }
  if (period === 'seasonal') {
    return `${now.getFullYear()}-01-01`;
  }
  return '2025-01-01'; // alltime
}

export const leaderboardService = {
  fetchGlobal: async (period: LeaderboardPeriod, limit = 100): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*, profile:profiles(*)')
      .eq('period', period)
      .eq('period_start', periodStart(period))
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...transformLeaderboardEntry(row),
      profile: row.profile ? transformProfile(row.profile) : undefined,
    }));
  },

  fetchFriends: async (period: LeaderboardPeriod): Promise<LeaderboardEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get friend IDs
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    const friendIds = (friendships ?? []).map((f) => f.friend_id);
    const ids = [user.id, ...friendIds];

    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*, profile:profiles(*)')
      .eq('period', period)
      .eq('period_start', periodStart(period))
      .in('user_id', ids)
      .order('total_points', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row, i) => ({
      ...transformLeaderboardEntry(row),
      rank: i + 1,
      profile: row.profile ? transformProfile(row.profile) : undefined,
    }));
  },

  getMyRank: async (period: LeaderboardPeriod): Promise<LeaderboardEntry | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*, profile:profiles(*)')
      .eq('user_id', user.id)
      .eq('period', period)
      .eq('period_start', periodStart(period))
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...transformLeaderboardEntry(data),
      profile: data.profile ? transformProfile(data.profile) : undefined,
    };
  },
};
