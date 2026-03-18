import Constants from "expo-constants";

// Freemium limits
export const MAX_FREE_PREDICTIONS = 3;
export const MAX_FREE_CHAT_MESSAGES = 10;
export const PREDICTION_LOCK_MINUTES = 5;

// Scoring
export const POINTS_CORRECT_WINNER = 10;
export const POINTS_CORRECT_SCORE = 5;
export const POINTS_PERFECT_PREDICTION = 20;
export const POINTS_STREAK_3 = 3;
export const POINTS_STREAK_5 = 5;
export const POINTS_TOURNAMENT_WINNER = 25;

// Supabase – set in app.json extra
export const SUPABASE_URL: string =
  Constants.expoConfig?.extra?.supabaseUrl ?? "";
export const SUPABASE_ANON_KEY: string =
  Constants.expoConfig?.extra?.supabaseAnonKey ?? "";
