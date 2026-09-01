[REVIEW-impl-documentation]: CONCERNS

# Review — documentation
- **Phase**: impl-review
- **Iteration**: 3 (floor = high)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-impl-review.md:29-30`, `review-policy.md:138`, `README.md:216`, `CHANGELOG.md:8` | `review.scoped_fan_out`'s absent-key default is stated two contradictory ways: the operative dispatch rule + CHANGELOG say absent=disabled=full fan-out; three other homes say "enabled, the default". An orchestrator resolving from the wrong home silently skips reviewers on a config that never opted in. | Make `asd-phase-impl-review.md` step 5 the SSoT; drop "(default)" there is correct already, fix the other 3 to say "seeded enabled by asd-init for NEW projects; absent from an existing config means disabled". |

## Verified this iteration (all pass)
- `asd-phase-impl-test/SKILL.md` genuinely has Write+Edit (4th and final confirmation).
- `asd-phase-impl-review/SKILL.md` genuinely has Bash.
- `iteration_heads` documented consistently between t_state.json and sprint-lifecycle.md.
- artifact-layout.md section reorder breaks no cross-reference (all canonical citations use section names, not line numbers).

## Coverage summary
`files: 33/33 checked, 2 n/a · rules: 4/8, 2 findings mapped to #1`

## Verdict
CONCERNS: 1

## Next action
Route to `impl` review-fix mode — 3-line wording fix, no escalation.

## Escalations
None.
