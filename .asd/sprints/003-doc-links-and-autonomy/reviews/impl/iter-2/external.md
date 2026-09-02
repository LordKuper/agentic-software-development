---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-external]: CONCERNS

# Review — external

- **Phase**: impl-review
- **Iteration**: 2
- **Wrapped CLI**: codex-cli 0.150.1, sandbox read-only, gpt-5.6-sol/high

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `core.md:57` | Incremental-writing rule still uses `accept` for per-section lock-in, contradicting `checkpoints.md:15/:58`'s gate-level `accept` definition — **carry-over of iter-1 #7**: `core.md` was never actually touched by the fix round despite decisions-log claiming it resolved. | Use a distinct per-section token; align `core.md:57` with `checkpoints.md`. |
| 2 | high | `asd-phase-design.md:31` | Design-system gate: no decisions-log entry on `asd-design-system` COMPLETED (matches internal implementation finding #1). | Append one entry per accepted file after the skill returns. |
| 3 | high | `sprint-lifecycle.md:209` | `ADVICE_NEEDED` emission was added to only 4 of 15 dispatchable agents (asd-ba, asd-architect, asd-ux-designer, asd-pm) — devs, test-engineer, and all 8 reviewers' signal lists omit it, so those phases can't reach the advisor through their agents' contracts, contradicting AC-6's "dispatchable by any agent". | Either add the affordance to all remaining agents, or drop the 4 per-agent copies and rely solely on `core.md:45`. |
| 4 | medium | `asd-ba.md:61` (+ architect/ux-designer) | Same-turn-resume contradiction — matches internal findings. | Match `asd-pm.md:67`. |
| 5 | medium | `sprint-lifecycle.md:217` | Consult cap unenforceable — matches internal findings. | Bind counter to the workflow. |

**Dropped (nitpick)**: `asd-pm.md:90`'s PM gate table omitting 3 rows — verified those gates run inline elsewhere, the scope note is accurate; not a real defect.

**Stalemate check**: iter-1 set (8) vs iter-2 set (5) — not identical, no stalemate. Iter-1 #1, #4, #6, #8 resolved; #7 (core.md) untouched despite being marked resolved in decisions-log; #3, #5 recur in different form; #2/#6 (new).

## Coverage summary (internal reviewers only)

External reviewer — exempt from File-coverage ledger requirement per `review-policy.md`.

## Verdict
CONCERNS: 5 (3 high, 2 medium)

## Next action
Route to `impl` review-fix mode. Flag explicitly: the decisions-log "all 8 external iter-1 findings resolved" claim needs correction — #7 (`core.md`) was never actually edited.

## Escalations
None.
