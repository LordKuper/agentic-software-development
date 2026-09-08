[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor (this iter)**: high
- **Wrapped provider**: codex, awaited inside this dispatch, run completed.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| X-1 | high | `.asd/workflows/asd-phase-design-review.md:40-42`; mirror `.asd/workflows/asd-phase-impl-review.md:48-50` | The "Late duplicate return" bullet added this delta is nested under step 8a/7a, "**Interrupted dispatch / split dispatch** — internal reviewers only". A reader applying that header's scope to every sub-bullet concludes late-duplicate handling excludes External Review — contradicting `review-policy.md:144`'s explicit carve-out ("holds for any replaced dispatch, External Review included"), which guards the exact scenario AC-14 exists for: sprint 008 iteration 5's interrupted external dispatch carrying a verified critical finding. The bullet's citation does defer scope to the rule, so behaviour is not broken if the pointer is followed — but the structural placement invites the misreading in the one area with a documented prior incident. | Move the bullet out of the "internal reviewers only"-scoped step, or put a scope override on the bullet itself ("— External Review included, per `review-policy.md`'s carve-out"), in both workflows. |

## Dropped findings (counts only)

- Below severity floor (iter 3, floor high): 0
- Nitpick: none

## Stalemate check

Iteration 2's sole finding — `asd-phase-impl.md:61`'s dev/tester fix-chain concurrency ambiguity — was verified against the current file text: **resolved**. Steps 5 and 6 now unambiguously serialize the two chains, allowing exactly one in-flight agent across the whole fix round. Not a stalemate, not a third occurrence.

## Verdict

CONCERNS: 1 (high)

## Next action

Route to `impl` review-fix mode: scope the late-duplicate binding in both review workflows so it unambiguously includes External Review, consistent with `review-policy.md:144`.

## Escalations

None.
