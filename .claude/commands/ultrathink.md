# Ultrathink – Deep Analysis Mode

Think deeply and carefully before answering. Consider all angles, potential issues, edge cases, and trade-offs before proposing a solution.

## What to analyze

When ultrathink is invoked (with or without a specific topic in $ARGUMENTS):

1. **Understand the full context** – Read all relevant files before drawing conclusions. Never assume.
2. **Identify the root cause** – Don't treat symptoms. Find the underlying issue.
3. **Consider multiple approaches** – List at least 2-3 alternatives, evaluate trade-offs.
4. **Check for side effects** – What could break? What depends on this code?
5. **Validate against rules** – Cross-check against `.ai/rules.md` before proposing changes.
6. **Recommend the simplest solution** – Over-engineering is a bug. Choose the minimum change that solves the problem.

## Output format

Structure your response as:

### 🧠 Analysis
What's actually happening / what the real problem is.

### 🔍 Options
| Option | Pros | Cons |
|---|---|---|
| A | ... | ... |
| B | ... | ... |

### ✅ Recommendation
The best approach and why.

### 📋 Implementation plan
Step-by-step what to change, with file paths and line numbers.

### ⚠️ Risks
What could go wrong and how to mitigate it.

---

If $ARGUMENTS is provided, focus the deep analysis on that specific topic or file.
If no $ARGUMENTS, perform a full codebase health-check: architecture, violations, performance, and security.
