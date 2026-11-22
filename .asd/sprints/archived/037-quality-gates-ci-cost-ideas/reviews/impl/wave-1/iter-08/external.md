[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-08
- **Severity floor (this iter)**: critical (user-overridden cap; floor pinned at critical per review-policy "Iteration severity floor")

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/workflows/asd-phase-impl-test.md:60 | codex F1 (codex exec, impl-review wave-1 iter-08): Both exits defer close-refusal handling to Rules, which covers Added tests and missing allowances. The runtime also refuses a missing or duplicate current Entry log row at either exit and a missing Suite run heading at step 10 even when no allowance is required. Those refusals can leave the entry open, with test_defects_pending already set on the step 9 path. | Route live-plan validation refusals to the base tester with the --test-plan path, including Entry log and Suite run repairs, then retry the close. |

## Dropped findings (counts only)

- Below severity floor (iter 8, floor critical): 0 (the wrapper keeps every finding; `persist-review --floor critical` applies the floor)
- Nitpick, by category: none reported by codex

## Stalemate

Not triggered. Iter-07 floored set {artifact-layout.md:207 critical; asd-phase-impl-test.md:60 critical} differs from the iter-08 set {asd-phase-impl-test.md:60 critical}. Not identical, so no stalemate FAIL.

## Verdict

CONCERNS: 1 finding (critical). The fix is a routing and repair change inside the impl-test workflow, with no requirement or architecture decision, so FAIL does not apply.

## Next action

Impl-review routes the single kept finding to review-fix (impl). It is not a minor test-only finding (location is a workflow file, not a test path). The responsible dev or the orchestrator edits asd-phase-impl-test.md so both close exits route live-plan refusals (Entry log, Suite run, Added tests, heading, table structure) to the base tester with the test-plan path, then re-enters impl-review.
dropped: 0
resolved: 1 — cap-accept, 2026-11-18
