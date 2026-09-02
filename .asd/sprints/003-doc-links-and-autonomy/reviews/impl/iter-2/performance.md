---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-performance]: CONCERNS

# Review — performance

- **Phase**: impl-review
- **Iteration**: 2

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `sprint-lifecycle.md:213-217` | Consult cap ("3 per consulting-agent dispatch") has a denominator that step 3 multiplies: since resume is now "a fresh dispatch carrying forward the same task", each re-dispatch IS a new "consulting-agent dispatch" under a literal reading, so the budget resets every round. The enforcing party (the agent, per step 6) is also the one party that can't observe the count (no counter travels in the payload, no log per D-2). Each consult also now costs 1 advisor dispatch + 1 full re-dispatch of the (often opus/high) consulting agent — a real cost, not free. | Name the counter-holder explicitly as the dispatching phase workflow, scoped per consulting-agent-task not per dispatch. |
| 2 | medium | `asd-architect.md:66`, `asd-ba.md:61`, `asd-ux-designer.md:73` | All three still claim "resumes in the same turn, no halt" — contradicted by protocol step 3's actual re-dispatch model. A misstated cost model on the most expensive re-dispatch targets (opus/high) encourages liberal consulting against a cap that never binds. `asd-pm.md:67` already has the corrected wording. | Match `asd-pm.md:67`. |

Confirmed clean this iteration: `tests/run.js`'s new assertions are all O(n) with O(1) lookups, no n+1, no new subprocess spawns; advisor self-recursion is genuinely closed (three-level confirmation: signal-vocabulary emitter exclusion, protocol step 1, advisor's own Signals-emitted list). `tests/run.js` confirmed NOT on an automated hot path (separate `test`/`build` commands; CI runs only `sync.js --check`).

## Coverage summary (internal reviewers only)

**Summary**: `files: 19/19 checked, 0 n/a · rules: 4/5 (2 n/a within the 5), 2 findings`

**n/a rows**: Budget compliance — no perf budgets defined in custom-coding-rules.md. Regression vs baseline — no in-repo measurement baseline exists.

**Findings rows**: Hot path identification (consult path bounded/measurable) → #1. Anti-patterns (misstated cost model on repeated path) → #2.

## Verdict
CONCERNS: 2 (both medium)

## Next action
One paragraph fix in `sprint-lifecycle.md` (cap denominator) + one-line fix in 3 agent files (resume wording) + `sync.js --apply` for the affected views.

## Escalations
None.
