[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .asd/workflows/asd-phase-pr.md:11 | If the branch push fails or the process stops after `state.json.pr` is written, a resumed sprint enters merge mode with `pr.state="open"` even though the remote branch may lack `pr.number`. Merging then leaves the base copy unable to detect the merged-unclosed sprint. (codex finding, mapped major->high? No: reported as medium by codex) | Before merge, verify the remote PR branch contains the committed `state.json.pr` update. If it does not, push it and confirm publication before proceeding. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0 reported by codex
- Nitpick, by category: none

## Stalemate
Not triggered. The iter-1 kept set was runtime.js:670, runtime.js:387 and README.md:238. The iter-2 set is one finding at asd-phase-pr.md:11, so the sets differ. Codex did not re-report the iter-1 findings.

## Verdict
CONCERNS: 1

## Next action
The creator should fix the pr-publish ordering or verification in `.asd/workflows/asd-phase-pr.md`, then re-run impl-review iteration 3. The floor for iteration 3 is high+.
