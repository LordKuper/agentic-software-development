[REVIEW-impl-implementation]: CONCERNS

# Review — implementation
- **Phase**: impl-review
- **Iteration**: 2 (floor = medium)

## Findings
| # | Severity | AC/Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | AC-6 (Task 15) · `asd-phase-impl-test/SKILL.md:5` | Same impl-test Write/Edit gap as quality.md#1 — independently confirmed. | Add Write Edit; sync.js --apply. |
| 2 | high | AC-6 (Task 10) · `sprint-lifecycle.md:138` | Design-promote step 2 still mandates "runs likec4 build if applicable" — the sole surviving build mandate after Task 10 forbade it everywhere else. | Delete the clause or repoint at the build-to-view command. |
| 3 | medium | AC-6 (Task 18) · `sprint-lifecycle.md:203` vs `asd-phase-pr.md:38` | Rule doc and workflow define the tests/lint skip against two different sources (git-log-based vs the recorded HEAD field in test-plan.md) — they diverge whenever impl-test's step 9 commits after step 7. | Restate sprint-lifecycle.md:203 in terms of the Suite-run HEAD field. |

## Coverage summary
`files: 51/51 checked, 0 n/a · rules: 5/5, 3 findings`

## Verdict
CONCERNS: 3 (2 high, 1 medium)

## Next action
Route to `impl` review-fix mode.

## Escalations
None.
