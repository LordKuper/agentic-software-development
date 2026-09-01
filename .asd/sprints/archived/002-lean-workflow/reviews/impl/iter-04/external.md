[REVIEW-impl-external]: CONCERNS

# External Review Report
- **Phase**: impl-review
- **Iteration**: 4
- **Severity floor (this iter)**: high
- **Wrapped CLI**: codex-cli 0.150.1, ran successfully against the iteration-4 delta. Raw verdict: CONCERNS: 2.

## Kept findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `session-start.js:114` | Same all-skipped/incomplete-map edge case as quality.md#1 — independently confirmed. Real contract drift: sprint-lifecycle.md "State recovery" (edited this same diff) explicitly names this function as required to treat an absent required-reviewer key as blocking, but it doesn't. | Don't return green for an all-skipped/incomplete map; require ≥1 real APPROVE. Add a regression test for this case. |
| 2 | high | `asd-phase-impl-review.md:29-30` | Line 30 still labels `enabled` "(default)" even though line 29 correctly says absent=disabled, and review-policy.md was already fixed this sprint to say the same (with this file cited as SSoT) — the fix missed its own SSoT site. | Replace "(default)" on line 30 with the same wording already landed in review-policy.md. |

## Dropped findings (counts only)
- Below severity floor: 0
- Nitpick: none: 0

## Stalemate check
Previous set (1 high, iteration_heads fallback) vs current (2 different findings): disjoint, prior finding resolved, no stalemate.

## Verdict
CONCERNS: 2

## Next action
Route to `impl` review-fix mode.
