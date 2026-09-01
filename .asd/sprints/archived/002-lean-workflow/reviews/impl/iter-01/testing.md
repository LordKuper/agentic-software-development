[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | low | `test-plan.md` Task 5 row; `.asd/templates/t_state.json` | Task 5 deleted two keys from the repo's only machine-parseable template, but nothing checks the file still parses (`sync.js --check` is blind to `.asd/templates/`). | Add a 3-line `JSON.parse` guard to `tests/run.js` for `.asd/templates/*.json`, or explicitly record why the "no template content" charter outweighs it. |
| 2 | low | `test-plan.md` rows for Task 5, Task 9, Task 13, Task 14 | Three `none`/`keep` decisions are correct but rest on Reason cells that misstate what the tested code actually does (verified independently). | Correct the three Reason cells at the next impl-test entry (amend, don't rewrite). |

## Coverage summary (internal reviewers only)

**Summary**: `files: 59/59 checked, 0 n/a · rules: 9/14, 2 findings` (3 rule rows n/a: R4 no defect to prove fail-first, R6 no new/modified code path, R14 custom-common-rules has no testable constraint)

**n/a rows**:
| Item | Reason |
|---|---|
| R4 Regression proof | no `D-N` defect recorded this entry |
| R6 Edge cases | no new/modified code path exists this sprint |
| R14 `custom-common-rules.md` | vocabulary/framing only, no testable constraint |

**Findings rows**:
| Rubric item | Finding |
|---|---|
| R1 Risk fit | finding #1 |
| R3 No-test decisions | finding #2 |

## Verdict
CONCERNS: 2

## Next action
Route to `impl` review-fix mode; both are test-plan.md text corrections plus an optional test-runner guard addition.

## Escalations
None.
