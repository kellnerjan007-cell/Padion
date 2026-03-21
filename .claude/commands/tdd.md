Implement a Padion service or store function using strict Test-Driven Development.

The function or feature to implement is: $ARGUMENTS

---

## CORE RULE
**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

If you didn't watch the test fail, you don't know if it tests the right thing. There are no exceptions.

---

## Setup
First read:
- `.ai/rules.md` – service and store conventions
- The existing file if it already exists (service or store being extended)

Confirm the test framework available (Jest / `@testing-library/react-native`). If no test setup exists, create `jest.config.js` and install deps before proceeding.

Test files live next to source files:
- `services/match-service.test.ts` for `services/match-service.ts`
- `stores/match-store.test.ts` for `stores/match-store.ts`

---

## The Cycle – repeat for every function

### 🔴 RED – Write one failing test

Write the smallest possible test that describes ONE behavior:

```typescript
// services/example-service.test.ts
import { exampleService } from './example-service';

// Mock Supabase – never hit the real DB in tests
jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe('exampleService.fetchById', () => {
  it('returns a camelCase typed object when Supabase returns data', async () => {
    // Arrange – mock the DB response (snake_case, as Supabase returns it)
    const mockRow = { id: '1', created_at: '2024-01-01', player_name: 'Juan' };
    (supabase.from('').select('').eq('', '').single as jest.Mock)
      .mockResolvedValueOnce({ data: mockRow, error: null });

    // Act
    const result = await exampleService.fetchById('1');

    // Assert – result must be camelCase TypeScript type
    expect(result).toEqual({ id: '1', createdAt: '2024-01-01', playerName: 'Juan' });
  });
});
```

Naming rule: `it('does X when Y', ...)`

### 🔴 Verify RED
Run the test. Confirm it **fails** for the right reason:
- `Cannot find module` → file doesn't exist yet ✓
- `is not a function` → function not implemented yet ✓
- **Test passes immediately → STOP. Delete the test. Something is wrong.**

### 🟢 GREEN – Write minimal implementation

Implement ONLY what makes this test pass. No extra logic, no future-proofing.

**Service pattern:**
```typescript
export const exampleService = {
  fetchById: async (id: string): Promise<ExampleType> => {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return transformExample(data);
  },
};
```

**Store pattern (test with `act` from react):**
```typescript
// stores/example-store.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { useExampleStore } from './example-store';

jest.mock('../services/example-service');

it('sets isLoading=true then data on successful fetch', async () => {
  const { result } = renderHook(() => useExampleStore());
  await act(async () => { await result.current.fetchExample(); });
  expect(result.current.isLoading).toBe(false);
  expect(result.current.data).toHaveLength(1);
});
```

### 🟢 Verify GREEN
Run the **full test suite**. Confirm:
- New test passes
- No existing tests broke

### 🔵 REFACTOR – Clean up
With all tests green:
- Remove duplication
- Improve naming
- Extract helpers if needed
- Re-run tests to confirm still green

**Do not add new behaviour during refactor.**

---

## Red flags — stop and restart if:
- You wrote implementation code before a test
- The test passed immediately on first run
- You cannot explain exactly why the test failed
- You are mocking so much that no real logic is tested

---

## Completion checklist
Before marking done, confirm all of the following:
- [ ] Every new function has at least one test
- [ ] Every test was watched to fail first
- [ ] Failure was for the expected reason (not a random crash)
- [ ] Implementation is minimal – no gold plating
- [ ] Full test suite passes with clean output
- [ ] Supabase is mocked (never real DB in tests)
- [ ] snake_case → camelCase transform is tested explicitly
