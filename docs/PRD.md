# PADION – Product Requirements Document (PRD)

**Version:** 2.0
**Datum:** 18. März 2026
**Autor:** Jan
**Plattform:** iOS first (React Native / Expo), Android-ready
**Backend:** Supabase (neue Instanz)
**Build:** EAS Build (kein Mac nötig)
**Status:** Draft

---

## 1. Executive Summary

Padion ist eine mobile App (React Native / Expo) für Padel-Fans, die Live-Ergebnisse der Premier Padel Tour (FIP), Match-Predictions, soziale Ranglisten und KI-basiertes Coaching in einer einzigen App vereint.

Die App richtet sich an die schnell wachsende globale Padel-Community und kombiniert den Nervenkitzel von Predictions mit datengetriebener Analyse und sozialem Wettbewerb – ohne echtes Geld einzusetzen.

Die App wird zunächst für iOS gebaut und über den App Store veröffentlicht. Durch React Native / Expo ist ein späterer Android-Launch ohne grossen Mehraufwand möglich. Dank EAS Build wird kein Mac für die Entwicklung benötigt.

---

## 2. Produktvision & Ziele

### 2.1 Vision Statement

Padion wird die #1 Companion-App für jeden Padel-Fan weltweit – der zentrale Ort, um Premier Padel live zu verfolgen, Match-Vorhersagen abzugeben und durch KI-Coaching ein besserer Spieler zu werden.

### 2.2 Strategische Ziele

- **Engagement:** Tägliche Rückkehr durch Live-Daten, Predictions und Ranglisten-Updates.
- **Retention:** Soziale Features (Freundes-Ranglisten) und AI Coaching als langfristige Bindung.
- **Monetarisierung:** Freemium-Modell mit Premium-Abo für erweiterte Features.
- **Wachstum:** Virale Loops durch Freundes-Einladungen und Ranglisten-Sharing.

### 2.3 Zielgruppe

- **Primär:** Padel-Spieler und aktive Fans (18-40 Jahre), die Premier Padel verfolgen.
- **Sekundär:** Gelegenheitssportfans, die Predictions/Tippspiele lieben.
- **Tertiär:** Padel-Anfänger, die über AI Coaching den Sport lernen wollen.

---

## 3. Tech Stack

| Komponente | Technologie | Begründung |
|---|---|---|
| Framework | React Native + Expo SDK 52+ | Cross-Platform, kein Mac nötig dank EAS Build, React-Kenntnisse transferierbar |
| Sprache | TypeScript | Type Safety, bessere DX, bekannt von Next.js/SwixAI |
| Navigation | Expo Router (file-based) | Vertrautes Routing wie Next.js, Deep Linking built-in |
| Backend | Supabase (neue Instanz) | PostgreSQL, Auth, Realtime, Edge Functions, Storage |
| Supabase SDK | @supabase/supabase-js | Offizielles JS SDK, ausgereift, bekannt von SwixAI |
| Auth | Supabase Auth | Apple Sign-In, Email/Passwort |
| Realtime | Supabase Realtime | WebSocket-basierte Live-Updates für Scores |
| AI Coaching | Anthropic Claude API | Padel-spezifischer Chatbot über Supabase Edge Functions |
| State Management | Zustand | Leichtgewichtig, einfach, kein Boilerplate |
| Styling | NativeWind (Tailwind CSS) | Tailwind-Syntax für React Native, bekannt und schnell |
| Payments | RevenueCat (react-native-purchases) | In-App Subscriptions, Paywall, kein Mac für Setup nötig |
| Push | expo-notifications + Supabase Edge Functions | Push-Notifications ohne native Config |
| Icons | @expo/vector-icons (Ionicons) | Umfangreiche Icon-Library |
| Build | EAS Build (Cloud) | iOS + Android Builds in der Cloud, kein Mac nötig |
| OTA Updates | EAS Update | Sofortige Updates ohne App Store Review |
| Analytics | PostHog React Native SDK | User-Tracking, Funnel-Analyse |
| Haptics | expo-haptics | Haptisches Feedback für Predictions |

---

## 4. App-Architektur & Navigation

Padion verwendet Expo Router mit Tab-basierter Navigation und 5 Hauptbereichen. Die App folgt einer feature-basierten Ordnerstruktur.

