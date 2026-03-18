# Padion – Architecture Document

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                 iOS App (React Native / Expo)                │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────┐ │
│  │   Home   │ │ Predict  │ │Rangliste │ │AI Coach│ │Profil│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └──┬──┘ │
│       │            │            │            │         │     │
│  ┌────┴────────────┴────────────┴────────────┴─────────┴──┐ │
│  │           Zustand Stores (State Management)             │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                 │
│  ┌────────────────────────┴───────────────────────────────┐ │
│  │                   Service Layer                         │ │
│  │  authService │ matchService │ predictionService │ ...   │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                 │
│  ┌────────────────────────┴───────────────────────────────┐ │
│  │              @supabase/supabase-js SDK                  │ │
│  │         (REST API + Realtime WebSocket)                 │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTPS / WSS
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    Supabase Backend                            │
│                                                               │
│  ┌──────────┐  ┌───────────────┐  ┌────────────────────────┐ │
│  │   Auth   │  │  PostgreSQL   │  │   Realtime Engine      │ │
│  │(Apple ID,│  │  (alle        │  │   (WebSocket für       │ │
│  │ Email)   │  │   Tabellen)   │  │    Live-Scores)        │ │
│  └──────────┘  └───────────────┘  └────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Edge Functions (Deno)                   │ │
│  │                                                           │ │
│  │  evaluate-predictions │ update-leaderboard │ ai-chat      │ │
│  │  sync-match-data      │ send-push          │ check-achiev │ │
│  │  distribute-rewards                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────┐  ┌───────────────┐                             │
│  │ Storage  │  │  Row Level    │                             │
│  │(Avatars) │  │  Security     │                             │
│  └──────────┘  └───────────────┘                             │
└───────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
     ┌──────────────┐ ┌─────────┐ ┌────────────┐
     │ Claude API   │ │  APNs   │ │ FIP Data   │
     │ (AI Coach)   │ │ (Push)  │ │ (Scores)   │
     └──────────────┘ └─────────┘ └────────────┘
```

---

## Layer Architecture

### Layer 1: Screens (Expo Router)

Screens in the `app/` directory. They compose components and connect to stores.

```tsx
// app/(tabs)/index.tsx – Home Screen
import { useState } from 'react';
import { View, FlatList } from 'react-native';
import { useMatchStore } from '@/stores/match-store';
import { MatchCard } from '@/components/match-card';
import { SegmentedControl } from '@/components/segmented-control';
import { SkeletonLoader } from '@/components/skeleton-loader';

type HomeTab = 'live' | 'results' | 'season';

