[REVIEW-impl-testing]: CONCERNS

## Findings

| ID | Severity | Location | AC / row | Finding | Required action |
|---|---|---|---|---|---|
| T-01 | medium | `test-plan.md` — regression-rationale row; `tests/run.js` — six added AC-labelled checks | AC-1–AC-7; fail-first proof | The plan acknowledges that production preceded the regression tests and records neither a failing pre-fix run nor equivalent mutation proof. Statements that assertions target former defects are rationale, not executable evidence that each check detects its claimed regression. This violates the fail-first requirement. | For each added regression check, temporarily restore or mutate the relevant faulty condition, record the expected failure, then restore HEAD and record the passing run in `test-plan.md`. |

Coverage summary: 19/19 scoped files and 11/11 testing rubric items resolved.

N/A: removals — none; stub resolution — no touched stub; manual verification — no visual/live behavior; flaky annotation — no flaky pattern.
