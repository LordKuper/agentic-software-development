[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-scope.md:48 | The repository lookup does not guarantee origin: gh prefers upstream when both remotes exist, so intake and consumer-issue closure can act on another repository's issues, violating AC-1. Codex id: none emitted (verdict item 1). Source: wrapped codex verdict, which cites github.com/cli/cli v2.90.0 pkg/cmd/factory/default.go L45-L76. | Resolve origin explicitly and use that repository for intake and consumer issue closure; add a regression covering distinct origin and upstream repositories. |
| 2 | medium | .asd/workflows/asd-phase-scope.md:48 | A marker issue renamed without the "[asd-retro] " title prefix drops out of both intake lists: retro triage requires the prefix while project triage excludes every marker, so the user never receives its disposition choice. Codex id: none emitted (verdict item 2). Source: wrapped codex verdict. | Exclude only issues that retro triage actually handles; send unmatched markers to the user as non-standard issues; cover this case with a test. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0 (the wrapper keeps every finding; `persist-review --floor` applies the floor)
- Nitpick, by category: none: 0

## Verdict

CONCERNS: 2

## Next action

The orchestrator decides each finding's route (`review-policy.md` "Autofix vs escalation"). Neither finding needs a requirement or architecture change, so the responsible fixer autofixes in review-fix mode and wave-1/iter-02 re-dispatches External Review over the changed files.
dropped: 0
