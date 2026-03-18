# Padion – Claude Code Instructions

## Project
Padion is a React Native + Expo mobile app for padel fans. Live scores, match predictions,
social leaderboards, AI coaching. Backend: Supabase. iOS first via EAS Build (no Mac needed).

## Key Documents – READ BEFORE CODING
- **Rules & Conventions:** `.ai/rules.md` – MUST follow at all times
- **Architecture & Code Examples:** `docs/architecture.md` – 5-layer architecture with code samples
- **Feature Specs:** `docs/PRD.md` – All feature requirements
- **Task Checklist:** `docs/plan.md` – Current progress, use `/next-task` to see what's next

## Platform: iOS Only
**App Store only. No Android. No Web.**
- Apple Sign-In is the primary auth method (email is fallback only)
- Use `expo-haptics` everywhere – it's an iOS strength
- No `Platform.OS` guards needed – assume iOS always
- EAS Build with `--platform ios` only

## Tech Stack (strict – never deviate)
- React Native + Expo SDK 52+ | TypeScript strict | Expo Router (file-based)
- Zustand (state) | NativeWind v4 (styling) | @supabase/supabase-js
- react-native-reanimated (animations) | @gorhom/bottom-sheet | expo-haptics
- RevenueCat + Apple IAP (payments) | EAS Build (cloud iOS builds)

## 5-Layer Architecture
```
Screen (app/) → reads from Store
Store (stores/) → calls Service
Service (services/) → talks to Supabase
Types (types/) → TypeScript interfaces
Components (components/) → pure UI, props only
```

## Critical Rules (full list in .ai/rules.md)
- NO `StyleSheet.create()` → use NativeWind `className`
- NO `ScrollView + .map()` → use `FlatList`
- NO `Image` from RN → use `expo-image`
- NO `Animated` API → use `react-native-reanimated`
- NO direct Supabase calls in screens/stores → go through services
- NO `any` type in TypeScript
- NO `TouchableOpacity` → use `Pressable`
- NO `@react-navigation` → use Expo Router
- All screens must have: loading / error / empty / data states
- One Zustand store per domain, use selectors

## Custom Commands
| Command | Description |
|---|---|
| `/new-screen` | Creates Screen + Store + Service + Types (full 4-layer) |
| `/new-component` | Creates a typed NativeWind component |
| `/new-edge-fn` | Creates a Supabase Edge Function (Deno) |
| `/new-store` | Creates a Zustand store |
| `/new-service` | Creates a service file |
| `/review` | Audits current file against rules.md |
| `/next-task` | Shows next open task from plan.md |
| `/done-task` | Marks a task as complete in plan.md |
