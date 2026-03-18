-- ============================================================
-- PADION – Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enums
CREATE TYPE tournament_category AS ENUM ('major', 'p1', 'p2');
CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed');
CREATE TYPE prediction_status AS ENUM ('pending', 'correct', 'partial', 'wrong');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE leaderboard_period AS ENUM ('weekly', 'monthly', 'seasonal', 'alltime');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');
CREATE TYPE reward_period AS ENUM ('monthly', 'seasonal');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
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

-- ============================================================
-- TOURNAMENTS
-- ============================================================
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

-- ============================================================
-- PLAYERS
-- ============================================================
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

-- ============================================================
-- MATCHES
-- ============================================================
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

-- ============================================================
-- PREDICTIONS
-- ============================================================
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

-- ============================================================
-- LEADERBOARD
-- ============================================================
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

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status friendship_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- ============================================================
-- CHAT
-- ============================================================
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Neue Unterhaltung',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role chat_role NOT NULL,
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- ============================================================
-- REWARDS
-- ============================================================
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank_min INT NOT NULL,
    rank_max INT NOT NULL,
    period_type reward_period NOT NULL,
    prize_description TEXT NOT NULL,
    prize_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id),
    period_start DATE NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
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

-- Public read
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read rewards" ON rewards FOR SELECT USING (true);

-- User-scoped
CREATE POLICY "Users manage own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage friendships" ON friendships FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users manage own sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON chat_messages FOR ALL USING (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS (RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_user_stats(
    p_user_id UUID,
    p_points INT,
    p_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET
        total_points = total_points + p_points,
        predictions_count = predictions_count + 1,
        correct_predictions_count = CASE WHEN p_correct THEN correct_predictions_count + 1 ELSE correct_predictions_count END,
        current_streak = CASE WHEN p_correct THEN current_streak + 1 ELSE 0 END,
        best_streak = CASE WHEN p_correct AND current_streak + 1 > best_streak THEN current_streak + 1 ELSE best_streak END,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_user_streak(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET current_streak = 0, updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Padion User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED: REWARDS TABLE
-- ============================================================
INSERT INTO rewards (rank_min, rank_max, period_type, prize_description, prize_value) VALUES
(1, 1, 'monthly', '100 CHF Guthaben / Padel-Gutschein', 100.00),
(2, 2, 'monthly', '50 CHF Guthaben', 50.00),
(3, 3, 'monthly', '25 CHF Guthaben', 25.00),
(4, 10, 'monthly', '1 Monat Padion Premium gratis', 4.90),
(11, 50, 'monthly', 'Exklusive Badges / Profilrahmen', 0.00),
(1, 1, 'seasonal', '500 CHF + Premium Padel-Schläger', 500.00),
(2, 2, 'seasonal', '250 CHF + Padel-Bag', 250.00),
(3, 3, 'seasonal', '100 CHF + Padel-Zubehör', 100.00),
(4, 10, 'seasonal', 'Padel-Materialpaket', 0.00),
(11, 50, 'seasonal', 'Exklusive Badges + Premium-Monat', 4.90);
