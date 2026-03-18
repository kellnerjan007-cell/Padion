Create a Supabase service file for Padion.

First read:
- `.ai/rules.md` → Services section
- `docs/architecture.md` → "Layer 4: Services" section for the exact pattern

The service domain is: $ARGUMENTS

Create `services/[name]-service.ts` with:

**Pattern:**
```typescript
import { supabase } from './supabase';
import type { [Type] } from '@/types/[name]';
import { transform[Type] } from '@/utils/transforms';

export const [name]Service = {
  fetch[Name]s: async (): Promise<[Type][]> => {
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transform[Type]);
  },

  fetch[Name]ById: async (id: string): Promise<[Type]> => {
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transform[Type](data);
  },
};
```

Rules:
- Plain object with async functions (not a class)
- Import `supabase` from `./supabase` only
- Always transform snake_case → camelCase (via utils/transforms.ts)
- Always throw on error (stores handle catching)
- Use proper TypeScript return types

For joins, use Supabase PostgREST syntax:
```typescript
.select(`*, player:players!player_id(name, country, ranking)`)
```

After creating, show which store should import this service.
