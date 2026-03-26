"use client";

import { create } from "zustand";
import type { Match, Tournament } from "@/types";
import { fetchLiveMatches, fetchRecentResults, fetchTournaments } from "@/services/match-service";

interface MatchState {
  liveMatches: Match[];
  recentResults: Match[];
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set) => ({
  liveMatches: [],
  recentResults: [],
  tournaments: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const [liveMatches, recentResults, tournaments] = await Promise.all([
        fetchLiveMatches(),
        fetchRecentResults(),
        fetchTournaments(),
      ]);
      set({ liveMatches, recentResults, tournaments, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },
}));
