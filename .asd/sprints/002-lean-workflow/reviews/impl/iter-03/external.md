[REVIEW-impl-external]: CONCERNS

# External Review Report
- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor (this iter)**: high
- **Wrapped CLI**: codex-cli 0.150.1, ran successfully against the iteration-3 delta (33 files, iteration_heads-based diff confirmed working). Raw verdict: CONCERNS: 1.

## Kept findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-impl-review.md:24` | Same iteration_heads absent-key gap as quality.md#1 — independently confirmed by the wrapped CLI. Sprint states created before this schema change lack the key; literal substitution yields an empty diff, silently APPROVEing unreviewed code under `backward_compat: migration`. | Fall back to full base-branch diff when the key is absent, initialize iteration_heads, record HEAD for subsequent iterations. |

## Dropped findings (counts only)
- Below severity floor: 0
- Nitpick: none: 0

## Stalemate check
Previous set (1 medium) vs current (1 high, different root cause): not identical, no stalemate. Prior iter-02 finding (HEAD-skip dead code) confirmed resolved.

## Verdict
CONCERNS: 1

## Next action
Route to `impl` review-fix mode.
