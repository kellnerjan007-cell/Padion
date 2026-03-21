Diagnose and fix common runtime and build issues in the file or area named in $ARGUMENTS.

If $ARGUMENTS is a file path, read that file. If it's a feature area or symptom description, search the relevant files.

Also read `.ai/rules.md` to understand project conventions.

---

## Debug Report: $ARGUMENTS

### Step 1 – Identify symptoms
State what the likely failure mode is (crash, blank screen, TypeScript error, build failure, Supabase error, etc.).

### Step 2 – Root cause analysis
Check for these common Padion issues:

**Runtime crashes**
- `react-native-purchases` in dependencies → remove it (causes TurboModule abort on launch)
- Babel plugin conflicts: only `react-native-worklets/plugin` should be in `babel.config.js`
- Missing `await` on async Supabase calls
- Accessing `undefined` nested property without optional chaining

**Blank / stuck screens**
- Store `isLoading` never set to `false` after fetch
- Missing error state catch in store action
- Screen doesn't handle all 4 states: loading / error / empty / data

**TypeScript errors**
- `any` type used → replace with proper type or `unknown`
- Missing return type on service function
- DB type mismatch (snake_case vs camelCase) → check `utils/transforms.ts`

**Supabase / data issues**
- RLS policy blocking query (check Supabase Dashboard → Auth → Policies)
- Wrong table/column name (check `types/database.ts`)
- Missing `.select()` field in query
- Realtime subscription not cleaned up → return `unsubscribe` from store

**Navigation issues**
- Using `@react-navigation` → must use Expo Router (`useRouter`, `<Link>`)
- Missing `_layout.tsx` for a route group

**Styling issues**
- `StyleSheet.create()` used → convert to NativeWind `className`
- NativeWind class not applied → check `tailwind.config.js` content paths include the file

**Build / EAS issues**
- `babel-preset-expo` not in `devDependencies`
- New native package added → requires `eas build`, not just `eas update`
- Use `eas build --auto-submit` not `eas submit --latest` in CI

### Step 3 – Fix
Apply the minimal fix for each issue found. Show a before/after diff for each change.

### Step 4 – Verification
List what to check to confirm the fix works (e.g. "run app, navigate to X screen, verify data loads").

---

If no issues are found, output: "✓ No issues detected in $ARGUMENTS."
