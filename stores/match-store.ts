import { create } from 'zustand';
import { matchService } from '@/services/match-service';
import { tournamentService } from '@/services/tournament-service';
import type { Match } from '@/types/match';
import type { Tournament } from '@/types/tournament';
import { transformMatch } from '@/utils/transforms';

interface MatchStore {
  liveMatches: Match[];
  recentResults: Match[];
  upcomingMatches: Match[];
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;

  fetchLiveMatches: () => Promise<void>;
  fetchRecentResults: () => Promise<void>;
  fetchUpcomingMatches: () => Promise<void>;
  fetchTournaments: () => Promise<void>;
  refresh: () => Promise<void>;
  updateLiveMatch: (raw: Record<string, unknown>) => void;
  subscribeToLiveUpdates: () => () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  liveMatches: [],
  recentResults: [],
  upcomingMatches: [],
  tournaments: [],
  isLoading: false,
  error: null,

  fetchLiveMatches: async () => {
    try {
      const matches = await matchService.fetchLiveMatches();
      set({ liveMatches: matches });
    } catch {
      set({ error: 'Fehler beim Laden der Live-Matches' });
    }
  },

  fetchRecentResults: async () => {
    try {
      const results = await matchService.fetchRecentResults();
      set({ recentResults: results });
    } catch {
      set({ error: 'Fehler beim Laden der Resultate' });
    }
  },

  fetchUpcomingMatches: async () => {
    try {
      const matches = await matchService.fetchUpcomingMatches();
      set({ upcomingMatches: matches });
    } catch {
      set({ error: 'Fehler beim Laden der kommenden Matches' });
    }
  },

  fetchTournaments: async () => {
    try {
      const tournaments = await tournamentService.fetchTournaments();
      set({ tournaments });
    } catch {
      set({ error: 'Fehler beim Laden der Turniere' });
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null });
    await Promise.all([
      get().fetchLiveMatches(),
      get().fetchRecentResults(),
      get().fetchTournaments(),
    ]);
    set({ isLoading: false });
  },

  updateLiveMatch: (raw) => {
    set((state) => ({
      liveMatches: state.liveMatches.map((m) =>
        m.id === (raw.id as string) ? { ...m, ...transformMatch(raw) } : m,
      ),
    }));
  },

  subscribeToLiveUpdates: () => {
    return matchService.subscribeLiveUpdates((raw) => get().updateLiveMatch(raw));
  },
}));
