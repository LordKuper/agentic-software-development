[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-design-review.md:42` | Step 9 "Reviewer questions first" forwards the answer only "to any creator dispatch below"; the "All APPROVE or latched → DoD met" branch has no re-evaluation. A reviewer returning `APPROVE` with an Escalations question can have it answered and the phase still latch/complete on the original `APPROVE`. | Make the APPROVE/latched branch conditional on no answered question that changes the verdict, or require the reviewer to re-emit a verdict after the answer; check the mirrored impl-review step 8. |
| 2 | high | `.asd/rules/sprint-lifecycle.md:321,323` (`ADVICE_NEEDED` steps 4 and 6) | `ADVICE_NEEDED` emitters include reviewers, yet steps 4/6 tell "the consulting agent" to "return `QUESTION`" on advisor `FAILED`/cap — which the reviewer question carrier forbids (bare `QUESTION` reads as interrupted). | Add a reviewer carve-out in steps 4/6 pointing to the Escalations carrier, or state "returns `QUESTION`" means routing per its own agent-type contract. |
| 3 | medium | `README.md:211` | "Dev and Tester carry `Bash` unrestricted within project scope (build/lint/test/git commands from `commands.yaml`)" contradicts `asd-dev.md`: limited to `commands.yaml` plus `git add`/`git commit`, never the `test` command. | Reword to match each agent's actual grant (Dev never runs `test`; Tester owns it). |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0

## Verdict
CONCERNS: 3