export default function HomeScreen() {
  const [tab, setTab] = useState<HomeTab>('live');
  const { liveMatches, recentResults, isLoading, refresh } = useMatchStore();

  const data = tab === 'live' ? liveMatches : recentResults;

  return (
    <View className="flex-1 bg-background">
      <SegmentedControl
        tabs={['Live', 'Resultate', 'Saison']}
        selected={tab}
        onSelect={setTab}
      />
      {isLoading ? (
        <SkeletonLoader count={5} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchCard match={item} />}
          onRefresh={refresh}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}
```

**Rules:**
- Screens only read from stores and render components.
- No direct Supabase calls in screens.
- Use `.task` equivalent: `useEffect` with store actions for initial data loading.
- Keep screens thin – delegate logic to stores and services.

### Layer 2: Components

Reusable UI components in `components/` directory. Pure presentation.

```tsx
// components/match-card.tsx
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LiveIndicator } from './live-indicator';
import { CountryFlag } from './country-flag';
import type { Match } from '@/types/match';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Pressable
      className="bg-surface rounded-2xl p-4 mb-3 mx-4"
      onPress={() => router.push(`/match/${match.id}`)}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-primary font-semibold">
            {match.team1Player1.name} / {match.team1Player2.name}
          </Text>
          <Text className="text-primary font-semibold mt-2">
            {match.team2Player1.name} / {match.team2Player2.name}
          </Text>
        </View>
        <View className="items-end">
          {match.status === 'live' && <LiveIndicator />}
          <Text className="text-primary text-lg font-bold">
            {formatScore(match.score)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
```

**Rules:**
- Components receive data via props, never access stores directly (exception: small utility hooks).
- All components must have typed props interface.
- Use NativeWind classes for all styling.
- Use `Pressable` (not `TouchableOpacity`) for tap targets.
- Use `expo-image` for all images.

### Layer 3: Stores (Zustand)

State management with one store per domain.

```tsx
// stores/match-store.ts
import { create } from 'zustand';
import { matchService } from '@/services/match-service';
import type { Match, Tournament } from '@/types/match';

interface MatchStore {
  liveMatches: Match[];
  recentResults: Match[];
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  
  fetchLiveMatches: () => Promise<void>;
  fetchRecentResults: () => Promise<void>;
  fetchTournaments: () => Promise<void>;
  refresh: () => Promise<void>;
  subscribeToLiveUpdates: () => () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  liveMatches: [],
  recentResults: [],
  tournaments: [],
  isLoading: false,
  error: null,

  fetchLiveMatches: async () => {
    try {
      const matches = await matchService.fetchLiveMatches();
      set({ liveMatches: matches });
    } catch (error) {
      set({ error: 'Fehler beim Laden der Live-Matches' });
    }
  },

  fetchRecentResults: async () => {
    try {
      const results = await matchService.fetchRecentResults();
      set({ recentResults: results });
    } catch (error) {
      set({ error: 'Fehler beim Laden der Resultate' });
    }
  },

  fetchTournaments: async () => {
    try {
      const tournaments = await matchService.fetchTournaments();
      set({ tournaments });
    } catch (error) {
      set({ error: 'Fehler beim Laden der Turniere' });
    }
  },

  refresh: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchLiveMatches(),
      get().fetchRecentResults(),
      get().fetchTournaments(),
    ]);
    set({ isLoading: false });
  },

  subscribeToLiveUpdates: () => {
    const channel = supabase
      .channel('live-matches')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: 'status=eq.live',
      }, (payload) => {
        // Update match in liveMatches array
        set((state) => ({
          liveMatches: state.liveMatches.map((m) =>
            m.id === payload.new.id ? { ...m, ...transformMatch(payload.new) } : m
          ),
        }));
      })
      .subscribe();

    // Return unsubscribe function
    return () => { supabase.removeChannel(channel); };
  },
}));
```

**Rules:**
- One store per domain.
- Stores call services, never Supabase directly.
- Use selectors in components: `useMatchStore(s => s.liveMatches)`.
- Return unsubscribe functions from Realtime subscriptions.
- Handle errors in stores, expose error state to UI.

### Layer 4: Services

Data access layer. All Supabase communication happens here.

```tsx
// services/match-service.ts
import { supabase } from './supabase';
import type { Match, Tournament } from '@/types/match';
import { transformMatch, transformTournament } from '@/utils/transforms';

