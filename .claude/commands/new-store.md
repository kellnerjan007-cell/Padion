Create a Zustand store for Padion.

First read:
- `.ai/rules.md` → Zustand section
- `docs/architecture.md` → "Layer 3: Stores" section for the exact pattern

The store domain is: $ARGUMENTS

Create `stores/[name]-store.ts` with:

**Pattern:**
```typescript
import { create } from 'zustand';
import { [name]Service } from '@/services/[name]-service';
import type { [Type] } from '@/types/[name]';

interface [Name]Store {
  // State
  data: [Type][];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetch[Name]: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const use[Name]Store = create<[Name]Store>((set, get) => ({
  data: [],
  isLoading: false,
  error: null,

  fetch[Name]: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await [name]Service.fetch[Name]();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: 'Fehler beim Laden', isLoading: false });
    }
  },

  refresh: async () => {
    await get().fetch[Name]();
  },
}));
```

Rules:
- Never call Supabase directly – always via service
- Expose `error` state
- Use `set({ isLoading: false })` in both try AND catch
- For Realtime: return unsubscribe function from subscription setup

After creating, show how to use it in a screen with a selector.
