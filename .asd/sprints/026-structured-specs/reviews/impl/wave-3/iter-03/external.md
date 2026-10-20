[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-3/iter-03
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .asd/runtime.js:1348 | Codex finding 1 (codex severity: minor). Any backtick or tilde fence line toggles the code-block state, so inside a four-backtick block a three-backtick example line wrongly closes the block; a heading in the example that follows is then read as a real heading, truncating `section` output and the `context` bundle. | Record the opening fence's character and length; close only on a fence of the same character and at least that length with nothing but whitespace after it. Add regression tests for shorter and mixed-character fences. |

## Dropped findings (counts only)

- Below severity floor (iter 3, floor low): 0
- Nitpick, by category: none: 0

## Verdict
CONCERNS: 1

## Next action
Route finding 1 to impl review-fix; re-review next iteration.