export const matchService = {
  fetchLiveMatches: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        tournament:tournaments(*),
        team1_p1:players!team1_player1(*),
        team1_p2:players!team1_player2(*),
        team2_p1:players!team2_player1(*),
        team2_p2:players!team2_player2(*)
      `)
      .eq('status', 'live')
      .order('scheduled_at');

    if (error) throw error;
    return (data || []).map(transformMatch);
  },

  fetchRecentResults: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, tournament:tournaments(name, category)')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []).map(transformMatch);
  },

  fetchMatchById: async (id: string): Promise<Match> => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        tournament:tournaments(*),
        team1_p1:players!team1_player1(*),
        team1_p2:players!team1_player2(*),
        team2_p1:players!team2_player1(*),
        team2_p2:players!team2_player2(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformMatch(data);
  },
};
```

**Rules:**
- Services are plain objects with async functions (not classes).
- Services only talk to Supabase.
- Services return transformed TypeScript types (camelCase).
- Transform snake_case → camelCase in service layer via transform functions.
- All functions are `async` and throw errors (caught in stores).

### Layer 5: Types

TypeScript type definitions matching the database schema.

```tsx
// types/match.ts
export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type TournamentCategory = 'major' | 'p1' | 'p2';
export type TournamentStatus = 'upcoming' | 'live' | 'completed';

export interface SetScore {
  team1: number;
  team2: number;
}

export interface MatchScore {
  sets: SetScore[];
}

export interface Player {
  id: string;
  name: string;
  country: string;
  ranking: number | null;
  avatarUrl: string | null;
  position: string | null;
}

export interface Match {
  id: string;
  tournamentId: string;
  team1Player1: Player;
  team1Player2: Player;
  team2Player1: Player;
  team2Player2: Player;
  score: MatchScore;
  status: MatchStatus;
  round: string;
  court: string | null;
  scheduledAt: string;
  completedAt: string | null;
  winnerTeam: number | null;
  tournament?: Tournament;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  country: string;
  category: TournamentCategory;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  drawSize: number;
  prizeMoney: string | null;
  imageUrl: string | null;
}

// types/prediction.ts
export type PredictionStatus = 'pending' | 'correct' | 'partial' | 'wrong';

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedWinnerTeam: 1 | 2;
  predictedScore: string | null;
  pointsEarned: number;
  status: PredictionStatus;
  createdAt: string;
  match?: Match;
}

// types/profile.ts
export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  country: string;
  isPremium: boolean;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  predictionsCount: number;
  correctPredictionsCount: number;
  dailyPredictionsCount: number;
  dailyChatCount: number;
  createdAt: string;
}

// types/chat.ts
export type ChatRole = 'user' | 'assistant';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

// types/leaderboard.ts
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'seasonal' | 'alltime';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  period: LeaderboardPeriod;
  totalPoints: number;
  rank: number;
  correctPredictions: number;
  totalPredictions: number;
  streak: number;
  profile?: Profile;
}
```

---

## Database Schema (Supabase PostgreSQL)

### Entity Relationship

```
profiles (1) ──── (n) predictions
profiles (1) ──── (n) leaderboard_entries
profiles (1) ──── (n) chat_sessions (1) ──── (n) chat_messages
profiles (1) ──── (n) achievements
profiles (1) ──── (n) user_rewards
profiles (n) ──── (n) profiles  [via friendships]

tournaments (1) ──── (n) matches
players (n) ──── (n) matches  [team1_player1/2, team2_player1/2]
matches (1) ──── (n) predictions

rewards (1) ──── (n) user_rewards
```

### Full SQL Schema

```sql
-- Enums
CREATE TYPE tournament_category AS ENUM ('major', 'p1', 'p2');
CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed');
CREATE TYPE prediction_status AS ENUM ('pending', 'correct', 'partial', 'wrong');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE leaderboard_period AS ENUM ('weekly', 'monthly', 'seasonal', 'alltime');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');
CREATE TYPE reward_period AS ENUM ('monthly', 'seasonal');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    country TEXT DEFAULT 'CH',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMPTZ,
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    predictions_count INT DEFAULT 0,
    correct_predictions_count INT DEFAULT 0,
    daily_predictions_count INT DEFAULT 0,
    daily_predictions_reset_at DATE DEFAULT CURRENT_DATE,
    daily_chat_count INT DEFAULT 0,
    daily_chat_reset_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    category tournament_category NOT NULL,
    status event_status DEFAULT 'upcoming',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    draw_size INT DEFAULT 32,
    surface TEXT DEFAULT 'indoor',
    prize_money TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    ranking INT,
    avatar_url TEXT,
    birth_date DATE,
    handedness TEXT DEFAULT 'right',
    position TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team1_player1 UUID REFERENCES players(id),
    team1_player2 UUID REFERENCES players(id),
    team2_player1 UUID REFERENCES players(id),
    team2_player2 UUID REFERENCES players(id),
    score JSONB DEFAULT '{"sets": []}',
    status event_status DEFAULT 'upcoming',
    round TEXT NOT NULL,
    court TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    winner_team INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    predicted_winner_team INT NOT NULL CHECK (predicted_winner_team IN (1, 2)),
    predicted_score TEXT,
    points_earned INT DEFAULT 0,
    status prediction_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Leaderboard
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    period leaderboard_period NOT NULL,
    period_start DATE NOT NULL,
    total_points INT DEFAULT 0,
    rank INT,
    correct_predictions INT DEFAULT 0,
    total_predictions INT DEFAULT 0,
    streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period, period_start)
);

-- Friendships
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status friendship_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Neue Unterhaltung',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role chat_role NOT NULL,
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- Rewards
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank_min INT NOT NULL,
    rank_max INT NOT NULL,
    period_type reward_period NOT NULL,
    prize_description TEXT NOT NULL,
    prize_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Rewards
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id),
    period_start DATE NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_leaderboard_period ON leaderboard_entries(period, period_start);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read rewards" ON rewards FOR SELECT USING (true);

-- User-scoped policies
CREATE POLICY "Users manage own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage friendships" ON friendships FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users manage own sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON chat_messages FOR ALL USING (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Edge Functions Architecture

### evaluate-predictions

**Trigger:** Called when a match status changes to `completed`.
**Logic:**
1. Fetch all predictions for the completed match.
2. Compare `predicted_winner_team` with `matches.winner_team`.
3. Compare `predicted_score` with actual set score.
4. Calculate points: +10 correct winner, +5 correct score, streak bonuses.
5. Update `predictions.points_earned` and `predictions.status`.
6. Update `profiles.total_points`, `profiles.current_streak`.
7. Call `update-leaderboard` and `check-achievements`.

```typescript
// supabase/functions/evaluate-predictions/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { match_id } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Get match data
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', match_id)
    .single();

  if (!match || match.status !== 'completed') {
    return new Response('Match not completed', { status: 400 });
  }

  // 2. Get all predictions for this match
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', match_id)
    .eq('status', 'pending');

  // 3. Evaluate each prediction
  for (const pred of predictions || []) {
    let points = 0;
    let status: string = 'wrong';

    const winnerCorrect = pred.predicted_winner_team === match.winner_team;
    
    if (winnerCorrect) {
      points += 10;
      status = 'correct';

      // Check score prediction
      if (pred.predicted_score) {
        const actualSets = match.score.sets;
        const [predT1, predT2] = pred.predicted_score.split(':').map(Number);
        const actualT1 = actualSets.filter(s => s.team1 > s.team2).length;
        const actualT2 = actualSets.filter(s => s.team2 > s.team1).length;
        
        if (predT1 === actualT1 && predT2 === actualT2) {
          points += 5; // Exact score bonus
        } else {
          status = 'partial'; // Winner right, score wrong
        }
      }
    }

    // Update prediction
    await supabase
      .from('predictions')
      .update({ points_earned: points, status })
      .eq('id', pred.id);

    // Update user profile
    if (winnerCorrect) {
      await supabase.rpc('increment_user_stats', {
        p_user_id: pred.user_id,
        p_points: points,
        p_correct: true,
      });
    } else {
      await supabase.rpc('reset_user_streak', {
        p_user_id: pred.user_id,
      });
    }
  }

  return new Response(JSON.stringify({ evaluated: predictions?.length }));
});
```

### ai-chat

**Endpoint:** POST `/functions/v1/ai-chat`
**Auth:** Requires valid JWT.

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `Du bist der Padion AI Coach – ein Padel-Experte mit umfassendem Wissen über:
- Alle Premier Padel Tour Spieler, ihre Spielstile, Stärken und Schwächen
- Offizielle Padel-Regeln (FIP-Reglement)
- Padel-Technik: Bandeja, Víbora, Bajada, Chiquita, Globo, Smash, etc.
- Taktik und Strategie für alle Spielsituationen
- Aktuelle Turnier-Ergebnisse und Ranglisten

