[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-05
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/runtime.js:2346 | codex F1 (external, gpt-6.2-sol): the gap-proof check stops at the first blank line. A second Added tests table with an empty Gap proof cell now passes impl-test-close, which violates AC-13. | Validate every table in Added tests, or reject additional tables while allowing prose between blocks. Add a regression case for a second table with an empty proof. |
| 2 | critical | .asd/workflows/asd-phase-impl-test.md:48 | codex F2 (external, gpt-6.2-sol): re-entry rotates struck removal rows out of the live test plan. If a later review fix proposes the same test for removal, steps 4 and 5 collect it as a fresh proposal despite the recorded rejection. | Preserve struck rows across entry rotation, and filter later proposals by the recorded rejected test identities. |

## Dropped findings (counts only)

- Below severity floor (iter 5, floor critical): 0 (the wrapper keeps every finding; persist-review applies the floor)
- Nitpick, by category: none

## Verdict
CONCERNS: 2

## Next action
Orchestrator: persist with `persist-review --floor critical` and merge with the internal reviewers' verdicts. Both kept findings are critical and in `files[]`, so the impl-review routes to review-fix (impl, review-fix mode): the responsible dev fixes F1 in `.asd/runtime.js` and F2 in `.asd/workflows/asd-phase-impl-test.md`, then the sprint re-enters impl-review via impl-test. Stalemate not triggered: the supplied iter-04 finding set holds only high findings, so its floored set at critical is empty and cannot match this iteration's set.
dropped: 0
