Create a complete Padion screen following the 5-layer architecture.

First, read these files to understand conventions:
- `.ai/rules.md` — all coding rules and conventions
- `docs/architecture.md` — layer examples with real code

The screen name is: $ARGUMENTS

Create ALL of the following files (never skip a layer):

**1. Screen** – `app/(tabs)/[name].tsx`
- `export default function [Name]Screen()`
- Reads from store via selectors: `const data = use[Name]Store(s => s.data)`
- Uses FlatList for lists (never ScrollView + map)
- Has all 4 states: isLoading → SkeletonLoader, error → error view with retry, empty → EmptyState, data → content
- NativeWind className for all styling
- No direct Supabase calls

**2. Store** – `stores/[name]-store.ts`
- `create<[Name]Store>()` with Zustand
- State + actions typed with interface
- Calls service functions, never Supabase directly
- Exposes error state to UI
- Returns unsubscribe function from any Realtime subscriptions

**3. Service** – `services/[name]-service.ts`
- Plain object with async functions (not a class)
- All functions call `supabase` from `services/supabase.ts`
- Returns camelCase TypeScript types (transform snake_case in this layer)
- Throws errors (caught in store)

**4. Types** – `types/[name].ts`
- All interfaces and type unions for this domain
- Use string union types: `type Status = 'a' | 'b'` (not enum)
- camelCase properties

After creating all files, show a summary of what was created and which import paths to use.
