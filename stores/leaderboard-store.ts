import { create } from 'zustand';
import { leaderboardService } from '@/services/leaderboard-service';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/leaderboard';

interface LeaderboardStore {
  global: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
  period: LeaderboardPeriod;
  isLoading: boolean;
  error: string | null;

  setPeriod: (period: LeaderboardPeriod) => void;
  fetchGlobal: () => Promise<void>;
  fetchFriends: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  global: [],
  friends: [],
  myRank: null,
  period: 'monthly',
  isLoading: false,
  error: null,

  setPeriod: (period) => {
    set({ period });
    get().refresh();
  },

  fetchGlobal: async () => {
    try {
      const period = get().period;
      const [global, myRank] = await Promise.all([
        leaderboardService.fetchGlobal(period),
        leaderboardService.getMyRank(period),
      ]);
      set({ global, myRank });
    } catch {
      set({ error: 'Rangliste konnte nicht geladen werden' });
    }
  },

  fetchFriends: async () => {
    try {
      const friends = await leaderboardService.fetchFriends(get().period);
      set({ friends });
    } catch {
      set({ error: 'Freunde-Rangliste konnte nicht geladen werden' });
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null });
    await Promise.all([get().fetchGlobal(), get().fetchFriends()]);
    set({ isLoading: false });
  },
}));
