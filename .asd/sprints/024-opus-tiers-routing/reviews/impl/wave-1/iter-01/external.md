[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/rules/providers.md:123` | Codex finding F1 (minor). Plan D3 requires the derived Material risk declaration to be recorded, but it is not durably recorded. `task_routing[id].reason` keeps only the routing outcome, and the routing-log formats hold only tier and HEAD. The declaration and its verifying evidence are lost after dispatch. | Require the derived Material risk declaration and its named verification to be recorded in the decisions-log routing entry. |
| 2 | high | `tests/run.js:7568` | Codex finding F2 (major). The own-risk routing assertion changed only its message. The old Task-inheritance sentence still contains every token the predicate requires. Restoring inherited risks while keeping the separate suite rule would pass, so the claimed AC-3 regression check does not hold. | Check the declaration source directly, and show the check rejects the old inheritance rule. |
| 3 | high | `tests/run.js:7603` | Codex finding F3 (major). The AC-6 amendment check verifies only that "Scope amendment" is cited. It does not check sequencing or exclusion of completed Tasks. Removing the initial-mode continuation and the unticked-task filter, while keeping the citations, passes every assertion. That leaves the lost-amendment and repeated-task risks uncovered. | Assert that continuation runs before phase exit and that completed Tasks are excluded. Use targeted mutations that preserve the citations. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 3

## Next action
The orchestrator routes these to the impl creator for a fix round (F1 to the providers.md owner; F2 and F3 to the tests/run.js owner). Then run iteration 2 at the medium floor.