Antworte auf Deutsch oder in der Sprache des Users. Sei freundlich, kompetent
und enthusiastisch über Padel. Gib konkrete, umsetzbare Tipps.
Wenn du aktuelle Match-Daten im Kontext hast, nutze sie für deine Analysen.`;

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Auth check
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user } } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { session_id, message } = await req.json();

  // Rate limit check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, daily_chat_count, daily_chat_reset_at')
    .eq('id', user.id)
    .single();

  const today = new Date().toISOString().split('T')[0];
  let chatCount = profile.daily_chat_count;
  if (profile.daily_chat_reset_at !== today) {
    chatCount = 0;
    await supabase
      .from('profiles')
      .update({ daily_chat_count: 0, daily_chat_reset_at: today })
      .eq('id', user.id);
  }

  if (!profile.is_premium && chatCount >= 10) {
    return new Response(JSON.stringify({ error: 'Daily limit reached' }), { status: 429 });
  }

  // Get chat history
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', session_id)
    .order('created_at')
    .limit(20);

  // Get current match context
  const { data: liveMatches } = await supabase
    .from('matches')
    .select('*, team1_p1:players!team1_player1(name), team2_p1:players!team2_player1(name)')
    .in('status', ['live', 'upcoming'])
    .limit(10);

  const context = liveMatches?.length
    ? `\n\nAktuelle Matches:\n${liveMatches.map(m =>
        `${m.team1_p1.name} vs ${m.team2_p1.name} (${m.status})`
      ).join('\n')}`
    : '';

  // Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + context,
      messages: [
        ...(history || []).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ],
    }),
  });

  const aiResponse = await response.json();
  const assistantMessage = aiResponse.content[0].text;

  // Store messages
  await supabase.from('chat_messages').insert([
    { session_id, role: 'user', content: message },
    { session_id, role: 'assistant', content: assistantMessage },
  ]);

  // Increment chat count
  await supabase
    .from('profiles')
    .update({ daily_chat_count: chatCount + 1 })
    .eq('id', user.id);

  return new Response(JSON.stringify({ message: assistantMessage }));
});
```