### 4.1 Tab-Struktur

| Tab | Name | Icon (Ionicons) | Beschreibung |
|---|---|---|---|
| 1 | Home | home | Live-Scores, Resultate, Saisonkalender |
| 2 | Predict | analytics | Predictions platzieren (Gewinner + Sätze) |
| 3 | Rangliste | trophy | Freundes- & Welt-Rangliste mit Preisen |
| 4 | AI Coach | chatbubble-ellipses | KI-Chatbot für Padel-Wissen |
| 5 | Profil | person-circle | Userprofil, Stats, Einstellungen |

### 4.2 Routing (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── onboarding.tsx
├── (tabs)/
│   ├── _layout.tsx          # Tab-Navigation
│   ├── index.tsx             # Home
│   ├── predict.tsx           # Predictions
│   ├── leaderboard.tsx       # Rangliste
│   ├── coach.tsx             # AI Coach
│   └── profile.tsx           # Profil
├── match/[id].tsx            # Match-Detail
├── tournament/[id].tsx       # Turnier-Detail
├── settings.tsx              # Einstellungen
├── paywall.tsx               # Premium Upgrade
└── _layout.tsx               # Root Layout (Auth Check)
```

---

## 5. Feature-Spezifikationen

### 5.1 Home Screen – Live & Resultate

Der Home Screen ist der zentrale Einstiegspunkt und zeigt alle relevanten Match-Daten der Premier Padel Tour auf einen Blick.

#### 5.1.1 Funktionale Anforderungen

- **Live-Matches:** Echtzeit-Anzeige laufender Spiele mit aktuellem Score, Set-Stand und Spielzeit. Realtime-Updates via Supabase Realtime Subscriptions.
- **Resultate:** Abgeschlossene Spiele der aktuellen Turnierwoche mit Endergebnis, Set-Scores und Match-Dauer.
- **Saisonkalender:** Alle Turniere der Premier Padel Saison mit Datum, Ort, Kategorie (Major, P1, P2) und Status (upcoming, live, completed).
- **Turnier-Detail:** Tap auf ein Turnier zeigt Draw/Bracket, Spielplan, Ergebnisse und Turnier-Infos.
- **Match-Detail:** Tap auf ein Match zeigt detaillierte Statistiken, Head-to-Head und Verlaufsdiagramm.
- **Pull-to-Refresh:** Manuelles Aktualisieren der Daten.

#### 5.1.2 UI-Komponenten

- **Segmented Control:** Umschalten zwischen „Live", „Resultate" und „Saison".
- **Match Card:** Kompakte Karte mit Spielernamen, Flaggen, Score, Set-Stand und Live-Indikator (pulsierender roter Punkt).
- **Tournament Card:** Turniername, Ort, Datum, Kategorie-Badge, Fortschrittsanzeige.
- **Skeleton Loading:** Placeholder-Animationen während Daten laden (react-native-skeleton-placeholder oder custom).

#### 5.1.3 Datenmodell (Supabase Tabellen)

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| tournaments | id, name, location | uuid, text, text | Turnier-Stammdaten |
| tournaments | start_date, end_date | date, date | Turnier-Zeitraum |
| tournaments | category, status | enum, enum | Major/P1/P2, upcoming/live/done |
| matches | id, tournament_id | uuid, uuid (FK) | Match-Zuordnung |
| matches | team1_player1, team1_player2 | uuid (FK), uuid (FK) | Team 1 Spieler |
| matches | team2_player1, team2_player2 | uuid (FK), uuid (FK) | Team 2 Spieler |
| matches | score | jsonb | Set-Scores als JSON |
| matches | status, round | enum, text | live/completed/upcoming, Runde |
| matches | scheduled_at | timestamptz | Geplante Spielzeit |
| players | id, name, country | uuid, text, text | Spieler-Stammdaten |
| players | ranking, avatar_url | int, text | Aktuelle Weltrangliste |

---

### 5.2 Predict – Match-Vorhersagen

Das Herzstück von Padion. User können für jedes kommende Match Predictions abgeben und Punkte sammeln.

#### 5.2.1 Prediction-Mechanik

- **Wer gewinnt:** User wählt das gewinnende Team (Pflichtfeld).
- **Satz-Ergebnis:** User predicted die genaue Satzanzahl, z.B. 2:0, 2:1, 1:2, 0:2 (Optional, gibt Bonuspunkte).
- **Deadline:** Predictions sind möglich bis 5 Minuten vor Match-Start. Danach wird die Prediction gesperrt.
- **Lock-In:** Nach Abgabe kann eine Prediction nicht mehr geändert werden.

#### 5.2.2 Punkte-System

| Prediction | Punkte | Bedingung |
|---|---|---|
| Richtiger Gewinner | +10 Punkte | Gewinner korrekt |
| Richtiges Satz-Ergebnis | +5 Bonus | Exakte Sätze korrekt |
| Perfekte Prediction | +20 Punkte (Total) | Gewinner + Sätze korrekt |
| Streak Bonus (3+) | +3 Punkte extra | 3+ richtige Predictions in Folge |
| Streak Bonus (5+) | +5 Punkte extra | 5+ richtige Predictions in Folge |
| Turnier-Prediction | +25 Punkte | Turnier-Sieger korrekt vorhergesagt |

#### 5.2.3 UI-Flow

1. User navigiert zum „Predict"-Tab.
2. Liste aller kommenden Matches mit Countdown-Timer.
3. Tap auf Match öffnet Prediction Bottom Sheet (react-native-bottom-sheet).
4. User wählt Gewinner (Team A oder Team B) per Tap.
5. Optional: Picker für Satz-Ergebnis (2:0, 2:1, etc.).
6. Bestätigung mit haptischem Feedback (expo-haptics) und Animation (react-native-reanimated).
7. Prediction erscheint in „Meine Predictions" mit Status-Badge (pending/correct/wrong).

#### 5.2.4 Datenmodell

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| predictions | id, user_id | uuid, uuid (FK) | Prediction-Zuordnung |
| predictions | match_id | uuid (FK) | Referenz zum Match |
| predictions | predicted_winner_team | int (1 or 2) | Vorhergesagtes Gewinner-Team |
| predictions | predicted_score | text (z.B. '2:1') | Vorhergesagtes Satz-Ergebnis |
| predictions | points_earned | int (default 0) | Erhaltene Punkte |
| predictions | status | enum | pending/correct/partial/wrong |
| predictions | created_at | timestamptz | Zeitpunkt der Abgabe |

---

### 5.3 Rangliste – Leaderboard

Die Rangliste ist der soziale Motor von Padion und treibt den Wettbewerb zwischen Usern an.

#### 5.3.1 Freundes-Rangliste

- **Follow-System:** User können Freunde per Username, QR-Code oder Kontakte suchen und hinzufügen.
- **Rangliste:** Sortiert nach Gesamtpunkten der aktuellen Saison.
- **Anzeige:** Rang, Avatar, Username, Punktzahl, Trend (Pfeil hoch/runter), Streak-Badge.
- **Zeitfilter:** Diese Woche, Dieser Monat, Diese Saison, All-Time.
- **Mini-Profil:** Tap auf einen Freund zeigt dessen Prediction-History und Trefferquote.

#### 5.3.2 Weltweite Rangliste

- **Global Leaderboard:** Top-User weltweit, sortiert nach Punkten.
- **Eigene Position:** Immer sichtbar (sticky), auch wenn man nicht in den Top 100 ist.
- **Länder-Filter:** Rangliste nach Land filtern (Flaggen-Icons).
- **Turnier-Rangliste:** Separate Rangliste pro Turnier für fokussierten Wettbewerb.

#### 5.3.3 Preise & Rewards (Weltweite Rangliste)

Die weltweite Rangliste bietet monatliche und saisonale Preise für Top-Performer:

| Rang | Monatlicher Preis | Saison-Preis |
|---|---|---|
| #1 | 100 CHF Guthaben / Padel-Gutschein | 500 CHF + Premium Padel-Schläger |
| #2 | 50 CHF Guthaben | 250 CHF + Padel-Bag |
| #3 | 25 CHF Guthaben | 100 CHF + Padel-Zubehör |
| #4–10 | 1 Monat Padion Premium gratis | Padel-Materialpaket |
| #11–50 | Exklusive Badges / Profilrahmen | Exklusive Badges + Premium-Monat |

#### 5.3.4 Datenmodell

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| leaderboard_entries | user_id, period | uuid, enum | User + Zeitraum |
| leaderboard_entries | total_points, rank | int, int | Punkte + berechneter Rang |
| leaderboard_entries | correct_predictions | int | Anzahl richtiger Predictions |
| leaderboard_entries | streak, best_streak | int, int | Aktuelle + beste Streak |
| friendships | user_id, friend_id | uuid, uuid | Bidirektionale Freundschaft |
| friendships | status | enum | pending/accepted/blocked |
| rewards | id, rank_range | uuid, text | Preis-Definition pro Rang |
| rewards | period_type, prize | enum, text | monthly/seasonal, Preis-Beschreibung |

---

### 5.4 AI Coach – KI-Padel-Assistent

Ein KI-gestützter Chatbot, der als persönlicher Padel-Experte fungiert. Der AI Coach beantwortet alle Fragen rund um Padel und analysiert Profispieler.

#### 5.4.1 Funktionale Anforderungen

- **Spieler-Analyse:** Fragen über Premier Padel Profis (Spielstil, Stärken/Schwächen, aktuelle Form, Statistiken, Head-to-Head Vergleiche).
- **Regeln:** Alle offiziellen Padel-Regeln erklären (Aufschlag, Punkte, Glaswand, Aus-Regeln, etc.).
- **Technik:** Erklärungen zu Schlägen (Bandeja, Víbora, Bajada, Chiquita, Globo, etc.) mit Tipps zur Ausführung.
- **Taktik:** Strategische Tipps für verschiedene Spielsituationen, Positionierung, Teamplay.
- **Prediction-Hilfe:** Analyse und Einschätzung zu kommenden Matches als Entscheidungshilfe für Predictions.
- **Anfänger-Modus:** Einsteigerfreundliche Erklärungen für Padel-Neulinge.

#### 5.4.2 Technische Umsetzung

- **LLM:** Anthropic Claude API (claude-sonnet) via Supabase Edge Function.
- **System Prompt:** Spezialisierter Padel-Experte mit Wissen über Premier Padel Spieler, Regeln, Techniken und aktuelle Turnier-Daten.
- **Kontext:** Aktuelle Match-Daten und Spieler-Stats werden als Kontext in den Prompt injiziert.
- **Chat-History:** Gespeichert in Supabase, um Gesprächsverlauf beizubehalten.
- **Rate Limiting:** Free: 10 Nachrichten/Tag, Premium: Unbegrenzt.
- **Suggested Prompts:** Vorgefertigte Fragen als Einstieg (z.B. „Wer sind die Top 5 Padel-Spieler?", „Erkläre die Bandeja").

#### 5.4.3 UI-Design

- **Chat-Interface:** Modernes Chat-UI mit Bubbles (react-native-gifted-chat oder custom), Typing-Indicator und Auto-Scroll.
- **Quick Actions:** Horizontale ScrollView mit vorgeschlagenen Fragen als Chips oberhalb des Input-Felds.
- **Rich Responses:** Spieler-Cards und Match-Previews inline im Chat als interaktive Elemente.
- **Markdown-Rendering:** Formatierte Antworten via react-native-markdown-display.

#### 5.4.4 Datenmodell

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| chat_sessions | id, user_id | uuid, uuid (FK) | Chat-Session pro User |
| chat_sessions | created_at | timestamptz | Session-Start |
| chat_messages | id, session_id | uuid, uuid (FK) | Nachricht-Zuordnung |
| chat_messages | role, content | enum, text | user/assistant, Nachrichtentext |
| chat_messages | created_at | timestamptz | Nachrichten-Zeitstempel |

---

### 5.5 Profil

Das Profil zeigt die persönlichen Statistiken und Einstellungen des Users.

#### 5.5.1 Profil-Elemente

- **Avatar & Name:** Profilbild (expo-image-picker), Anzeigename, Username (unique).
- **Stats-Dashboard:** Gesamtpunkte, Trefferquote (%), aktuelle Streak, beste Streak, Anzahl Predictions.
- **Prediction-History:** FlatList aller vergangenen Predictions mit Ergebnis-Status.
- **Achievements:** Badges und Milestones (z.B. „100 Predictions", „10er Streak", „Turnier-Champion").
- **Einstellungen:** Push-Notifications, Sprache, Dark/Light Mode, Account-Verwaltung.
- **Abo-Verwaltung:** Aktueller Plan (Free/Premium), Upgrade-CTA, Abo kündigen.

#### 5.5.2 Datenmodell

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| profiles | id (= auth.uid) | uuid (PK) | User-Profil |
| profiles | username, display_name | text (unique), text | Identifikation |
| profiles | avatar_url, country | text, text | Profilbild + Land |
| profiles | is_premium | boolean | Abo-Status |
| profiles | total_points | int | Cached Gesamtpunkte |
| profiles | created_at | timestamptz | Registrierungsdatum |
| achievements | id, user_id | uuid, uuid (FK) | Earned Achievements |
| achievements | type, earned_at | enum, timestamptz | Achievement-Typ + Zeitpunkt |

---

## 6. Monetarisierung – Freemium + Premium

### 6.1 Planübersicht

| Feature | Free | Premium (CHF 4.90/Monat) |
|---|---|---|
| Live-Scores & Resultate | ✓ Voll | ✓ Voll |
| Saisonkalender | ✓ Voll | ✓ Voll |
| Predictions abgeben | ✓ Max. 3 pro Tag | ✓ Unbegrenzt |
| Freundes-Rangliste | ✓ Voll | ✓ Voll |
| Weltweite Rangliste | ✓ Nur Top 10 sichtbar | ✓ Volle Rangliste + Länderfilter |
| Preise gewinnen (Welt) | ✗ Nicht berechtigt | ✓ Voll berechtigt |
| AI Coach | ✓ 10 Nachrichten/Tag | ✓ Unbegrenzt |
| AI Coach Spieler-Analyse | ✗ Nicht verfügbar | ✓ Detaillierte Analyse |
| Push-Notifications | ✓ Basis (Ergebnisse) | ✓ Erweitert (Predictions, Alerts) |
| Werbefreiheit | ✗ Gelegentliche Ads | ✓ Werbefrei |
| Exklusive Profilrahmen | ✗ Standard | ✓ Premium Designs |

### 6.2 Preisstrategie

- **Monatlich:** CHF 4.90 / Monat
- **Jährlich:** CHF 39.90 / Jahr (32% Rabatt – CHF 3.33/Monat)
- **Trial:** 7 Tage kostenlos testen
- **Payment:** Apple In-App Purchase via RevenueCat (react-native-purchases). Kein StoreKit-Setup nötig – RevenueCat abstrahiert alles.

---

## 7. Supabase Datenbank-Schema (Komplett)

Vollständiges SQL-Schema für die neue Supabase-Instanz. Alle Tabellen nutzen Row Level Security (RLS).

### Kern-Tabellen

- **profiles:** User-Profile, gekoppelt an auth.users (id = auth.uid()). Username (unique), display_name, avatar_url, country, is_premium, total_points.
- **tournaments:** Premier Padel Turniere mit name, location, country, start_date, end_date, category (major/p1/p2), status (upcoming/live/completed), draw_size, surface.
- **players:** Spieler-Stammdaten mit name, country, ranking, avatar_url, birth_date, handedness, partner_id.
- **matches:** Einzelne Matches mit tournament_id, team1_player1/2, team2_player1/2, score (jsonb), status, round, court, scheduled_at, completed_at.

### Prediction-Tabellen

- **predictions:** User-Predictions mit match_id, predicted_winner_team (1/2), predicted_score, points_earned, status (pending/correct/partial/wrong).
- **leaderboard_entries:** Aggregierte Ranglisten-Daten pro User und Periode (weekly/monthly/seasonal/alltime) mit total_points, rank, correct_predictions, streak.

### Social-Tabellen

- **friendships:** Bidirektionale Freundschaften (user_id, friend_id, status: pending/accepted/blocked).
- **friend_requests:** Eingehende Anfragen mit from_user, to_user, status, created_at.

### AI Coach Tabellen

- **chat_sessions:** Pro User mehrere Sessions möglich (id, user_id, title, created_at).
- **chat_messages:** Einzelne Nachrichten (session_id, role: user/assistant, content, tokens_used, created_at).

### Rewards & Achievements

- **rewards:** Definierte Preise pro Rang und Periode (rank_min, rank_max, period_type, prize_description, prize_value).
- **user_rewards:** Zugewiesene Preise an User (user_id, reward_id, period, claimed, claimed_at).
- **achievements:** Earned Badges (user_id, achievement_type, earned_at). Types: first_prediction, streak_3/5/10, correct_10/50/100, tournament_champion, etc.

### RLS Policies

- **SELECT:** User können eigene Daten + öffentliche Profile/Matches/Turniere lesen.
- **INSERT:** User können nur eigene Predictions, Chat-Messages, Friend Requests erstellen.
- **UPDATE:** User können nur eigenes Profil und Einstellungen ändern.
- **DELETE:** User können eigene Freundschaften und Chat-Sessions löschen.

---

## 8. Supabase Edge Functions

| Function | Trigger | Beschreibung |
|---|---|---|
| evaluate-predictions | Match status → completed | Berechnet Punkte für alle Predictions eines abgeschlossenen Matches |
| update-leaderboard | Nach evaluate-predictions | Aktualisiert Ranglisten-Einträge und berechnet neue Ränge |
| ai-chat | POST /ai-chat | Leitet User-Nachricht an Claude API, injiziert Padel-Kontext und Spielerdaten |
| sync-match-data | Cron (alle 5 Min) | Fetcht aktuelle Scores von der Datenquelle und aktualisiert matches-Tabelle |
| send-push | Match-Events | Sendet Push-Notifications bei Match-Start, Prediction-Ergebnis, Ranglisten-Änderung |
| check-achievements | Nach Prediction-Eval | Prüft ob User neue Achievements erreicht hat |
| distribute-rewards | Cron (monatlich) | Weist monatliche Preise an Top-Ranked User zu |

---

## 9. Design-Richtlinien

### 9.1 Design-Prinzipien

- **Premium-Ästhetik:** Dunkel-dominiertes Farbschema mit Akzentfarben. Inspiriert von Sport-Apps wie OneFootball und Sofascore.
- **Native Feel:** Platform-spezifische Patterns wo möglich (iOS Haptics, native Scroll, gestures).
- **Performance:** Skeleton Loading, optimistische Updates, FlatList mit windowSize-Optimierung.
- **Barrierefreiheit:** accessibilityLabel auf allen Elementen, Dynamic Type Unterstützung.

### 9.2 Farbpalette (Tailwind / NativeWind Custom Theme)

| Name | Hex | Tailwind Class | Verwendung |
|---|---|---|---|
| Background | #0D0D1A | bg-background | Haupt-Hintergrund (Dark Mode) |
| Surface | #1A1A2E | bg-surface | Cards, Sheets, Inputs |
| Accent | #E94560 | bg-accent / text-accent | CTAs, wichtige Aktionen, Live-Indikator |
| Secondary | #0F3460 | bg-secondary | Sekundäre Elemente, Links |
| Success | #00C853 | bg-success / text-success | Korrekte Predictions, Gewinne |
| Warning | #FFB300 | bg-warning / text-warning | Pending, Countdown |
| Text Primary | #FFFFFF | text-primary | Haupttext |
| Text Secondary | #A0A0B0 | text-muted | Sekundärer Text, Labels |

### 9.3 NativeWind Config (tailwind.config.js)

```javascript
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0D0D1A",
        surface: "#1A1A2E",
        accent: "#E94560",
        secondary: "#0F3460",
        success: "#00C853",
        warning: "#FFB300",
        primary: "#FFFFFF",
        muted: "#A0A0B0",
      },
    },
  },
};
```

---

## 10. Development Roadmap

### Phase 1 – MVP (Wochen 1–4)

1. Projekt-Setup: Expo, TypeScript, NativeWind, Supabase, Zustand
2. Datenbank-Schema erstellen (alle Tabellen + RLS Policies)
3. Auth-Flow: Apple Sign-In + Email, Onboarding, Username-Picker
4. Home Screen: Turnier-Liste, Match-Karten (mit Seed-Daten)
5. Prediction-Flow: Abgabe, Speicherung, Status-Anzeige
6. Profil: Basis-Setup mit Auth-Integration
7. Tab-Navigation mit Expo Router

### Phase 2 – Core Features (Wochen 5–8)

1. Live-Score Integration: Daten-Feed anbinden + Realtime Updates
2. Prediction-Evaluation: Edge Function für automatische Punkteberechnung
3. Rangliste: Freundes-Rangliste + Weltweite Rangliste
4. Push-Notifications: Match-Start, Ergebnisse, Prediction-Resultate
5. Match-Detail Screen mit Statistiken

### Phase 3 – Premium & AI (Wochen 9–12)

1. AI Coach: Chat-Interface + Claude API Integration via Edge Function
2. Premium Subscription: RevenueCat Setup
3. Paywall-Integration: Feature-Gating für Free vs. Premium
4. Achievements-System implementieren
5. Rewards-System für weltweite Rangliste

### Phase 4 – Polish & Launch (Wochen 13–16)

1. Performance-Optimierung und Caching
2. Onboarding-Flow für neue User
3. App Store Listing: Screenshots, Beschreibung, Keywords
4. TestFlight Beta mit EAS Build
5. Bug Fixes und UI-Polish
6. App Store Submission + Launch

---

## 11. Erfolgskennzahlen (KPIs)

| Metrik | Ziel (3 Monate) | Ziel (12 Monate) |
|---|---|---|
| Downloads | 5.000 | 50.000 |
| DAU (Daily Active Users) | 500 | 10.000 |
| Premium Conversion Rate | 5% | 8% |
| Predictions pro User/Woche | 5+ | 10+ |
| Retention (Day 7) | 40% | 50% |
| Retention (Day 30) | 20% | 30% |
| AI Coach Sessions/Woche | 2 pro User | 4 pro User |
| App Store Rating | 4.5+ | 4.7+ |
| MRR (Monthly Recurring) | CHF 1.000 | CHF 20.000 |

---

## 12. Risiken & Mitigationen

| Risiko | Impact | Mitigation |
|---|---|---|
| Kein offizieller FIP-Daten-Feed | Hoch | Web-Scraping + Community-basierte Daten als Backup |
| Niedrige Conversion zu Premium | Mittel | A/B-Testing der Paywall, Value-Proposition schärfen |
| AI Coach Halluzinationen | Mittel | Curated Prompt + Fact-Check Layer + Spieler-DB als Kontext |
| Wettbewerbsrechtliche Bedenken | Niedrig | Keine echten Geldwetten – rein unterhaltungsbasiert |
| Skalierung bei vielen Usern | Mittel | Supabase Pro Plan, DB-Indizes, Caching-Layer |
| App Store Ablehnung | Mittel | Früh Apple Guidelines prüfen, kein Gambling-Bezug |
| React Native Performance | Niedrig | FlatList-Optimierung, Hermes Engine, Reanimated für Animationen |

---

## 13. Anhang

### 13.1 Glossar

- **Prediction:** Vorhersage eines Match-Ergebnisses (Gewinner + optionale Satzanzahl).
- **Streak:** Anzahl aufeinanderfolgender korrekter Predictions.
- **Bandeja:** Defensiver Padel-Schlag, der über Kopf als flacher Slice geschlagen wird.
- **Víbora:** Offensiver Überkopf-Schlag mit Side-Spin.
- **RLS:** Row Level Security – Supabase-Feature für Datenzugriffskontrolle auf Zeilenebene.
- **Edge Function:** Serverless Function in Supabase (Deno-basiert) für Backend-Logik.
- **EAS Build:** Expo Application Services – Cloud-Build-Service für iOS/Android ohne lokalen Mac.
- **OTA Update:** Over-the-Air Update via EAS Update – JS-Bundle-Updates ohne App Store Review.

### 13.2 Referenzen

- Premier Padel Official: premierpadel.com
- Supabase Docs: supabase.com/docs
- Expo Docs: docs.expo.dev
- React Native: reactnative.dev
- NativeWind: nativewind.dev
- RevenueCat: revenuecat.com/docs
- Anthropic Claude API: docs.anthropic.com
