[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-impl-review.md:52` vs `.asd/workflows/asd-phase-impl.md` step 3 | Step 52 promises an answered reviewer `question:` is "carried with that reviewer's findings into review-fix", but impl's review-fix work-set build reads only reviewer-file findings, never the decisions-log Q&A — the answer has no defined carrier into the dev payload. | Write the answer inline into the reviewer's `.md` file under its question item, or have impl step 3 pull the matching decisions-log Q&A. |
| 2 | high | `.asd/workflows/asd-phase-design-review.md:47`, `.asd/workflows/asd-phase-impl-review.md:56` | Stalemate routes to stop/continue-fixing/abort "instead of the accept/override bullets", but neither workflow maps stop/continue-fixing to the concrete next action; `external-review.md` defines only end-states. | Add explicit routing: stop → mark resolved, continue; continue fixing → keep in fix set (impl-review: review-fix; design-review: creator fix, loop). |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0
- Nitpick, by category: none

Iteration-1 findings verified resolved; no carry-over (no stalemate).

## Verdict
CONCERNS: 2
