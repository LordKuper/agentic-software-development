[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-2/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: n/a

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .asd/workflows/asd-phase-impl-review.md:67 | Codex finding F1 (minor). Step 9's red-test-defect branch has `asd-tester` commit the fix with the trailer `impl-review <id> suite` and re-run the step. The re-run keeps the same wave/iteration id, so it reuses the same routing key. That can trigger the `priorTier` no-downgrade clamp on a later test-only delta. It contradicts AC-9 and plan D9, which require a fresh id per run. The AC-9 test checks citations only and does not cover this retry path. I read line 67 and confirmed the same-id commit-trailer wording. I did not re-check AC-9 or plan D9 myself. | Give each terminal-suite run a distinct routing key. Route each run's own delta without the previous run's `priorTier`. Verify the red-test-defect rerun path. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
Route to impl review-fix mode for finding 1. After that fix and impl-test, wave 2 re-enters impl-review at iteration 2 (floor medium).
