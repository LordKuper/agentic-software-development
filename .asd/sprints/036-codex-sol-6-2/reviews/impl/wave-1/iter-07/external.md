[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-07
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/sync.js:1531 | codex F1, carry-over of iter-06 P1 (partial): the symlink guard sits only in recordOwnedKeys (.asd/sync.js:758). runCheck (sync --check, line 1531) and runApply (sync --apply, line 1567) call loadSyncState (defined line 1063) before any link check, so a parse error on a linked ledger can echo text from the linked file. The attribution-check path is fixed; these two sync paths are not. | Move the isSymlink guard into loadSyncState before it reads the ledger; add regression coverage for sync --check and sync --apply over a linked ledger (tests/run.js). |

## Dropped findings (counts only)

- Below severity floor (iter 7, floor critical): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
Route F1 to review-fix. Stalemate: not detected (iter-06 set .asd/sync.js:756 differs from iter-07 set .asd/sync.js:1531).
dropped: 0
