[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-05
- **Severity floor (this iter)**: critical

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/runtime.js:977 | [codex F1] The settings write truncates the original file in place. An interruption or a failed restore can leave invalid JSON, and an untracked settings.local.json cannot be recovered from Git. | Use atomic replacement that preserves the original access controls. Warn and leave the original intact if safe replacement is unavailable. |
| 2 | critical | .asd/sync.js:760 | [codex F2] Startup writes through a linked .asd/sync-state.json, allowing the attribution check to change a file outside the project despite rejecting linked Claude settings. | Reject symlinks and junctions on the ledger path and its parent before writing. Test that the linked target stays unchanged. |
| 3 | critical | .asd/skills/asd-sprint/SKILL.md:53 | [codex F3] A partial ledger write can leave invalid JSON. The runtime returns a warning and a settings fix, then the skill can commit the damaged ledger because it selects the ledger by Git status alone. | Save the ledger atomically and make the runtime report a successful ledger update explicitly. Commit the ledger only on that signal. |

## Dropped findings (counts only)

- Below severity floor (iter 5, floor critical): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 3

## Next action
Orchestrator persists with floor critical; rows 1-3 remain. No stalemate by location (iteration 4 critical set {SKILL.md:53 x2, runtime.js:985}; this set {runtime.js:977, sync.js:760, SKILL.md:53}); prior P3 partial, carried into rows 1 and 3.
dropped: 5
