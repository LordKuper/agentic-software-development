[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-04
- **Severity floor (this iter)**: high

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/skills/asd-sprint/SKILL.md:53 | codex F1: the startup sync recomputes the entire release hash ledger even when the settings file is current. In a consumer repo this records local framework edits as the installed release baseline, so a later update can overwrite them without a conflict. | Use an attribution-only operation that leaves `.asd/release-manifest.json` untouched. |
| 2 | critical | .asd/skills/asd-sprint/SKILL.md:53 | codex F2: the new sync call runs before the runtime link check. Sync checks the settings file itself, so a `.claude` symlink or junction can redirect the write outside the repository. | Reject linked directories and settings paths before any startup write; cover the combined startup flow in the link test. |
| 3 | critical | .asd/runtime.js:985 | codex F3: the in-place write truncates the original settings file before writing the replacement. An interrupted write or disk error can leave invalid JSON while the error handler reports the file as untouched. | Use atomic replacement that preserves access permissions; test a failure after writing begins. |
| 4 | high | .asd/runtime.js:969 | codex F4: a read error in `settings.json` escapes the per-file handler, so `settings.local.json` is skipped and the Codex hint is lost. | Report the read error as a warning for that file and continue with the other file and the hint. |
| 5 | high | .asd/skills/asd-sprint/SKILL.md:53 | codex F5: sync replaces non-empty `attribution.commit` and `attribution.pr` values before the runtime check sees them. Its result reports the target file, so the startup flow omits the per-entry fix reports that AC-16 requires. | Capture and report each attribution change in the operation that applies it. |
| 6 | high | .asd/skills/asd-sprint/SKILL.md:53 | codex F6: a committed edit to an ASD-owned hook makes sync return `modified-foreign` with exit 0. If `attribution` is missing, the runtime check also does nothing, leaving Claude attribution enabled without a warning. | Apply attribution independently of hook reconciliation; warn whenever the setting cannot be applied. |

## Dropped findings (counts only)

- Below severity floor (iter 4, floor high): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 6

## Next action
Orchestrator persists with floor high; rows 1-6 route to review-fix. No stalemate: the floored set differs from iteration 3's (prior 4 carried over as runtime.js:969; priors 1, 2, 3 and 5 resolved).
dropped: 2
