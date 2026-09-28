[REVIEW-impl-external]: APPROVE

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0
- Nitpick, by category: none: 0

## Verdict
APPROVE

## Next action
None — wave 1 clears impl-review. Both iteration-1 findings verified resolved in this diff:
- P1 (`.asd/runtime.js`): `persistReview` now rejects a bare `APPROVE` verdict whose findings table is non-empty (new guard: `if (verdict === 'APPROVE' && findings.length > 0) fail('APPROVE verdict lists findings');`), confirmed against the diff hunk directly.
- P2 (`.asd/agents/asd-reviewer-combined.md`): new "Persistent actuality before promotion" bullet (line 24) scopes the inherited Documentation-rubric "Persistent actuality" entry to changes this sprint's diff itself makes, never drift from the not-yet-promoted implementation — resolving the unsatisfiable obligation in lite before design-promote. Confirmed present in the diff and cross-checked against `tests/run.js`'s new sprint-020 assertion enforcing exactly one such carve-out bullet, citing the correct `asd-phase-design-promote.md` step.

No stalemate: both prior findings closed (not carried over), independently corroborated by the wrapped `codex exec` pass (APPROVE, dropped_below_floor: 0, both P1/P2 marked resolved).

Files referenced:
- `.asd/sprints/020-multi-workflow-lite/reviews/impl/wave-1/iter-02/external.scope.json`
- `.asd/sprints/020-multi-workflow-lite/reviews/impl/wave-1/iter-02/eca23c748ae6fcce.diff`
- `.asd/runtime.js` (line 508)
- `.asd/agents/asd-reviewer-combined.md` (line 24)
