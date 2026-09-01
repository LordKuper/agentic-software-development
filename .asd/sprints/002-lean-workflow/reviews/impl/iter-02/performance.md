[REVIEW-impl-performance]: CONCERNS

# Review — performance
- **Phase**: impl-review
- **Iteration**: 2 (floor = medium)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `asd-phase-impl-review.md:28` + `review-policy.md:138` + `t_config.yaml:49` | P-9's savings still don't reach any install including this repo — the field is absent from this repo's own config.yaml, confirmed by this dispatch running full fan-out again. | Add `scoped_fan_out: enabled` to this repo's own config.yaml; add a CHANGELOG migration note for other consumers. Do NOT flip the fail-open default. |
| 2 | medium | `asd-phase-pr.md:38` + `t_test-plan.md:53` + `asd-phase-impl-test.md:49` | HEAD-equality skip still unreachable — the recording commit (impl-test step 7's own write) plus subsequent phase-transition commits always move HEAD past the recorded sha before pr-phase checks it. Same root cause External found independently. | Make the predicate content-scoped: skip when `git diff --quiet <recorded HEAD>...HEAD -- <code/test pathspec>` is empty, not sha-equality. |

## Coverage summary
`files: 41/51 checked, 10 n/a · rules: 4/8, 2 findings`

## Verdict
CONCERNS: 2

## Next action
Route to `impl` review-fix mode. Neither reverses the iter-01 fixes, both refine them.

## Escalations
None.
