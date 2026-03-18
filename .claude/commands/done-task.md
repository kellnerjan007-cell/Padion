Mark a completed task in `docs/plan.md`.

The task to mark as done: $ARGUMENTS

If $ARGUMENTS is empty, ask: "Which task did you just complete? (describe it briefly)"

Steps:
1. Read `docs/plan.md`
2. Find the matching `- [ ]` task (use fuzzy matching on the task description)
3. Show the found task and ask for confirmation before changing it
4. Change `- [ ]` to `- [x]` for the confirmed task
5. Save the file
6. Report: "✓ Marked as done: [task name]"
7. Show the next uncompleted task in the same section (if any)
