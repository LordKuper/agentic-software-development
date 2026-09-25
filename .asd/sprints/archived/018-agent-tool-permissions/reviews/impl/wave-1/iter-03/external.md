[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03
- **Severity floor (this iter)**: high
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-impl-review.md:52` (same gap in `asd-phase-design-review.md` step 9) | A reviewer may return `CONCERNS` carrying only a `question:` item and no finding. After the answer is recorded, "Any unresolved finding remains" has nothing to route, yet the recorded `CONCERNS` still blocks "all APPROVE or latched" — the roster can neither pass nor route to review-fix. | State what happens when a reviewer's only content was an answered question and no finding remains (e.g. treat a zero-finding, all-answered `CONCERNS` report as satisfied for aggregation), in both workflows. |
| 2 | high | `.asd/workflows/asd-phase-design-review.md:47`, `.asd/workflows/asd-phase-impl-review.md:56` | On a stalemate FAIL, **stop** marks findings "resolved without fix" and routing continues, but nothing changes `verdicts["iter-NN"].external` from `"FAIL"`; `sprint-lifecycle.md` "State recovery" treats a bare `FAIL` as blocking, so DoD aggregation and the pr open-mode check still block after "stop". | State what value **stop** writes into `verdicts["iter-NN"].external` (or how aggregation treats it) so DoD and the pr gate agree with "routing continues". |

## Dropped findings (counts only)

- Below severity floor (iter 3, floor high): 0
- Nitpick, by category: none

Iteration-2 P1 resolved; P2 partially resolved (effects defined, completion path missing → finding 2; issue set narrowed, not a stalemate).

## Verdict
CONCERNS: 2
