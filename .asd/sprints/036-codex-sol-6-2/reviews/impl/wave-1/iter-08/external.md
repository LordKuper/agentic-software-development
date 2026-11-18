[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-08
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/sync.js:1067 | [codex F1] Both sync commands read the release manifest through a linked `.asd` directory before reaching the link guard. A JSON parse error can expose text from that file on stderr. | Run the guarded ledger load before loading the release manifest in both commands, and cover a linked `.asd` directory whose release manifest is malformed. |

## Dropped findings (counts only)

- Below severity floor (iter 8, floor critical): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
Route to review-fix. Prior P1 (.asd/sync.js:1531) resolved; the floored set differs from iter-07, no stalemate.
dropped: 1
