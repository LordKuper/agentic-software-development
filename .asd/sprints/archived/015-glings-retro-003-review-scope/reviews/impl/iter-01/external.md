[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Reviewed files**: 26/26
- **Scope manifest**: `files[]` 26, base 8649c9c, head a5f6548, self-hosting exclusions

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| EXT-1 | high | `.asd/workflows/asd-phase-design-review.md:28` (and the external-scope bullet ~33) | Step 7 now builds the iteration 2+ draft list from drafts "changed since the previous iteration's snapshot", and `external-review.md:89` says design-review persists a file snapshot each iteration. No workflow step and no `runtime.js` function writes or reads that snapshot, so iteration 2+ incremental scoping has no implementing write. | Add a persist step (a snapshot or hash list written each iteration) and a reader that computes the iteration 2+ list, or narrow the claim back to the whole draft set. |
| EXT-2 | high | `.asd/runtime.js:452` (`surfaceCheck`) | An in-body `// ponytail:` comment breaks `code-style.md` §7, which allows only `// TODO(sprint-<NNN-slug>)` inside a body. | Move the note into the doc comment. |
| EXT-3 | high | `tests/run.js` (`dispatchWaves` untested) | `dispatchWaves` is exported but has no call site and no test. | Add a unit test (empty, under/at/over the ceiling, multi-wave, ordering). |
| EXT-4 | medium | `.asd/runtime.js:453` (`surfaceCheck`) | `dispatches` ignores the real `--test-plan` path count. Above `SPLIT_THRESHOLD_FILES` test-plan paths it undercounts. | Take the count as input, or state the assumption in the doc comment and rule. |
| EXT-5 | medium | `README.md` FAQ ~432 | The per-sprint skip is missing from the FAQ answer. | Add one sentence. |

Severity mapping: codex `major` → high, `minor` → medium (`external-review.md`).

## Dropped findings (counts only)

- Below severity floor: 0
- Nitpick: none
- Invalid (verified against spec): 1. The codex claim that `assertReviewerUnion` breaks an exact-union invariant is wrong: `review-policy.md` requires the union to cover the scope, and Testing's test-plan additions are documented.

## Verdict
CONCERNS: 5
