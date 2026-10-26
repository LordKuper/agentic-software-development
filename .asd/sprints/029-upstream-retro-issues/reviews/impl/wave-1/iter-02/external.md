[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium
- **Unreviewed files**:

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-retro.md:36 | codex finding 1 (source: codex exec, severity major). The consumer `gh issue create ... -t "[asd-retro] <guardrail cut to 80 chars>"` step leaves the title's shell-safe character rule to `docs/architecture/tech-reference/gh-2.90.md`, which `.asd/release-manifest.json` `managed_paths` does not ship, so a consumer never receives the rule and backticks in a guardrail title can become command substitution inside the double-quoted `-t "..."`. | State the title-sanitisation rule in the shipped workflow, or cite a shipped `.asd/` rule instead of the `docs/` file. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0
- Nitpick, by category: none

## Prior findings

- 1 (scope triage `--duplicate-of` with a backlog-row original): resolved.
- 2 (missing `-R` on post-release gh issue calls): resolved.
- 3 (contract test missing privacy-check and skip-and-complete asserts): resolved.

## Verdict
CONCERNS: 1

## Next action
Route finding 1 to review-fix, then run iteration 3.
