[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03
- **Severity floor (this iter)**: high

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/skills/asd-sprint/SKILL.md:53 | Codex F1 (prior iter-02 P3, now partial). The status check omits untracked files, but the commit step accepts every path the checker reports as fixing. An untracked, unignored settings.local.json containing credentials can therefore enter sprint history. | Intersect the reported fixes with paths verified as clean and tracked before the check; keep local-only settings fixes out of the commit. |
| 2 | critical | .asd/runtime.js:998 | Codex F2 (prior iter-02 P1, now partial). On Windows the temporary file inherits the directory ACL and chmodSync cannot copy the original file ACL, so the temp copy and its replacement can expose settings that had tighter access controls. | Preserve the original access controls before writing any settings bytes, or warn and leave the file untouched if they cannot be preserved. |
| 3 | high | .asd/runtime.js:1002 | Codex F3 (major). If exclusive creation fails with EEXIST, cleanup deletes the pre-existing temp file anyway; a cleanup failure throws before the remaining settings check and the Codex hint. | Remove only a temp file this invocation successfully created; turn cleanup failures into warnings. |
| 4 | high | .asd/runtime.js:1012 | Codex F4 (major). The skip check compares path strings while writes follow in-repository symlinks: a clean settings.json symlinked to a dirty settings.local.json rewrites the dirty file although the checker reports it untouched. | Check the resolved target of each candidate and of each skipped path before writing; protect the resolved targets of skipped paths. |
| 5 | high | .asd/sync.js:923 | Codex F5 (major). Applying sync under disabled records a pre-existing user opt-out as ASD-owned, so switching back to enabled deletes it. An opt-out inserted by attribution-check has the opposite problem and survives re-enabling when sync never ran while disabled. | Record ownership only where ASD actually changes the value, including in attribution-check; preserve pre-existing values that already match. |

## Dropped findings (counts only)

- Below severity floor (iter wave-1/iter-03, floor high): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 5

## Next action
Orchestrator persists with floor high and routes rows at or above floor to review-fix. Stalemate: not triggered (floored iter-02 and iter-03 sets differ; P2 resolved, P1 and P3 partial).
dropped: 1
