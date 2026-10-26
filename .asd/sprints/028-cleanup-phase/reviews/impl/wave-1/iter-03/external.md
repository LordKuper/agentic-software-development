[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-cleanup.md:25 (codex F1, major) | Step 5 runs the `commands.yaml` build and the impacted tests, but never the configured lint command. The only lint-like check is `git diff --cached --check` in step 4. A consumer project's ESLint failure therefore cannot block cleanup, which violates AC-5. Step 6's record template still claims `verified <build, lint, tests @sha>`. | Run the configured lint command during step 5 verification and handle a failure like a build or test failure. Fix the matching lifecycle rule and the step 6 record wording so they agree. |
| 2 | high | .asd/workflows/asd-phase-cleanup.md:23 (codex F2, major) | The re-entry recovery restores every uncommitted path to the checkpoint sha. If an earlier committed removal touched the same file before the interruption, that restore reinstates the removal and stages a change against current HEAD. This contradicts "keep the committed removals". | Discard unfinished edits against current HEAD (restore from `HEAD`, not the checkpoint sha). Use the checkpoint sha only for the deliberate `chore(cleanup): revert <what>` path in step 5. |
| 3 | medium | .asd/workflows/asd-phase-design.md:45 (codex F3, minor) | The Re-entry rule treats a section holding content and no `{{` placeholder as locked in. Sections are written before `Lock in` is requested. An interruption while awaiting that answer makes re-entry skip the unanswered decision silently. | Persist explicit lock-in evidence after approval, such as a decisions-log line. On re-entry, resume any written section that lacks it at its pending Lock in or Revise decision. |

## Dropped findings (counts only)

- Below severity floor (iter 3, floor low): 0
- Nitpick, by category: none: 0

## Verdict
CONCERNS: 3

## Next action
Route the three findings to review-fix. The fixer should re-verify each premise at HEAD before applying anything.
