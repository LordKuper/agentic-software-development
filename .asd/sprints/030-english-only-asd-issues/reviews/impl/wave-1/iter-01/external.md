[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/skills/asd-sprint/SKILL.md:61 | The mandatory rotation command (`rotate-decisions`) runs before the initial scope delegation. Scope is the step that creates the sprint folder and `state.json`. `rotateDecisions` therefore throws ENOENT and blocks new-sprint startup. Codex reproduced this with an in-memory filesystem and did not rerun the full suite. Source: codex finding 1, severity `major`. | Exempt the initial scope delegation from the rotation until state exists. Add a new-sprint startup regression test. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
The responsible dev resolves finding 1 in review-fix mode. Then impl-test runs and the wave re-enters impl-review at iteration 2.
