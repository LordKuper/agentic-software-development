[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/runtime.js:1257 (codex: major) | Slow-operation ranking includes user-wait time. A dispatch with one minute of work and 69 minutes awaiting approval outranks six two-minute dispatches and reports 68 minutes of excess machine time. | Subtract overlapping user-wait intervals before ranking and before computing the per-kind medians. Add a regression test. |
| 2 | medium | .asd/runtime.js:1255 (codex: minor) | Leaf selection checks only operation kind. A tester dispatch and its nested suite both enter the slow set, although the dispatch is the suite's parent. | Exclude operations that have machine-operation descendants from the leaf set. Add a test with nested dispatch and suite entries. |
| 3 | medium | .asd/workflows/asd-phase-impl-review.md:20 (codex: minor) | Timing brackets tester dispatches at step 8 but omits step 9's terminal tester dispatches, including reruns. Suite entries alone lose the agent, tier and model totals required for these dispatches. | Bracket every step-9 tester dispatch with its own dispatch operation and routing attributes. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0

## Verdict
CONCERNS: 3

## Next action
The orchestrator sends the 3 findings to the dev agent for a fix round. Finding 1 (high) is the priority.
- Fix `slowOps` in `.asd/runtime.js` so that user-wait time is excluded from ranking and medians, and so that only true leaf operations are ranked.
- Add the regression tests for both cases to `tests/run.js`.
- Add the missing step-9 tester dispatch brackets in `asd-phase-impl-review.md`, and update any mirrors.

Then re-run iter-02 at the medium floor.
