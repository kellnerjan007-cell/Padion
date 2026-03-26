# Padion Webapp – Approved Design

**Datum:** 2026-03-26
**Status:** Approved
**Pivot:** React Native → Next.js Webapp (bestehender Repo, RN-Code wird ersetzt)

---

## Ziel

Padion als vollständige Next.js Webapp mit 4 Seiten: Matches, Predictions, News, Profil.
Supabase-Backend bleibt unverändert (gleiche Tabellen, gleiche Edge Functions).

---

## Tech Stack

| Was | Womit |
|---|---|
| Framework | Next.js 15 App Router |
| Sprache | TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui (dark mode) |
| State | Zustand |
| Backend | Supabase (bestehend, projekt: rotfwrwttdzvyavfsnqe) |
| Auth | Supabase Auth: Email/Passwort + Google OAuth |
| Deploy | Vercel |

---

## Routing

```
app/
├── layout.tsx                   # Root layout, Supabase Auth Provider
├── page.tsx                     # Redirect → /matches
├── (auth)/
│   ├── login/page.tsx           # Email + Google Login
│   └── signup/page.tsx          # Registrierung + Username-Picker
└── (main)/
    ├── layout.tsx               # Nav-Bar (Sidebar Desktop / Bottom Mobile)
    ├── matches/page.tsx         # Live Scores, Resultate, Saison
    ├── predictions/page.tsx     # Predictions abgeben + Meine Predictions
    ├── news/page.tsx            # Padel-Nachrichten
    └── profile/page.tsx         # Stats + Prediction-History + Einstellungen
```

---

## Farbschema (tailwind.config.ts)

```ts
colors: {
  background: "#0D0D1A",
  surface:    "#1A1A2E",
  accent:     "#E94560",
  secondary:  "#0F3460",
  success:    "#00C853",
  warning:    "#FFB300",
  primary:    "#FFFFFF",
  muted:      "#A0A0B0",
}
```

---

## Supabase (unverändert)

Bestehende Tabellen:
- `tournaments`, `matches`, `players` → Matches-Seite
- `predictions` → Predictions-Seite
- `profiles`, `achievements` → Profil-Seite

Neue Tabelle für News:
```sql
CREATE TABLE news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  url text NOT NULL,
  image_url text,
  source text,
  published_at timestamptz DEFAULT now()
);
```

---

## Stores (Zustand)

```
stores/auth-store.ts        # session, profile, signIn, signOut
stores/match-store.ts       # liveMatches, results, tournaments
stores/prediction-store.ts  # upcomingMatches, myPredictions, dailyCount
stores/news-store.ts        # articles, isLoading
```

---

## Services

```
services/supabase.ts         # Supabase client (angepasst für Next.js)
services/auth-service.ts     # signInWithEmail, signInWithGoogle, signOut
services/match-service.ts    # fetchLiveMatches, fetchResults, fetchTournaments
services/prediction-service.ts # createPrediction, fetchMyPredictions
services/news-service.ts     # fetchArticles
```

---

## MVP Scope

### IN
- Matches (Live + Resultate + Saison)
- Predictions (abgeben + Status)
- News (Artikel-Liste)
- Profil (Stats + Sign Out)
- Auth (Email + Google)

### OUT (Phase 2)
- AI Coach
- Premium / Stripe
- Leaderboard
- Push Notifications
- Achievements / Rewards

---

## Implementierungs-Reihenfolge

1. Next.js Projekt aufsetzen (RN-Code löschen, fresh start)
2. Supabase client + Auth (Email + Google)
3. Login / Signup Seiten
4. Nav-Layout (main)
5. Matches-Seite
6. Predictions-Seite
7. News-Seite + `news_articles` Tabelle
8. Profil-Seite
9. Vercel deploy
