[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/runtime.js:997 | codex F1 (wrapped Codex CLI, gpt-6.2-sol, impl-review wave-1/iter-02): the attribution reset replaces the settings file with a new file created under default permissions. On POSIX with umask 022, a private settings.local.json can go from 0600 to 0644, exposing any credentials it contains to other local users. | Create the temporary file exclusively with restrictive permissions, preserve the original file's access permissions before renaming, and test a 0600 settings file. |
| 2 | high | .asd/sync.js:1392 | codex F2 (wrapped Codex CLI, gpt-6.2-sol, impl-review wave-1/iter-02): when git.ai_attribution is absent, sync deletes a user's existing attribution opt-out if it equals the empty commit and PR values. This can restore Claude attribution in a project that never opted into ASD management, violating AC-15's default behavior. | Record when ASD takes ownership of the attribution key and remove the empty value only when that ownership is recorded. Test an existing user opt-out with the config key absent. |
| 3 | high | .asd/skills/asd-sprint/SKILL.md:53 | codex F3 (wrapped Codex CLI, gpt-6.2-sol, impl-review wave-1/iter-02): an uncommitted edit to either tracked Claude settings file skips the entire attribution check. The other file can still re-enable attribution, and a Codex checkout loses its workspace-setting hint. Both behaviors violate AC-16. | Protect dirty files individually and always run the check under git.ai_attribution disabled so it can process clean files and emit the Codex hint. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): dropped: 0
- Nitpick, by category: none

## Verdict
CONCERNS: 3

## Next action
Orchestrator persists the return (external, floor medium) and routes each finding per impl-review. Stalemate: not triggered, since the floored set has no file:line overlap with the iter-01 ledger.
dropped: 0
