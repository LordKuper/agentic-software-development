[REVIEW-impl-external]: CONCERNS

# External Review Report
- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor (this iter)**: medium
- **Wrapped CLI**: codex-cli 0.150.1, ran successfully against the iteration-2 delta (self-hosting pathspec confirmed working). Raw verdict: CONCERNS: 1.

## Kept findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `asd-phase-impl-test.md:49` (interacts with `asd-phase-pr.md:38`) | Step 7 records HEAD into test-plan.md's Suite run before that edit is committed; the recording commit itself (plus phase-transition commits) then moves HEAD past the recorded sha, so the pr-phase "HEAD equal → skip" branch can never fire. Fail-safe (always reruns) but dead code. | Compare a path-scoped diff against the recorded sha instead of raw equality, or record the sha in a way that survives the recording commit. |

## Dropped findings (counts only)
- Below severity floor: 0
- Nitpick: none: 0

## Stalemate check
Previous set (11 findings) vs current (1): not identical, no stalemate. All 10 other prior findings confirmed resolved by direct file inspection.

## Verdict
CONCERNS: 1

## Next action
Route to `impl` review-fix mode.
