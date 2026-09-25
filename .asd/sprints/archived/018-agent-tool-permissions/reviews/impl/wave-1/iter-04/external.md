[REVIEW-impl-external]: FAIL

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-04
- **Severity floor (this iter)**: high
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md:16` (rule: `.asd/rules/review-policy.md:154`) | "No finding, no question" makes the out-of-policy-payload refusal path unsatisfiable: a reviewer told to do something outside its tool policy has a dispatch-level problem with no code finding for its `question:` to name, yet the memory (and `providers.md` "Declared tool policy") route it through the question carrier. | Have the reviewer record the refusal as a finding (location = the dispatch payload) that the question names, or state the refusal as a named exception in `review-policy.md`. |
| 2 | high | `.asd/workflows/asd-phase-impl-review.md:51` (mirror `.asd/workflows/asd-phase-design-review.md:41`) | Both aggregation steps still say "reading `verdicts["iter-NN"]` alone", while the new `sprint-lifecycle.md` "User-resolved findings" names each review phase's own aggregation as a consumer that must read the review file's `resolved:` line in that case. | Add the resolved-line exception inline at both aggregation steps, mirroring `sprint-lifecycle.md:304`. |

## Dropped findings (counts only)

- Below severity floor (iter 4, floor high): 0
- Nitpick, by category: none

## Prior-finding disposition (stalemate check)

- P1 (iter-3 question-only deadlock): partial — general case closed; out-of-policy refusal path left without a finding (kept #1).
- P2 (iter-3 stalemate stop blocking): partial — `resolved:` mechanism and pr-gate read wired; review-phase aggregation steps not updated (kept #2).
- Not a stalemate: new locations/content, not an identical set.

## Verdict
FAIL: 2

## User decisions (FAIL escalation)

- finding #1: accept for fix (2026-09-25) — refusal recorded as a finding the question names
- finding #2: accept for fix (2026-09-25) — resolved-line exception inline at both aggregation steps
