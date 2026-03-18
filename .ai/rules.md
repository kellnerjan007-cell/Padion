# Padion – AI Rules for Claude Code

## Project Overview

Padion is a mobile app (React Native / Expo) for padel fans. It covers the Premier Padel Tour (FIP) with live scores, match predictions, social leaderboards, and AI coaching. Backend is Supabase (new instance). Monetization via Freemium + Premium subscription. iOS first, Android-ready. No Mac required – uses EAS Build for cloud builds.

## Tech Stack (strict – do not deviate)

- **Framework:** React Native + Expo SDK 52+
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions, Storage)
- **Supabase SDK:** @supabase/supabase-js
- **State Management:** Zustand (lightweight stores)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Animations:** react-native-reanimated
- **Gestures:** react-native-gesture-handler
- **Bottom Sheets:** @gorhom/bottom-sheet
- **Payments:** react-native-purchases (RevenueCat)
- **Push:** expo-notifications
- **Haptics:** expo-haptics
- **Images:** expo-image
- **Icons:** @expo/vector-icons (Ionicons set)
- **AI:** Anthropic Claude API via Supabase Edge Functions (Deno/TypeScript)
- **Build:** EAS Build (cloud)
- **OTA Updates:** EAS Update

## Code Conventions

### TypeScript

- **Strict mode always.** No `any` types. Use `unknown` if type is truly unknown.
- Use interfaces for object shapes, types for unions/intersections.
- All function parameters and return types must be explicitly typed.
- Use `as const` for literal objects and enums.
- Prefer `type` over `enum` for string unions: `type MatchStatus = 'upcoming' | 'live' | 'completed'`
- Use Zod for runtime validation of API responses where needed.

### React Native / Expo

- **Functional components only.** No class components.
- Use `export default function ComponentName()` syntax for screen components.
- Use named exports for reusable components: `export function MatchCard()`.
- All components must be typed with explicit props interface.
- Use `FlatList` for all scrollable lists (never `ScrollView` with `.map()`).
- Use `expo-image` instead of React Native's `Image` component (better caching/performance).
- Use `expo-haptics` for feedback on predictions and important actions.
- Use `react-native-reanimated` for all animations (not Animated API).
- Use `@gorhom/bottom-sheet` for all bottom sheets (prediction placement, filters).
- Use `react-native-safe-area-context` for safe area handling.
- Use `expo-secure-store` for sensitive data (tokens). Use `@react-native-async-storage/async-storage` for non-sensitive cache.

### Expo Router (Navigation)

- File-based routing in `app/` directory.
- Use `(tabs)` group for tab navigation.
- Use `(auth)` group for authentication screens.
- Dynamic routes: `match/[id].tsx`, `tournament/[id].tsx`.
- Use `router.push()` for navigation, `router.replace()` for auth redirects.
- Use `_layout.tsx` for shared layouts.
- Use `Redirect` component for auth guards.

### State Management (Zustand)

- One store per domain: `useAuthStore`, `useMatchStore`, `usePredictionStore`, `useLeaderboardStore`, `useChatStore`.
- Keep stores in `stores/` directory.
- Use `persist` middleware with AsyncStorage for offline-capable stores.
- Never access Supabase directly from stores – go through service functions.
- Use selectors to prevent unnecessary re-renders: `const liveMatches = useMatchStore(s => s.liveMatches)`.

### Styling (NativeWind)

- Use NativeWind (Tailwind) classes for all styling. No `StyleSheet.create()`.
- Dark mode is the default design.
- Use the custom color palette defined in `tailwind.config.js`.
- Use `className` prop for styling (NativeWind v4).
- Responsive design: use Tailwind responsive prefixes where needed.
- Common patterns:
  - Cards: `className="bg-surface rounded-2xl p-4 mb-3"`
  - Text primary: `className="text-primary text-base font-medium"`
  - Text muted: `className="text-muted text-sm"`
  - Accent button: `className="bg-accent rounded-xl py-3 px-6 items-center"`
  - Live indicator: `className="w-2 h-2 rounded-full bg-accent"` (with pulsing animation)

### Naming Conventions

