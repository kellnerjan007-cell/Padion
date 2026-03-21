Clarify requirements and design a feature BEFORE writing any code.

The feature or idea to explore is: $ARGUMENTS

---

## HARD GATE
Do NOT write any code, create any files, or call any implementation skill until the user has explicitly approved the design. This applies even for "simple" features.

---

## Step 1 – Explore existing context
Read the relevant existing files to understand what already exists:
- `docs/PRD.md` – Does this feature already have a spec?
- `docs/architecture.md` – Which layers are affected?
- `.ai/rules.md` – Which rules constrain this feature?
- Any existing screens / stores / services related to this feature

## Step 2 – Assess scope
If $ARGUMENTS describes multiple independent sub-features, flag this immediately:
> "This covers X independent areas. Let's split into: [list]. Which should we design first?"

Only proceed with one focused feature at a time.

## Step 3 – Ask clarifying questions
Ask ONE question at a time. Prefer multiple-choice where possible. Stop when you have enough to propose a design.

Focus on:
- **User goal** – What problem does this solve for a padel fan?
- **Data** – What comes from Supabase? What's new vs. existing?
- **UI** – Which tab? Bottom sheet, new screen, or inline?
- **Auth** – Free or paid (RevenueCat)? Any RLS implications?
- **Real-time** – Does data need to update live?
- **Edge cases** – Empty state, offline, loading failure?

## Step 4 – Propose 2–3 approaches
Present alternatives with trade-offs. Format:

### Option A – [Name]
- What: ...
- Layers touched: Screen / Store / Service / Types / Edge Function
- Pro: ...
- Con: ...

### Option B – [Name]
...

**Recommendation:** Option X because ...

## Step 5 – Present full design
After user picks an approach, present the design in sections. Wait for approval after each section.

### Section 1: Types (`types/[name].ts`)
What interfaces and string unions are needed.

### Section 2: Service (`services/[name]-service.ts`)
Which Supabase tables/queries. Any Edge Functions?

### Section 3: Store (`stores/[name]-store.ts`)
State shape, actions, Realtime subscriptions if needed.

### Section 4: Screen / Component (`app/...` or `components/...`)
Layout, 4 states (loading/error/empty/data), navigation.

### Section 5: Padion-specific concerns
- Haptics: which interactions trigger `expo-haptics`?
- RevenueCat gate: free or premium?
- NativeWind classes: any new colors needed in `tailwind.config.js`?

## Step 6 – Save design doc
Save the approved design to:
`docs/specs/YYYY-MM-DD-[feature-name].md`

Include: goal, chosen approach, all 5 sections, open questions.

## Step 7 – Hand off
Once the user approves the written spec, respond with:
> "Design approved. Run `/new-screen [name]` to start implementation."

Do NOT implement anything yourself after brainstorming.
