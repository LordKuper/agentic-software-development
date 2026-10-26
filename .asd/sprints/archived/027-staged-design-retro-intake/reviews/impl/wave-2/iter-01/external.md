[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-2/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .asd/rules/review-policy.md:110 | codex finding 1 (codex label: minor). A resolved memory-only FAIL keeps its FAIL verdict. When low-severity test findings remain, the "no FAIL verdict" predicate then forces an impl and re-review cycle, which violates AC-10. | Exclude fully resolved FAIL reports from this predicate and add a mixed-findings regression test. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
Route finding 1 to review-fix: the responsible dev re-reads the cited rule at `HEAD`, confirms the premise, then fixes the predicate and adds the regression test.

Codex ran only syntax checks and isolated filter and parser checks, and all of them passed. It skipped the full `node tests/run.js` suite because that suite runs git and writes fixtures, which the read-only run forbids.
