# Padion – Claude Code Instructions

## Project
Padion is a **Next.js 15 webapp** for padel fans. Live scores, match predictions, news, profiles. Backend: Supabase. Deployed on Vercel.

## Key Documents – READ BEFORE CODING
- **Feature Specs:** `docs/PRD.md` – All feature requirements
- **Task Checklist:** `docs/plan.md` – Current progress
- **Webapp Design:** `docs/specs/2026-03-26-padion-webapp.md`

## Platform: Web
- **No React Native. No Expo. No EAS.**
- Deploy via Vercel (automatic on push to main)
- Auth: Email/Password + Google OAuth (Supabase Auth)

## Tech Stack (strict – never deviate)
- Next.js 15 App Router | TypeScript strict
- Tailwind CSS | lucide-react (icons)
- Zustand (state) | @supabase/supabase-js + @supabase/ssr
- Vercel (hosting)

## Architecture
```
app/(main)/[page]/page.tsx  → reads from Store
stores/[domain]-store.ts    → calls Service
services/[domain]-service.ts → talks to Supabase
types/index.ts              → TypeScript interfaces
lib/supabase/               → client.ts + server.ts
```

## Critical Rules
- NO `any` type in TypeScript
- NO direct Supabase calls in page components → go through services
- All pages must have: loading / error / empty / data states
- One Zustand store per domain
- Use `next/image` for all images
- Use `next/link` for all navigation

## Routes
```
/login           → Login (Email + Google)
/signup          → Registrierung
/matches         → Live Scores, Resultate, Saison
/predictions     → Predictions abgeben + Verlauf
/news            → Padel-Nachrichten
/profile         → Stats + Prediction-History
```

## Build & Deploy
- **Deploy:** `git push` → Vercel auto-deploys → live in ~30 Sekunden
- **Local dev:** `npm run dev` → http://localhost:3000
- **Env vars:** Set in Vercel Dashboard (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Supabase
- **Project:** rotfwrwttdzvyavfsnqe
- **Client:** `lib/supabase/client.ts` (Browser), `lib/supabase/server.ts` (Server Components)
- **Auth callback:** `/auth/callback/route.ts`
- **Middleware:** `middleware.ts` (auth guard, redirects)

## Skill Usage Rules (MANDATORY)
- **Before implementing any new feature** → ALWAYS run `/brainstorm` first
- **When a bug is complex** → ALWAYS run `/ultrathink` to diagnose
- **When a feature touches 3+ files** → use `/parallel` or `/team`

## Custom Commands
| Command | Description |
|---|---|
| `/new-screen` | Creates page + store + service |
| `/new-service` | Creates a service file |
| `/new-store` | Creates a Zustand store |
| `/review` | Audits current file |
| `/next-task` | Shows next open task from plan.md |
| `/done-task` | Marks a task as complete in plan.md |
| `/brainstorm` | Clarify requirements before coding |
| `/ultrathink` | Deep analysis for complex bugs |
| `/parallel` | Implement large features with parallel agents |
| `/team` | Coordinate agents for end-to-end feature |
