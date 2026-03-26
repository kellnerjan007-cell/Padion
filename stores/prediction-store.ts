"use client";

import { create } from "zustand";
import type { Match, Prediction } from "@/types";
import {
  fetchUpcomingMatches,
  fetchMyPredictions,
  createPrediction,
  getDailyPredictionCount,
} from "@/services/prediction-service";

interface PredictionState {
  upcomingMatches: Match[];
  myPredictions: Prediction[];
  dailyCount: number;
  isLoading: boolean;
  error: string | null;
  fetch: (userId: string) => Promise<void>;
  submitPrediction: (
    userId: string,
    matchId: string,
    team: 1 | 2,
    score?: string
  ) => Promise<void>;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  upcomingMatches: [],
  myPredictions: [],
  dailyCount: 0,
  isLoading: false,
  error: null,
  fetch: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [upcomingMatches, myPredictions, dailyCount] = await Promise.all([
        fetchUpcomingMatches(),
        fetchMyPredictions(userId),
        getDailyPredictionCount(userId),
      ]);
      set({ upcomingMatches, myPredictions, dailyCount, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },
  submitPrediction: async (userId, matchId, team, score) => {
    const prediction = await createPrediction(userId, matchId, team, score);
    set({
      myPredictions: [prediction, ...get().myPredictions],
      dailyCount: get().dailyCount + 1,
    });
  },
}));
