[REVIEW-impl-external]: CONCERNS
# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/rules/git-strategy.md:77 | codex F1 (codex exec, gpt-6.2-sol, read-only): Scope asks the user to approve a PR from an explicitly resolved repository, then waits for checks and merges using a bare PR number. If the GitHub CLI defaults to a different repository, the workflow can merge a different PR with the same number. | Pass the repository shown at the scope gate to both checks-wait and gh pr merge. Confirm the merge in that repository. |
| 2 | high | .asd/runtime.js:2327 | codex F2 (codex exec, gpt-6.2-sol, read-only): Translated test plans bypass gap-proof validation when the Added tests heading is translated, then fail every green close when the Suite run heading is translated. Both paths were reproduced in memory. | Identify the sections and proof column using stable machine markers that survive translation. |
| 3 | high | .asd/skills/asd-init/SKILL.md:70 | codex F3 (codex exec, gpt-6.2-sol, read-only): The suggested Go duration command is go test -v, which runs only the current package. Impl-review uses it in place of the configured full-suite command, so failures in other packages can pass the terminal gate. | Derive test_durations from the configured test command, retaining package targets, options, and setup. Omit the override when the reporting flag cannot be added safely. |
| 4 | high | .asd/runtime.js:2257 | codex F4 (codex exec, gpt-6.2-sol, read-only): Context checks measure only registered keys. Init omits an absent reliability checklist, so a checklist created later by scope can grow without a ceiling or a failed check. | Require a ceiling for each currently present project rule file and reliability checklist, and record a missing ceiling when the file is introduced. |
| 5 | high | .asd/workflows/asd-phase-impl-review.md:82 | codex F5 (codex exec, gpt-6.2-sol, read-only): The terminal runner overwrites the impacted-run record before red triage needs its selector and HEAD. The same overwrite can erase the line delta and allowance, leaving retro without the evidence that triggers a suite-revision proposal. | Preserve the last green impacted run's selector and HEAD and carry forward its line delta and allowance when recording the terminal result. |
| 6 | medium | .asd/workflows/asd-phase-impl-test.md:33 | codex F6 (codex exec, gpt-6.2-sol, read-only): Temporary tests are first proposed for removal in step 7, after steps 5 and 6 collect and authorize removals. An out-of-scope temporary test therefore misses the only removal gate in that entry. | Discover temporary tests before step 5 and classify them by the existing change-surface rule. |
| 7 | medium | .asd/workflows/asd-phase-scope.md:49 | codex F7 (codex exec, gpt-6.2-sol, read-only): The open-PR intake stops at 200 and provides no continuation. Repositories with more than 200 open PRs leave some PRs without a scope disposition. | Fetch all pages before presenting the PR dispositions. |
| 8 | medium | .asd/workflows/asd-phase-impl-test.md:27 | codex F8 (codex exec, gpt-6.2-sol, read-only): Re-entry rotates newly added review-fix rows out of the live test plan before impl-test-close checks gap proofs. Those rows can retain an empty proof without a mechanical refusal. | Validate the rows before rotating them or pass the newly rotated segment to the close validator. |
| 9 | medium | .asd/runtime.js:2343 | codex F9 (codex exec, gpt-6.2-sol, read-only): The gap-proof validator accepts unresolved template text as evidence because it checks only whether the cell is non-empty. A row with a proof placeholder passed the check in memory. | Reject placeholders and require one of the two recorded proof forms. |
| 10 | medium | .asd/runtime.js:2018 | codex F10 (codex exec, gpt-6.2-sol, read-only): Suite durations are rounded before the baseline comparison. Three archived runs of 1.49 seconds and a current run of 2 seconds incorrectly trigger the 1.5× threshold. | Compute the median and threshold using milliseconds and round only the reported values. |
| 11 | medium | tests/run.js:65 | codex F11 (codex exec, gpt-6.2-sol, read-only): A test that throws null or rejects with null is logged as passing because null also represents success. An in-memory runner check confirmed exit 0. | Track whether the test threw independently of the thrown value. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0 (the wrapper keeps every finding; `persist-review --floor` applies the floor)
- Nitpick, by category: none

## Verdict
CONCERNS: 11

## Next action
Orchestrator persists this return with `persist-review --phase impl --reviewer external --floor low` into `reviews/impl/wave-1/iter-01/external.md`, then routes the 11 findings.
dropped: 0
