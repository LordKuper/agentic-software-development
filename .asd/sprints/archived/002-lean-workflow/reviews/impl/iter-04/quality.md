[REVIEW-impl-quality]: CONCERNS

# Review — quality
- **Phase**: impl-review
- **Iteration**: 4 (floor = high)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `session-start.js:111-115` (`lastReviewVerdict`) | Returns 'green' for an all-skipped or partial verdict map (reachable during the step-5→step-8 dispatch window, or on an interrupted/resumed review round) — pre-fix this correctly fell through to 'mixed' (safe direction). Contradicts sprint-lifecycle.md:226's own stated contract that this function must treat an absent required-reviewer key as blocking. | Require ≥1 genuine APPROVE before returning green: `verdicts.some(approved) && verdicts.every(v => approved(v) || isSkipped(v))`. Only UI/Performance are skippable, so a truly green iteration always has ≥1 APPROVE. Extend the regression test with all-skipped and partial-map cases. |

## Coverage summary
`files: 20/20 checked, 0 n/a · rules: 21/23 pass, 2 n/a, 1 finding`

## Verdict
CONCERNS: 1

## Next action
Route to `impl` review-fix mode.

## Escalations
None.
