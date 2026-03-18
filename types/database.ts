export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["chat_role"]
          session_id: string | null
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["chat_role"]
          session_id?: string | null
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["chat_role"]
          session_id?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          status: Database["public"]["Enums"]["friendship_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          best_streak: number | null
          correct_predictions: number | null
          id: string
          period: Database["public"]["Enums"]["leaderboard_period"]
          period_start: string
          rank: number | null
          streak: number | null
          total_points: number | null
          total_predictions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          correct_predictions?: number | null
          id?: string
          period: Database["public"]["Enums"]["leaderboard_period"]
          period_start: string
          rank?: number | null
          streak?: number | null
          total_points?: number | null
          total_predictions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          correct_predictions?: number | null
          id?: string
          period?: Database["public"]["Enums"]["leaderboard_period"]
          period_start?: string
          rank?: number | null
          streak?: number | null
          total_points?: number | null
          total_predictions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          completed_at: string | null
          court: string | null
          created_at: string | null
          id: string
          round: string
          scheduled_at: string
          score: Json | null
          status: Database["public"]["Enums"]["event_status"] | null
          team1_player1: string | null
          team1_player2: string | null
          team2_player1: string | null
          team2_player2: string | null
          tournament_id: string | null
          winner_team: number | null
        }
        Insert: {
          completed_at?: string | null
          court?: string | null
          created_at?: string | null
          id?: string
          round: string
          scheduled_at: string
          score?: Json | null
          status?: Database["public"]["Enums"]["event_status"] | null
          team1_player1?: string | null
          team1_player2?: string | null
          team2_player1?: string | null
          team2_player2?: string | null
          tournament_id?: string | null
          winner_team?: number | null
        }
        Update: {
          completed_at?: string | null
          court?: string | null
          created_at?: string | null
          id?: string
          round?: string
          scheduled_at?: string
          score?: Json | null
          status?: Database["public"]["Enums"]["event_status"] | null
          team1_player1?: string | null
          team1_player2?: string | null
          team2_player1?: string | null
          team2_player2?: string | null
          tournament_id?: string | null
          winner_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team1_player1_fkey"
            columns: ["team1_player1"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_player2_fkey"
            columns: ["team1_player2"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_player1_fkey"
            columns: ["team2_player1"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_player2_fkey"
            columns: ["team2_player2"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          country: string
          created_at: string | null
          handedness: string | null
          id: string
          name: string
          position: string | null
          ranking: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          country: string
          created_at?: string | null
          handedness?: string | null
          id?: string
          name: string
          position?: string | null
          ranking?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          country?: string
          created_at?: string | null
          handedness?: string | null
          id?: string
          name?: string
          position?: string | null
          ranking?: number | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          points_earned: number | null
          predicted_score: string | null
          predicted_winner_team: number
          status: Database["public"]["Enums"]["prediction_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          points_earned?: number | null
          predicted_score?: string | null
          predicted_winner_team: number
          status?: Database["public"]["Enums"]["prediction_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          points_earned?: number | null
          predicted_score?: string | null
          predicted_winner_team?: number
          status?: Database["public"]["Enums"]["prediction_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number | null
          correct_predictions_count: number | null
          country: string | null
          created_at: string | null
          current_streak: number | null
          daily_chat_count: number | null
          daily_chat_reset_at: string | null
          daily_predictions_count: number | null
          daily_predictions_reset_at: string | null
          display_name: string
          id: string
          is_premium: boolean | null
          predictions_count: number | null
          premium_expires_at: string | null
          total_points: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number | null
          correct_predictions_count?: number | null
          country?: string | null
          created_at?: string | null
          current_streak?: number | null
          daily_chat_count?: number | null
          daily_chat_reset_at?: string | null
          daily_predictions_count?: number | null
          daily_predictions_reset_at?: string | null
          display_name: string
          id: string
          is_premium?: boolean | null
          predictions_count?: number | null
          premium_expires_at?: string | null
          total_points?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number | null
          correct_predictions_count?: number | null
          country?: string | null
          created_at?: string | null
          current_streak?: number | null
          daily_chat_count?: number | null
          daily_chat_reset_at?: string | null
          daily_predictions_count?: number | null
          daily_predictions_reset_at?: string | null
          display_name?: string
          id?: string
          is_premium?: boolean | null
          predictions_count?: number | null
          premium_expires_at?: string | null
          total_points?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string | null
          id: string
          period_type: Database["public"]["Enums"]["reward_period"]
          prize_description: string
          prize_value: number | null
          rank_max: number
          rank_min: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          period_type: Database["public"]["Enums"]["reward_period"]
          prize_description: string
          prize_value?: number | null
          rank_max: number
          rank_min: number
        }
        Update: {
          created_at?: string | null
          id?: string
          period_type?: Database["public"]["Enums"]["reward_period"]
          prize_description?: string
          prize_value?: number | null
          rank_max?: number
          rank_min?: number
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          category: Database["public"]["Enums"]["tournament_category"]
          country: string
          created_at: string | null
          draw_size: number | null
          end_date: string
          id: string
          image_url: string | null
          location: string
          name: string
          prize_money: string | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          surface: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["tournament_category"]
          country: string
          created_at?: string | null
          draw_size?: number | null
          end_date: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          prize_money?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          surface?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["tournament_category"]
          country?: string
          created_at?: string | null
          draw_size?: number | null
          end_date?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          prize_money?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          surface?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          period_start: string
          reward_id: string | null
          user_id: string | null
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          period_start: string
          reward_id?: string | null
          user_id?: string | null
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          period_start?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      chat_role: "user" | "assistant"
      event_status: "upcoming" | "live" | "completed"
      friendship_status: "pending" | "accepted" | "blocked"
      leaderboard_period: "weekly" | "monthly" | "seasonal" | "alltime"
      prediction_status: "pending" | "correct" | "partial" | "wrong"
      reward_period: "monthly" | "seasonal"
      tournament_category: "major" | "p1" | "p2"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      chat_role: ["user", "assistant"],
      event_status: ["upcoming", "live", "completed"],
      friendship_status: ["pending", "accepted", "blocked"],
      leaderboard_period: ["weekly", "monthly", "seasonal", "alltime"],
      prediction_status: ["pending", "correct", "partial", "wrong"],
      reward_period: ["monthly", "seasonal"],
      tournament_category: ["major", "p1", "p2"],
    },
  },
} as const
