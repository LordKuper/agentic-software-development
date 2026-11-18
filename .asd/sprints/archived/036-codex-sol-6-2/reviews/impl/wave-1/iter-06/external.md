[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-06
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/sync.js:756 | [codex F1, severity critical] The ledger is read and parsed before the symlink guard runs. A parse error can include text from a linked file, and the attribution check relays that error. | Reject a linked ledger or parent directory before loading the ledger. |

## Dropped findings (counts only)

- Below severity floor (iter 6, floor critical): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
Orchestrator persists with floor critical; row 1 routes to review-fix. No stalemate: the iter-05 floored set (runtime.js:977, sync.js:760, SKILL.md:53) differs from this one (sync.js:756).
dropped: 3
