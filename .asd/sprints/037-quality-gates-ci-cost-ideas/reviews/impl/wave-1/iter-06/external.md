[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-06
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/workflows/asd-phase-impl-test.md:27 | codex F1 (external wrapped-CLI review): step 4 re-entry bullet says the carried-forward review-fix removal rows are written as live `Removed tests` rows before rotation. The rotation rule in artifact-layout.md requires rotation before any new row and leaves only struck rows live, so following the rule can leave step 5 with no live proposal to collect. | Read the review-fix removal requests, rotate the prior rows, then write the eligible proposals into live `Removed tests` before step 5. |
| 2 | critical | .asd/rules/artifact-layout.md:207 | codex F2 (external wrapped-CLI review): a header-only second `Added tests` table in a rotated segment now makes `impl-test-close` refuse with a malformed-separator error. The segment edit exception covers only a missing `Gap proof`, so the tester has no authorized repair even when every data row carries a proof. | Permit targeted repairs of structural `Added tests` errors reported by `impl-test-close`, and state the same exception in asd-phase-impl-test.md "Rules". |

## Dropped findings (counts only)

- Below severity floor (iter 6, floor critical): 0 (the wrapper keeps every finding; `persist-review --floor critical` applies the floor)
- Nitpick, by category: none: 0

## Verdict

CONCERNS: 2

No finding needs a requirements change or an architecture change, so the verdict is not FAIL. The stalemate check did not trigger: the current floored set {asd-phase-impl-test.md:27, artifact-layout.md:207} is disjoint from the iter-05 set {.asd/runtime.js:2346, asd-phase-impl-test.md:48}. codex reports both iter-05 findings as resolved (P1, P2).

## Next action

Persist this return with `persist-review --phase impl --reviewer external --floor critical`. Both kept findings are critical and neither location is a test file, so the "Minor test-only findings" route does not apply and the iteration routes to review-fix. Each fixer re-checks the cited line at HEAD before applying anything.
dropped: 0
