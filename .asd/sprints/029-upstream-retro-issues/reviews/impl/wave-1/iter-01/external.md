[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**:

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-scope.md:43 | codex finding 1 (source: codex exec, severity major). A duplicate of a retro-backlog.md row is closed with `--duplicate-of`. That flag takes only a GitHub issue number or URL, so a backlog row can't satisfy it and this required triage branch fails. | For backlog duplicates, close with reason duplicate and a comment linking the backlog evidence. Reserve `--duplicate-of` for issue originals. |
| 2 | high | .asd/rules/git-strategy.md:91 | codex finding 2 (source: codex exec, severity major). Post-release issue reads and closes omit `-R`, although scope sources issues from the manifest repository. If the `gh` default repository differs, an unrelated issue with the same number can be closed, or the intended issue is skipped. | Pass the manifest repository explicitly (`-R`) to the post-release issue commands and to the matching release-retry probes. |
| 3 | medium | tests/run.js:8667 | codex finding 3 (source: codex exec, severity minor). The new contract test passes even when the consumer-content validation is removed and creation failures are changed to block retro. So it doesn't protect the publication privacy check or the AC-3 skip-and-complete behavior. | Add assertions covering the publication privacy check and the AC-3 skip-and-complete behavior. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 3

## Next action
Route the 3 findings to impl review-fix. Re-check each cited site at current HEAD before applying. Finding 2 needs a consumer search: every site that issues post-release `gh issue` commands, plus the release-retry probes. Re-run `node tests/run.js` after the fixes.
