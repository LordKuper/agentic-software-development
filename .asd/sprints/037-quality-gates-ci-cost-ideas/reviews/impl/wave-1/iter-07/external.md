[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-07
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/rules/artifact-layout.md:207 | codex F1 (external wrapped-CLI review): a malformed `Added tests` table separator, or a missing `## Added tests` heading, makes `impl-test-close` refuse the rotated segment without naming a row. The current exception permits only a row edit, so the tester has no authorized repair for either failure. Cited line verified: 207 is the Rotation paragraph. | Permit the smallest repair to the rotated `Added tests` section that clears the refusal, including heading and table-structure repairs, and state the same exception in asd-phase-impl-test.md "Rules". |
| 2 | critical | .asd/workflows/asd-phase-impl-test.md:60 | codex F2 (external wrapped-CLI review): the code-defect exit runs the same `Added tests` validation as the green exit, but Dispatch authorizes the repair tester only for a step 10 refusal. A malformed rotated segment can leave step 9 with `test_defects_pending` set and the entry still open. Cited line verified: 60 is the `impl-test-close` refusal bullet. | Authorize the repair dispatch and the close retry at both exits, with write scope covering the live plan or the rotated segment that failed validation. |

## Dropped findings (counts only)

- Below severity floor (iter 7, floor critical): 0 (the wrapper keeps every finding; `persist-review --floor critical` applies the floor)
- Nitpick, by category: none: 0

## Stalemate check

Not triggered. The iter-06 floored set was {asd-phase-impl-test.md:27 critical, artifact-layout.md:207 critical}. The iter-07 floored set is {artifact-layout.md:207 critical, asd-phase-impl-test.md:60 critical}. The sets differ in one location and one message, so they are not identical. codex reports the iter-06 P1 (asd-phase-impl-test.md:27) as resolved, and the iter-06 P2 (artifact-layout.md:207) as partial: the exception covers row errors but not table- or section-level refusals.

## Verdict

CONCERNS: 2

Both findings are critical and fixable by canon edits within the same workflow. Neither needs a requirements, contract or architecture change, so the verdict is not FAIL.

## Next action

Persist this return with `persist-review --phase impl --reviewer external --floor critical`. Both kept findings are critical and their locations are not test files, so the "Minor test-only findings" route does not apply. The iteration routes to review-fix. Each fixer re-reads the cited line at HEAD before applying anything. Note for the orchestrator: iteration 7 is the last one under the critical floor the payload supplied. config.yaml carries `iterations_critical: 3`, not the default 10, so confirm the cap you apply. I did not recompute the floor.
dropped: 0
