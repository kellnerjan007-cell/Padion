Break a large Padion feature into independent domains and implement them with parallel sub-agents.

The feature to build is: $ARGUMENTS

---

## When to use this skill
Use parallel agents when:
- The feature touches 3+ independent domains (e.g. auth + matches + leaderboard)
- Multiple screens/stores/services need to be created that don't depend on each other
- Several bugs exist in unrelated parts of the app

Do NOT use when:
- Work is sequential (e.g. types must exist before service, service before store)
- Agents would write to the same file
- You are still in brainstorming / design phase

---

## Step 1 – Decompose into independent domains

Read the relevant files and list all work items. Group into independent batches:

**Example for a "Friends & Leaderboard" feature:**
```
Domain A (independent): types/friendship.ts + services/friendship-service.ts
Domain B (independent): types/leaderboard.ts + services/leaderboard-service.ts
Domain C (depends on A+B): stores/social-store.ts
Domain D (depends on C): app/(tabs)/rangliste.tsx
```

Domains A and B can run in parallel. C and D must run sequentially after.

## Step 2 – Write focused agent tasks

For each parallel domain, write a self-contained task prompt. Good prompts are:
- **Focused** – one domain only, clear file paths
- **Self-contained** – include all context the agent needs (types, conventions)
- **Specific about output** – state exactly which files to create/edit

**Template:**
```
Task: Create [what] in [file path]

Context:
- Read .ai/rules.md for conventions
- Read docs/architecture.md for the [layer] pattern
- Existing related types: [list relevant types]

Requirements:
1. [specific requirement]
2. [specific requirement]

Output: Create [filename] with [specific functions/interfaces]
Do NOT touch: [files other agents will handle]
```

## Step 3 – Dispatch in parallel

Announce the plan clearly:
```
Dispatching 2 parallel agents:
• Agent 1 → friendship types + service
• Agent 2 → leaderboard types + service
Waiting for both to complete before proceeding...
```

Launch both agents simultaneously using the Agent tool with `run_in_background: false`.

## Step 4 – Review and integrate

After all parallel agents complete:
1. Read each created file
2. Run `/review [file]` on each output
3. Check for conflicts (duplicate type names, mismatched interfaces)
4. Fix any integration issues before moving to the next sequential layer

## Step 5 – Continue with sequential work

Once parallel domains are merged and clean, proceed with the dependent layers in order:
1. Store (imports from services)
2. Screen (imports from store)
3. Components (used by screen)

---

## Common mistakes to avoid
- **Too broad scope:** "Build the social feature" → agents don't know where to stop
- **Missing constraints:** Always tell each agent which files it must NOT touch
- **Skipping review:** Always `/review` parallel output before integrating
- **Parallel when sequential:** If Agent B imports from Agent A's output, they are NOT independent

---

## Example: 3 parallel agents for a match-detail screen

```
Agent 1 – Types
  Create types/match-detail.ts
  Interfaces: MatchDetail, SetScore, MatchStats
  Do not create any service or store files

Agent 2 – Edge Function
  Create supabase/functions/match-stats/index.ts
  Fetches aggregated stats for a match_id
  Do not touch any frontend files

Agent 3 – Component
  Create components/match/ScoreBoard.tsx
  Props: { sets: SetScore[], isLive: boolean }
  Use NativeWind, Pressable, expo-haptics
  Use placeholder data – store wires up later
```

After all 3 complete → create service → create store → create screen.