- **Files:** kebab-case for all files (`match-card.tsx`, `use-auth-store.ts`, `prediction-service.ts`).
- **Components:** PascalCase (`MatchCard`, `PredictionSheet`, `LiveIndicator`).
- **Hooks/Stores:** camelCase with `use` prefix (`useAuthStore`, `useMatchService`).
- **Services:** camelCase with descriptive name (`matchService`, `predictionService`).
- **Types/Interfaces:** PascalCase (`Tournament`, `MatchStatus`, `PredictionResult`).
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_FREE_PREDICTIONS`, `PREDICTION_LOCK_MINUTES`).
- **Supabase tables:** snake_case in database, camelCase in TypeScript (transform in service layer).

### Project Structure

```
padion/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home (Live/Results/Season)
│   │   ├── predict.tsx           # Predictions
│   │   ├── leaderboard.tsx       # Rankings
│   │   ├── coach.tsx             # AI Coach Chat
│   │   └── profile.tsx           # User Profile
│   ├── match/
│   │   └── [id].tsx              # Match Detail
│   ├── tournament/
│   │   └── [id].tsx              # Tournament Detail
│   ├── settings.tsx
│   ├── paywall.tsx
│   └── _layout.tsx               # Root layout (auth guard)
├── components/                    # Reusable UI components
│   ├── match-card.tsx
│   ├── tournament-card.tsx
│   ├── prediction-sheet.tsx
│   ├── chat-bubble.tsx
│   ├── suggested-prompts.tsx
│   ├── leaderboard-row.tsx
│   ├── skeleton-loader.tsx
│   ├── live-indicator.tsx
│   ├── countdown-timer.tsx
│   ├── premium-badge.tsx
│   ├── paywall-modal.tsx
│   ├── achievement-badge.tsx
│   ├── stat-card.tsx
│   └── empty-state.tsx
├── stores/                        # Zustand stores
│   ├── auth-store.ts
│   ├── match-store.ts
│   ├── prediction-store.ts
│   ├── leaderboard-store.ts
│   ├── chat-store.ts
│   └── purchase-store.ts
├── services/                      # Supabase data access
│   ├── supabase.ts               # Supabase client init
│   ├── auth-service.ts
│   ├── match-service.ts
│   ├── tournament-service.ts
│   ├── prediction-service.ts
│   ├── leaderboard-service.ts
│   ├── friend-service.ts
│   ├── chat-service.ts
│   └── purchase-service.ts
├── types/                         # TypeScript types
│   ├── database.ts               # Supabase generated types
│   ├── match.ts
│   ├── tournament.ts
│   ├── player.ts
│   ├── prediction.ts
│   ├── profile.ts
│   ├── chat.ts
│   ├── leaderboard.ts
│   └── achievement.ts
├── hooks/                         # Custom hooks
│   ├── use-realtime-matches.ts
│   ├── use-countdown.ts
│   ├── use-premium-check.ts
│   └── use-daily-limit.ts
├── utils/                         # Utilities
│   ├── constants.ts
│   ├── format-date.ts
│   ├── format-score.ts
│   ├── calculate-points.ts
│   └── country-flags.ts
├── assets/                        # Static assets
│   ├── images/
│   └── fonts/
├── supabase/                      # Edge Functions
│   └── functions/
│       ├── evaluate-predictions/
│       │   └── index.ts
│       ├── update-leaderboard/
│       │   └── index.ts
│       ├── ai-chat/
│       │   └── index.ts
│       ├── sync-match-data/
│       │   └── index.ts
│       ├── send-push/
│       │   └── index.ts
│       ├── check-achievements/
│       │   └── index.ts
│       └── distribute-rewards/
│           └── index.ts
├── tailwind.config.js
├── app.json                       # Expo config
├── eas.json                       # EAS Build config
├── tsconfig.json
└── package.json
```

### Supabase Integration

- Initialize the Supabase client ONCE in `services/supabase.ts`.
- Use `@supabase/supabase-js` v2.
- All database queries go through service files, never directly from components or stores.
- Use Supabase Realtime for live match score updates – subscribe via custom hook `useRealtimeMatches`.
- All Edge Functions are written in TypeScript (Deno runtime).
- Use Row Level Security (RLS) on every table – never rely on client-side filtering for security.
- Store Supabase URL and anon key in `app.json` extra config (accessed via `expo-constants`).
- Generate TypeScript types from Supabase schema: `npx supabase gen types typescript`.
- Transform snake_case DB columns to camelCase in service layer.

### Error Handling

- Define custom error types in `types/errors.ts`.
- All async functions must use try/catch with proper error typing.
- Show user-friendly error messages via Toast or inline error states.
- Use React Error Boundaries for unexpected component errors.
- Log errors in development with `console.error`, use PostHog in production.
- Never show raw error messages to users.
- All screens must have: loading state, error state, empty state, data state.

### Performance Rules

- Use `FlatList` for all lists (with `keyExtractor`, `getItemLayout` where possible).
- Use `React.memo()` for expensive list item components.
- Use `useMemo` and `useCallback` for expensive computations and callbacks passed to children.
- Use `expo-image` with `cachePolicy="memory-disk"` for all images.
- Use Hermes engine (default in Expo SDK 52+).
- Avoid inline styles – use NativeWind classes.
- Use `react-native-reanimated` worklets for animations (runs on UI thread).
- Minimize re-renders: use Zustand selectors, split stores by domain.

### Premium / Paywall

- Check `profile.is_premium` to gate features.
- Free users: max 3 predictions/day, 10 AI messages/day, limited leaderboard view.
- Premium users: unlimited predictions, unlimited AI chat, full leaderboard, prizes eligible.
- Show PaywallModal when free user tries premium features.
- Use RevenueCat (`react-native-purchases`) for subscription management.
- Sync subscription status with Supabase profile on purchase/restore.

### Testing

- Use Jest + React Native Testing Library for component tests.
- Test all service functions with mocked Supabase responses.
- Test Zustand stores independently.
- Test prediction point calculation thoroughly (all edge cases).
- Use `expo-dev-client` for development builds.

### Git Conventions

- Branch naming: `feature/feature-name`, `fix/bug-description`, `chore/task`.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- Keep commits small and focused on a single change.

### Do NOT

- Do NOT use `StyleSheet.create()` – use NativeWind classes exclusively.
- Do NOT use `ScrollView` with `.map()` for lists – use `FlatList`.
- Do NOT use React Native's `Image` – use `expo-image`.
- Do NOT use `Animated` API – use `react-native-reanimated`.
- Do NOT use class components.
- Do NOT use `any` type in TypeScript.
- Do NOT hardcode strings – use constants.
- Do NOT store secrets (API keys, Supabase service role key) in the app bundle or source code.
- Do NOT call Supabase directly from components – always go through services.
- Do NOT skip RLS policies on any Supabase table.
- Do NOT use `NavigationContainer` from React Navigation – use Expo Router.
- Do NOT use `@react-navigation` packages – Expo Router handles everything.
- Do NOT use `expo-font` for system fonts – only for custom fonts if needed.
- Do NOT create separate Android-specific code unless absolutely necessary.
- Do NOT use `fetch()` for Supabase calls – use the Supabase JS SDK.