---

## Realtime Architecture

```
Client (React Native)               Supabase Realtime
       │                                    │
       ├──► Subscribe to channel ──────────►│
       │    "matches:status=eq.live"        │
       │                                    │
       │◄── Score update broadcast ◄────────│◄── Edge Function updates match
       │                                    │
       │    Zustand store updates           │
       │    → Component re-renders          │
```

Custom hook for Realtime subscriptions:

```tsx
// hooks/use-realtime-matches.ts
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useMatchStore } from '@/stores/match-store';

export function useRealtimeMatches() {
  const updateMatch = useMatchStore(s => s.updateLiveMatch);

  useEffect(() => {
    const channel = supabase
      .channel('live-scores')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: 'status=eq.live',
      }, (payload) => {
        updateMatch(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
```

---

## Auth Flow

```
User opens app
       │
       ├── Has valid session? ──► Yes ──► Tab Navigator (Home)
       │   (check AsyncStorage)
       │
       └── No ──► Onboarding (3 swipeable screens)
                       │
                       ├── Apple Sign-In (primary)
                       │      │
                       │      └── Supabase Auth creates user
                       │             │
                       │             └── DB trigger: handle_new_user() creates profile
                       │                    │
                       │                    └── Username picker screen
                       │                           │
                       │                           └── Tab Navigator (Home)
                       │
                       └── Email + Password (secondary)
                              │
                              └── Same flow as above
```

Expo Router auth guard in root layout:

```tsx
// app/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const session = useAuthStore(s => s.session);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) return <SplashScreen />;
  if (!session) return <Redirect href="/(auth)/onboarding" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

---

## Caching Strategy

- **Tournaments list:** Cache in Zustand (persisted to AsyncStorage), refresh on app launch + pull-to-refresh.
- **Match scores:** No cache for live matches (always realtime). Cache completed results in Zustand.
- **Leaderboard:** Cache for 5 minutes in store, refresh on tab focus.
- **Player data:** Cache aggressively in AsyncStorage (rarely changes). Refresh daily.
- **Chat history:** Load from Supabase on session open. No local cache.
- **Profile:** Cache in Zustand (persisted), sync on changes.
- **Images:** Handled automatically by `expo-image` with memory + disk cache.

---

## Build & Deployment (EAS)

### eas.json Configuration

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "ios": { "buildConfiguration": "Release" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "jan@padion.app", "ascAppId": "YOUR_APP_ID" }
    }
  }
}
```

### Build Commands

```bash
# Development build (for Expo Dev Client)
eas build --platform ios --profile development

# Preview build (TestFlight)
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# OTA Update (JS bundle only, no native changes)
eas update --branch production --message "Bug fix v1.0.1"
```

All builds happen in the cloud – no Mac required.
