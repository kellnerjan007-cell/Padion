# Padion – Development Plan for Claude Code

## How to Use This Plan

This plan is broken into 4 phases with specific tasks. Work through tasks in order within each phase. Each task has acceptance criteria – complete all criteria before moving to the next task.

Check off tasks as you complete them: change `[ ]` to `[x]`.

**Important:** This project uses React Native + Expo. No Mac is required – all iOS builds happen via EAS Build in the cloud.

---

## Phase 1 – Foundation & MVP (Weeks 1–4)

### 1.1 Project Setup

- [ ] **Create Expo project:** `npx create-expo-app padion --template blank-typescript`
- [ ] **Install core dependencies:**
  ```bash
  npx expo install expo-router expo-constants expo-secure-store expo-haptics expo-image expo-notifications @expo/vector-icons react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated @gorhom/bottom-sheet
  ```
- [ ] **Install additional dependencies:**
  ```bash
  npm install @supabase/supabase-js zustand nativewind tailwindcss react-native-purchases
  ```
- [ ] **Configure NativeWind v4:** Create `tailwind.config.js` with custom color palette (Background #0D0D1A, Surface #1A1A2E, Accent #E94560, Secondary #0F3460, Success #00C853, Warning #FFB300)
- [ ] **Configure Expo Router:** Set up `app/` directory with file-based routing, set `scheme` in `app.json`
- [ ] **Create folder structure** as defined in `rules.md`:
  ```
  app/ components/ stores/ services/ types/ hooks/ utils/ assets/ supabase/
  ```
- [ ] **Create `utils/constants.ts`:** MAX_FREE_PREDICTIONS = 3, MAX_FREE_CHAT_MESSAGES = 10, PREDICTION_LOCK_MINUTES = 5, SUPABASE_URL, SUPABASE_ANON_KEY
- [ ] **Create `services/supabase.ts`:** Initialize Supabase client with URL + anon key from constants
- [ ] **Configure EAS:** Run `eas init`, create `eas.json` with development/preview/production profiles
- [ ] **Set up TypeScript strict mode** in `tsconfig.json`

**Acceptance:** Project runs in Expo Go on phone or simulator, folder structure complete, Supabase client connects.

### 1.2 Supabase Setup

- [x] **Create new Supabase project** (name: padion-production)
- [x] **Run full SQL schema** from architecture.md (all tables, enums, indexes, RLS policies, trigger)
- [x] **Verify RLS policies** work correctly (test with anon key via Supabase Dashboard)
- [x] **Enable Realtime** on `matches` and `predictions` tables (Supabase Dashboard → Database → Replication)
- [x] **Generate TypeScript types:** `npx supabase gen types typescript --project-id YOUR_ID > types/database.ts`
- [x] **Test connection** from app: fetch empty tournaments table to verify SDK works

**Acceptance:** All tables created, RLS policies active, Realtime enabled, TypeScript types generated, SDK connection confirmed.

### 1.3 Type Definitions

- [x] **Create all TypeScript types** in `types/` directory:
  - `types/match.ts` – Match, MatchScore, SetScore, MatchStatus, Player
  - `types/tournament.ts` – Tournament, TournamentCategory, TournamentStatus
  - `types/prediction.ts` – Prediction, PredictionStatus
  - `types/profile.ts` – Profile
  - `types/chat.ts` – ChatSession, ChatMessage, ChatRole
  - `types/leaderboard.ts` – LeaderboardEntry, LeaderboardPeriod
  - `types/achievement.ts` – Achievement, AchievementType
  - `types/friendship.ts` – Friendship, FriendshipStatus
- [x] **Create transform utilities** in `utils/transforms.ts` – snake_case DB → camelCase TypeScript mappers
- [x] All types use string unions (not enums): `type MatchStatus = 'upcoming' | 'live' | 'completed'`

**Acceptance:** All types compile, transform functions convert DB responses to typed objects correctly.

### 1.4 Authentication

- [x] **Create `services/auth-service.ts`** with functions: `signInWithApple()`, `signInWithEmail()`, `signUp()`, `signOut()`, `getSession()`, `onAuthStateChange()`
- [x] **Create `stores/auth-store.ts`** (Zustand) with: session, profile, isLoading, signIn, signUp, signOut
- [x] **Create `app/(auth)/_layout.tsx`** – auth group layout
- [x] **Create `app/(auth)/onboarding.tsx`** – 3 swipeable intro screens (Live Scores, Predictions, AI Coach) using FlatList horizontal paging
- [x] **Create `app/(auth)/login.tsx`** – Apple Sign-In button (primary) + email/password form (secondary)
- [x] **Create `app/(auth)/signup.tsx`** – email, password, username, display_name fields
- [x] **Create username picker** shown after first sign-up (check uniqueness against profiles table)
- [x] **Create `app/_layout.tsx`** – root layout with auth guard: if session → tabs, else → auth
- [x] **Store session** in `expo-secure-store` for persistence across app restarts

**Acceptance:** Full auth flow works: onboarding → sign up → username pick → home. Sign in/out works. Session persists.

### 1.5 Tab Navigation

- [x] **Create `app/(tabs)/_layout.tsx`** with 5 tabs:
  1. Home (Ionicons: `home`)
  2. Predict (Ionicons: `analytics`)
  3. Rangliste (Ionicons: `trophy`)
  4. AI Coach (Ionicons: `chatbubble-ellipses`)
  5. Profil (Ionicons: `person-circle`)
- [x] Style tab bar: dark background (`bg-background`), accent color for active tab
- [x] Create placeholder screens for each tab with the tab name
- [x] Add badge on Home tab when live matches exist

**Acceptance:** All 5 tabs navigate correctly, styling matches design specs, tab icons render.

### 1.6 Home Screen

- [x] **Create `services/match-service.ts`** with: `fetchLiveMatches()`, `fetchRecentResults()`, `fetchMatchById()`
- [x] **Create `services/tournament-service.ts`** with: `fetchTournaments()`, `fetchTournamentById()`
- [x] **Create `stores/match-store.ts`** (Zustand) with: liveMatches, recentResults, tournaments, isLoading, error, refresh()
- [x] **Create `app/(tabs)/index.tsx`** (Home Screen) with:
  - Segmented control: "Live", "Resultate", "Saison"
  - Live tab: FlatList of MatchCards (or empty state "Keine Live-Matches")
  - Resultate tab: FlatList of completed MatchCards
  - Saison tab: FlatList of TournamentCards
  - Pull-to-refresh via FlatList `onRefresh`
  - Skeleton loading state while fetching
- [x] **Create `components/match-card.tsx`:**
  - Team 1 names + country flag emoji, Team 2 names + flag
  - Score display (sets)
  - Live indicator (pulsing red dot with Reanimated) if status === 'live'
  - Scheduled time if status === 'upcoming'
  - Round badge (QF, SF, F)
  - Pressable → navigates to `/match/[id]`
- [x] **Create `components/tournament-card.tsx`:**
  - Tournament name, location, date range
  - Category badge (Major/P1/P2) with color coding
  - Status indicator
  - Pressable → navigates to `/tournament/[id]`
- [x] **Create `components/skeleton-loader.tsx`** – reusable shimmer placeholder
- [x] **Create `components/live-indicator.tsx`** – pulsing red dot with Reanimated

**Acceptance:** Home screen shows data from Supabase, segmented control switches views, cards render, loading/empty states work.

### 1.7 Seed Data

- [x] **Create seed SQL script** (`supabase/seed.sql`) with:
  - 5 sample tournaments (mix of upcoming, live, completed)
  - 20 sample players (real Premier Padel names: Lebron, Galan, Coello, Tapia, etc.)
  - 30 sample matches across tournaments with realistic scores
- [x] Run seed script via Supabase SQL Editor

**Acceptance:** App shows realistic Premier Padel data on Home screen.

### 1.8 Prediction Flow

- [x] **Create `services/prediction-service.ts`** with: `createPrediction()`, `fetchMyPredictions()`, `fetchPredictionForMatch()`, `getDailyCount()`
- [x] **Create `stores/prediction-store.ts`** (Zustand) with: upcomingMatches, myPredictions, dailyCount, isLoading
- [x] **Create `app/(tabs)/predict.tsx`** (Predict Screen):
  - FlatList of upcoming matches with countdown timers
  - "Meine Predictions" section showing pending/completed predictions
  - Each match shows checkmark if already predicted
  - Daily counter for free users ("2 von 3 heute")
- [x] **Create `components/prediction-sheet.tsx`** (Bottom Sheet via @gorhom/bottom-sheet):
  - Team A vs Team B selection (large tap targets with Pressable)
  - Optional: Picker for Satz-Ergebnis (2:0, 2:1, 1:2, 0:2)
  - Points preview ("Bis zu +20 Punkte")
  - Confirm button with haptic feedback (expo-haptics)
  - Success animation (Reanimated)
- [x] **Create `components/countdown-timer.tsx`** showing time until match start
- [x] **Create `hooks/use-daily-limit.ts`** – checks and enforces daily prediction limit
- [x] Enforce prediction deadline (5 min before match) – disable button
- [x] Enforce daily limit for free users (3/day) – show paywall CTA

**Acceptance:** Full prediction flow works end-to-end, saved to Supabase, daily limits enforced, haptic feedback works.

### 1.9 Basic Profile

- [x] **Create `app/(tabs)/profile.tsx`** with:
  - Avatar + display name + username
  - Stats row: total points, accuracy %, current streak
  - "Einstellungen" button → `/settings`
  - Sign out button
- [x] **Create `components/stat-card.tsx`** – reusable stat display component

**Acceptance:** Profile shows user data from Supabase, sign out works.

---

## Phase 2 – Core Features (Weeks 5–8)

### 2.1 Match Detail

- [x] **Create `app/match/[id].tsx`:**
  - Full score breakdown (all sets displayed)
  - Player profiles with rankings and country flags
  - Head-to-Head history (if data available)
  - Match info: tournament name, round, court, time
  - "Prediction abgeben" button (if match is upcoming)
- [x] Navigate from MatchCard tap using `router.push(/match/${id})`

**Acceptance:** Match detail loads complete data, back navigation works, prediction CTA functional.

### 2.2 Tournament Detail

- [x] **Create `app/tournament/[id].tsx`:**
  - Tournament header (name, location, dates, category badge, prize money)
  - Segmented control: "Spielplan" / "Ergebnisse"
  - FlatList of matches filtered by tournament
  - Simplified bracket/draw view

**Acceptance:** Tournament detail shows filtered matches, navigation works.

### 2.3 Prediction Evaluation (Edge Function)

- [x] **Create `supabase/functions/evaluate-predictions/index.ts`:**
  - Input: match_id
  - Fetches all pending predictions for the match
  - Calculates points (+10 winner, +5 score, streak bonuses)
  - Updates predictions (points_earned, status)
  - Updates profiles (total_points, current_streak, correct_predictions_count)
- [x] **Create `supabase/functions/update-leaderboard/index.ts`:**
  - Called after evaluate-predictions
  - Recalculates ranks for all periods
  - Updates leaderboard_entries
- [x] **Create helper SQL functions** (RPC):
  - `increment_user_stats(user_id, points, correct)`
  - `reset_user_streak(user_id)`
- [x] **Deploy Edge Functions:** `npx supabase functions deploy evaluate-predictions`
- [x] **Test** with sample match completion

**Acceptance:** Predictions auto-evaluated when match completes, points calculated correctly, leaderboard updated.

### 2.4 Leaderboard

- [x] **Create `services/leaderboard-service.ts`** with: `fetchFriendsLeaderboard()`, `fetchGlobalLeaderboard()`, `getMyRank()`
- [x] **Create `services/friend-service.ts`** with: `sendRequest()`, `acceptRequest()`, `removeFriend()`, `searchUsers()`, `fetchFriends()`
- [x] **Create `stores/leaderboard-store.ts`** (Zustand)
- [x] **Create `app/(tabs)/leaderboard.tsx`:**
  - Segmented control: "Freunde" / "Weltweit"
  - Period filter chips: Woche, Monat, Saison, All-Time
- [x] **Create `components/leaderboard-row.tsx`:**
  - Rank number (gold/silver/bronze for top 3)
  - Avatar, username, points, trend arrow, streak badge
- [x] **Friends leaderboard section:**
  - FlatList of friends sorted by points
  - "Freunde hinzufügen" button (search by username)
  - Empty state with invite CTA
- [x] **Global leaderboard section:**
  - Top 100 list (Top 10 only for free users, blurred rest)
  - Sticky own position row at bottom
  - Country filter (flag emoji chips)
  - Premium gate for full list

**Acceptance:** Both leaderboards render correctly, friend system works, free/premium gating active.

### 2.5 Realtime Live Scores

- [x] **Create `hooks/use-realtime-matches.ts`:**
  - Subscribe to Supabase Realtime channel for live match updates
  - Update match-store on score changes
  - Clean up subscription on unmount
- [x] **Use hook in Home Screen** – scores update automatically
- [x] Add haptic pulse on score change (optional)

**Acceptance:** Live scores update within 2 seconds of DB change, no manual refresh needed.

### 2.6 Push Notifications

- [x] **Configure `expo-notifications`** in app.json
- [x] **Create `services/push-service.ts`:** register for push, store token in profiles table
- [x] **Create `supabase/functions/send-push/index.ts`:**
  - Sends push via Expo Push API
  - Triggers: match about to start, prediction result, friend request, rank change
- [x] Add notification preferences toggle in settings

**Acceptance:** Push notifications arrive for configured events.

---

## Phase 3 – Premium & AI (Weeks 9–12)

### 3.1 AI Coach

- [x] **Create `supabase/functions/ai-chat/index.ts`:**
  - Auth check (JWT validation)
  - Rate limit: 10/day free, unlimited premium
  - Load chat history (last 20 messages)
  - Inject current match/player data as context
  - Call Anthropic Claude API with padel system prompt
  - Store user message + response in chat_messages
  - Return response
- [x] **Deploy:** `npx supabase functions deploy ai-chat`
- [x] **Set secret:** `npx supabase secrets set ANTHROPIC_API_KEY=your_key`
- [x] **Create `services/chat-service.ts`** with: `sendMessage()`, `fetchSessions()`, `fetchMessages()`, `createSession()`, `deleteSession()`
- [x] **Create `stores/chat-store.ts`** (Zustand) with: sessions, currentMessages, isTyping, dailyCount
- [x] **Create `app/(tabs)/coach.tsx`** (AI Coach Screen):
  - FlatList (inverted) for chat messages
  - Text input with send button at bottom (KeyboardAvoidingView)
  - Typing indicator while waiting for response
  - Auto-scroll to bottom on new message
  - Suggested prompts above input on empty state
- [x] **Create `components/chat-bubble.tsx`:**
  - User messages: right-aligned, accent background
  - Assistant messages: left-aligned, surface background
  - Markdown rendering for formatted responses
  - Timestamp below each message
- [x] **Create `components/suggested-prompts.tsx`:**
  - Horizontal ScrollView with chip buttons
  - "Wer sind die Top 5?", "Erkläre die Bandeja", "Analyse: nächstes Match"
- [x] **Enforce rate limiting** – show counter "7 von 10 heute" for free users
- [x] Show paywall when limit reached

**Acceptance:** Full chat works, Claude responds with padel knowledge, rate limiting enforced, markdown renders.

### 3.2 Premium Subscription

- [x] **Create `services/purchase-service.ts`** with RevenueCat:
  - `configure()` – init RevenueCat SDK
  - `fetchOfferings()` – load plans
  - `purchaseMonthly()` – CHF 4.90/month
  - `purchaseYearly()` – CHF 39.90/year
  - `restorePurchases()`
  - `checkStatus()` – sync with profile.is_premium
- [x] **Create `stores/purchase-store.ts`** (Zustand): isPremium, offerings, purchase(), restore()
- [x] **Create `app/paywall.tsx`:**
  - Feature comparison (Free vs Premium table)
  - Monthly/Yearly toggle with savings highlight ("Spare 32%")
  - 7-day free trial badge
  - Purchase button
  - Restore purchases link
  - Terms & Privacy links
- [x] **Create `components/paywall-modal.tsx`** – inline paywall shown at premium gates
- [x] **Create `hooks/use-premium-check.ts`** – checks premium status, shows paywall if needed
- [x] **Integrate paywall triggers:**
  - 4th prediction/day → paywall
  - 11th AI message/day → paywall
  - Global leaderboard beyond Top 10 → paywall
  - Detailed player analysis → paywall
  - Prize eligibility → paywall
- [x] **Sync subscription** with Supabase (update profiles.is_premium on purchase)
- [ ] **Configure RevenueCat** project + App Store Connect products (nach Apple Developer Account)

**Acceptance:** Purchase flow works (sandbox), premium unlocks features, status synced to Supabase.

### 3.3 Achievements

- [x] **Create `supabase/functions/check-achievements/index.ts`:**
  - Called after prediction evaluation
  - Checks thresholds: first_prediction, streak_3/5/10, correct_10/50/100, predictions_50/100/500
  - Inserts new achievements
- [x] **Create `components/achievement-badge.tsx`:** earned (colored) vs unearned (greyed)
- [x] **Add achievements grid** to profile screen
- [x] **Toast notification** on new achievement (custom toast component)

**Acceptance:** Achievements trigger correctly, display in profile, toast appears.

### 3.4 Rewards

- [x] **Create `supabase/functions/distribute-rewards/index.ts`:**
  - Cron: 1st of month + end of season
  - Awards prizes to top-ranked premium users
  - Creates user_rewards entries
  - Triggers push notification
- [x] **Seed rewards table** with prize definitions
- [x] Show earned rewards in profile

**Acceptance:** Monthly rewards distributed, visible in profile.

---

## Phase 4 – Polish & Launch (Weeks 13–16)

### 4.1 Polish & UX

- [x] **Improve onboarding** with Reanimated animations
- [x] **Add "Choose favorite players"** step during onboarding
- [x] **Add share functionality** for predictions and profile
- [x] **Create `app/settings.tsx`:**
  - Push notification toggles
  - Appearance: Dark/Light/System
  - Language selector
  - Account: change email, change password, delete account
  - Legal: Privacy Policy, Terms, Impressum
  - App info: version
  - Sign out
- [ ] **Profile photo upload** via Supabase Storage + expo-image-picker
- [x] **Create `components/empty-state.tsx`** – reusable empty state with illustration

### 4.2 Performance

- [x] **Optimize FlatLists:** keyExtractor, getItemLayout, windowSize, maxToRenderPerBatch
- [x] **React.memo** all list item components (MatchCard, LeaderboardRow, ChatBubble)
- [x] **Use Zustand selectors** everywhere to minimize re-renders
- [x] **expo-image** with proper caching on all images
- [ ] **Test on real device** via EAS development build
- [ ] **Profile with React DevTools** – fix any performance issues

### 4.3 Error Handling & Edge Cases

- [x] **All screens have 4 states:** loading, error (with retry), empty, data
- [x] **Error boundaries** around each tab
- [x] **Network connectivity check** – show offline banner
- [x] **Graceful handling** of expired sessions (auto-redirect to login)
- [x] **Input validation** on all forms (signup, predictions, chat)

### 4.4 Testing

- [ ] **Unit tests** for all stores (Zustand) with Jest
- [ ] **Unit tests** for prediction point calculation (all edge cases)
- [ ] **Unit tests** for all service transform functions
- [ ] **Component tests** for MatchCard, PredictionSheet, ChatBubble with RNTL
- [ ] **Edge Function tests** with sample data
- [ ] **E2E flow test:** signup → predict → view leaderboard

### 4.5 Build & App Store

- [ ] **Create Apple Developer Account** (99 USD/year) if not existing
- [x] **Configure `app.json`:**
  - name: "Padion"
  - slug: "padion"
  - bundleIdentifier: "com.padion.app"
  - version: "1.0.0"
  - icon, splash screen, runtimeVersion, updates URL
- [x] **Configure `eas.json`:** development / preview / production profiles, iOS-only, OTA channel
- [ ] **Run `eas init`** → fills in `extra.eas.projectId` in app.json (needs EAS account)
- [ ] **Run `eas build --platform ios --profile preview`** → TestFlight beta
- [ ] **App Store Connect setup:**
  - Category: Sports
  - Age rating: 12+ (simulated gambling)
  - Privacy policy URL
  - App description (DE + EN)
  - Keywords for ASO
- [ ] **Create App Store screenshots** (6.7" and 6.1")
- [ ] **Create app icon** (1024x1024) → replace `assets/icon.png`
- [ ] **TestFlight:** distribute to 50-100 beta testers
- [ ] **Fix critical issues** from beta feedback
- [ ] **Submit:** `eas submit --platform ios`
- [ ] **Launch!**

---

## EAS Build Quick Reference

```bash
# First time setup
npm install -g eas-cli
eas login
eas init

# Development (for Expo Dev Client on device)
eas build --platform ios --profile development

# Preview (TestFlight)
eas build --platform ios --profile preview

# Production (App Store)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# OTA Update (JS-only changes, no native code)
eas update --branch production --message "Fix: prediction timer bug"

# Generate types from Supabase
npx supabase gen types typescript --project-id YOUR_ID > types/database.ts

# Deploy Edge Functions
npx supabase functions deploy evaluate-predictions
npx supabase functions deploy ai-chat
npx supabase functions deploy update-leaderboard
npx supabase functions deploy sync-match-data
npx supabase functions deploy send-push
npx supabase functions deploy check-achievements
npx supabase functions deploy distribute-rewards
```

---

## Task Priority – Minimum Viable Product

If short on time, the absolute minimum for a working MVP:

1. **Project setup + Supabase schema** (1.1, 1.2)
2. **Types** (1.3)
3. **Auth flow** (1.4)
4. **Tab navigation** (1.5)
5. **Home screen with match cards** (1.6)
6. **Seed data** (1.7)
7. **Prediction flow** (1.8)
8. **Basic profile** (1.9)

Everything else (AI Coach, Premium, Realtime, Push, Leaderboard, Achievements, Rewards) can be added incrementally after MVP launch via EAS OTA Updates.
