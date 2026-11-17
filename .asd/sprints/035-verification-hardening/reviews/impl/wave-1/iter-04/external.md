[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-04
- **Severity floor (this iter)**: high
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/runtime.js:1428` | Comment-boundary edits can retain stale approvals. Removing the closing delimiter of one block comment and the opening delimiter of another comments out an unchanged executable statement, yet `isCommentOnlyChange` returns true. Reproduced: JavaScript execution changed from true to false. (codex F1, wrapped CLI, severity major mapped to high) | Compare executable content across both blobs so comment-boundary changes that affect unchanged code invalidate latches; add a regression test. |
| 2 | high | `.asd/runtime.js:1420` | Blank lines are ignored unconditionally, including inside template literals. A reproduced blank-line addition changed a string's length from 2 to 3 while the change still returned comment-only. The unlexed branch similarly ignores changed hash-prefixed lines inside Python multiline strings. (codex F2, wrapped CLI, severity major mapped to high) | Check lexical context before ignoring blank or comment-prefixed lines; count string-content changes as code; cover both cases with tests. |

## Dropped findings (counts only)

- Nitpick, by category: none

## Verdict
CONCERNS: 2

## Next action
Route both findings to impl review-fix.
dropped: 0
