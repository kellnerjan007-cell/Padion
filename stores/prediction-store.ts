import { create } from 'zustand';
import { predictionService } from '@/services/prediction-service';
import { matchService } from '@/services/match-service';
import type { Match } from '@/types/match';
import type { Prediction, CreatePredictionInput } from '@/types/prediction';
import { MAX_FREE_PREDICTIONS } from '@/utils/constants';

interface PredictionStore {
  upcomingMatches: Match[];
  myPredictions: Prediction[];
  predictedMatchIds: Set<string>;
  dailyCount: number;
  isLoading: boolean;
  error: string | null;

  fetchUpcoming: () => Promise<void>;
  fetchMyPredictions: () => Promise<void>;
  fetchDailyCount: () => Promise<void>;
  refresh: () => Promise<void>;
  createPrediction: (input: CreatePredictionInput) => Promise<void>;
  isAtDailyLimit: (isPremium: boolean) => boolean;
  hasPredicted: (matchId: string) => boolean;
}

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  upcomingMatches: [],
  myPredictions: [],
  predictedMatchIds: new Set(),
  dailyCount: 0,
  isLoading: false,
  error: null,

  fetchUpcoming: async () => {
    try {
      const matches = await matchService.fetchUpcomingMatches();
      set({ upcomingMatches: matches });
    } catch {
      set({ error: 'Fehler beim Laden der Matches' });
    }
  },

  fetchMyPredictions: async () => {
    try {
      const predictions = await predictionService.fetchMyPredictions();
      const ids = new Set(predictions.map((p) => p.matchId));
      set({ myPredictions: predictions, predictedMatchIds: ids });
    } catch {
      set({ error: 'Fehler beim Laden der Predictions' });
    }
  },

  fetchDailyCount: async () => {
    try {
      const count = await predictionService.getDailyCount();
      set({ dailyCount: count });
    } catch {
      // silent
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null });
    await Promise.all([
      get().fetchUpcoming(),
      get().fetchMyPredictions(),
      get().fetchDailyCount(),
    ]);
    set({ isLoading: false });
  },

  createPrediction: async (input) => {
    try {
      const prediction = await predictionService.createPrediction(input);
      await predictionService.incrementDailyCount();
      set((state) => ({
        myPredictions: [prediction, ...state.myPredictions],
        predictedMatchIds: new Set([...state.predictedMatchIds, input.matchId]),
        dailyCount: state.dailyCount + 1,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Prediction fehlgeschlagen';
      set({ error: msg });
      throw e;
    }
  },

  isAtDailyLimit: (isPremium) => {
    if (isPremium) return false;
    return get().dailyCount >= MAX_FREE_PREDICTIONS;
  },

  hasPredicted: (matchId) => get().predictedMatchIds.has(matchId),
}));
