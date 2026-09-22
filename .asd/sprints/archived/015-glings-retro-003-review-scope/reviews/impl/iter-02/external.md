[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor (this iter)**: medium
- **Reviewed files**: 21/21
- **Scope manifest**: `files[]` 21, base a5f6548, head f259ed3, self-hosting exclusions

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| EXT-4 | medium | `.asd/runtime.js:448` (`surfaceCheck`) | Carry-over. `dispatches` still hardcodes Testing's extra part instead of taking the real `--test-plan` path count. The limit is now documented, but no caller threads the count through, so more than 25 test-plan paths undercount the bound. No test covers that path. | Accept the test-plan path count as an optional parameter or CLI flag and use it in place of the fixed term. Add a regression test with more than 25 paths. |

Severity mapping: codex `minor` → medium.

## Iteration-1 finding disposition (verified fresh)

- EXT-1 resolved (`draft-snapshot`, design-review step 7, tests).
- EXT-2 resolved (the in-body comment is gone).
- EXT-3 resolved (`dispatchWaves` removed).
- EXT-4 carries over, narrower.
- EXT-5 resolved (README FAQ).

## Dropped findings (counts only)

- Below severity floor: 1
- Nitpick: none

## Verdict
CONCERNS: 1

Stalemate: no. 4 of 5 are resolved, and EXT-4 is a narrower carry-over.
