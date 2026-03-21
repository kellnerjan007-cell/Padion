Coordinate a team of specialized sub-agents to implement a Padion feature end-to-end.

The feature to build is: $ARGUMENTS

---

## The Team

| Agent | Role | When |
|---|---|---|
| **Architect** | Reads spec, writes implementation plan | First, always |
| **Coder** | Implements one layer at a time | Per task in plan |
| **Reviewer** | Audits each file against rules.md | After every Coder task |
| **Tester** | Writes TDD tests for services/stores | After Coder + Reviewer pass |

No agent skips its stage. No code without review. No service/store without tests.

---

## Pre-flight check

Before dispatching any agent:

1. **Spec must exist.** Check `docs/specs/` for a file matching $ARGUMENTS.
   - If missing → stop and say: "Run `/brainstorm $ARGUMENTS` first to create a spec."
2. **Read the spec** completely.
3. **Read `.ai/rules.md`** and `docs/architecture.md` – the team enforces these.

---

## Stage 1 – Architect Agent

Dispatch one Architect agent with this task:

```
You are the Architect for Padion (React Native + Expo + Supabase).

Read:
- docs/specs/[spec file for this feature]
- .ai/rules.md
- docs/architecture.md
- All existing files that this feature touches

Write an implementation plan to: docs/plans/YYYY-MM-DD-[feature].md

Plan structure:
## Goal
One sentence.

## Files map
List every file to create or edit, its layer, and its responsibility.
Mark dependencies: "needs X before Y".

## Tasks
Numbered list. Each task:
- Layer: Types | Service | Store | Screen | Component | EdgeFn
- File: exact path
- What to implement: specific functions/interfaces (not vague)
- Depends on: task numbers that must complete first
- Test required: yes/no

Order tasks so dependencies are never violated.
Group independent tasks that can run in parallel (mark with [PARALLEL]).

Rules:
- Types first, always
- Service before Store
- Store before Screen
- Components can parallel with Store
- Every Service task has a paired Tester task after it
- Every Store task has a paired Tester task after it
```

After Architect completes: **show the plan to the user and wait for approval.**
Do not proceed until the user says "ok" or "go".

---

## Stage 2 – Execute the plan task by task

For each task in the approved plan:

### 2a – Coder Agent

Dispatch one Coder agent per task:

```
You are a Coder implementing one task for Padion.

Task: [paste exact task from plan]

Read before coding:
- .ai/rules.md (you must follow ALL rules)
- docs/architecture.md (use the exact patterns for your layer)
- [any files this task depends on]

Implement ONLY what this task specifies. Do not touch other files.

Layer-specific rules:
- Types: string unions only (no enum), camelCase properties
- Service: plain object pattern, always transform snake_case→camelCase, throw on error
- Store: Zustand, never call Supabase directly, set isLoading in both try AND catch
- Screen: FlatList (never ScrollView+map), all 4 states (loading/error/empty/data), NativeWind only
- Component: named export, typed props interface, Pressable (not TouchableOpacity), expo-image

When done, output:
DONE: [filename]
[full file content]
```

### 2b – Reviewer Agent

Immediately after each Coder task, dispatch a Reviewer:

```
You are a code Reviewer for Padion.

Read .ai/rules.md completely.

Review this file: [filename from Coder output]

[paste file content]

Check every rule. For each violation report:
- Line number
- Rule violated
- Current code
- Required fix

If violations found: output FAIL + list of fixes needed.
If clean: output PASS.
```

- **PASS** → proceed to 2c (if service/store) or next task
- **FAIL** → send fixes back to a new Coder agent, re-review. Max 3 iterations. If still failing after 3, stop and report to user.

### 2c – Tester Agent (Services and Stores only)

After Reviewer PASS for any Service or Store task:

```
You are a Tester for Padion. Write tests using strict TDD RED-GREEN-REFACTOR.

Read:
- .ai/rules.md
- .claude/commands/tdd.md (follow this process exactly)
- The file to test: [filename]
- [paste file content]

Write tests in: [filename].test.ts

Rules:
- Mock Supabase completely (never hit real DB)
- Test snake_case→camelCase transforms explicitly
- Test error propagation (Supabase error → thrown error)
- For stores: use renderHook + act from @testing-library/react-native
- Every exported function must have at least one test

Output:
TEST FILE: [filename].test.ts
[full test file content]
```

---

## Stage 3 – Integration check

After all tasks complete, dispatch one final Reviewer:

```
You are doing a final integration review for the [feature] feature.

Read .ai/rules.md and docs/architecture.md.

Review these files together (check imports, type consistency, layer violations):
[list all created/edited files]

Check:
1. No screen imports from Supabase directly
2. No store imports from Supabase directly
3. Types are consistent across layers (same interface names/shapes)
4. All imports resolve to real files
5. No circular dependencies

Output: INTEGRATION PASS or list of issues.
```

---

## Progress tracking

Announce progress after each agent completes:

```
✓ Architect – plan approved
✓ Coder – types/match-detail.ts
✓ Reviewer – PASS
✓ Coder – services/match-detail-service.ts
✓ Reviewer – PASS
✓ Tester – services/match-detail-service.test.ts
⋯ Coder – stores/match-detail-store.ts (in progress)
```

---

## Abort conditions

Stop the team and report to the user if:
- No spec found in `docs/specs/`
- Reviewer fails 3 times on the same file
- Coder creates a file not in the Architect's plan
- A task depends on a file that hasn't been created yet
