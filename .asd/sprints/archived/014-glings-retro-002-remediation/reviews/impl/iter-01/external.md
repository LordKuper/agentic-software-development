[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Reviewed files**: 27/27 (2 batches)
- **Scope manifest**: [external.scope.json](external.scope.json)

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| EXT-1 | medium | `.asd/rules/review-policy.md:132-137` (Gate Verdict Format grammar); `README.md:221` | Verdict-token grammar in both mirrors lists only `APPROVE \| CONCERNS \| FAIL`; External Review's `APPROVE (skipped: ...)` / `APPROVE (partial: ...)` are absent, so a literal grammar match rejects a valid return. Overlaps DOC-2. | One line under each grammar block pointing to `external-review.md` "Outcome contract" for the skip/partial forms. |
| EXT-2 | medium | `.asd/rules/sprint-lifecycle.md:342` | Reconstruction `git log … -- . ':!.asd/sprints/**'` hides a landed commit touching only sprint paths (e.g. tester `test-plan.md`), so its trailer is never read and landed work is re-dispatched. Overlaps DOC-3(b), sibling COR-1. | Keep `<sprint>/test-plan*.md` visible, or scan trailers without pathspec ignoring trailer-less commits. |
| EXT-3 | medium | `.asd/rules/git-strategy.md:15` | Trailer id set lacks an id for impl-review step 9's in-place test fix; one trailer line cannot cover a grouped multi-finding/`D-N` commit. Overlaps DOC-3(a), COR-3. | Add `impl-review iter-NN suite`-style id; allow one `ASD-Task:` line per covered id. |
| EXT-4 | medium | `.asd/runtime.js:186` (`recordExternalFailure`); `tests/run.js:2299-2301` | `input.retryAfter \|\| now + NEGATIVE_TTL_MS` replaces a supplied falsy `retryAfter` (e.g. `0`) with the default instead of rejecting it against the bounded-future check; test loop never tries `0`. | Default only when `retryAfter === undefined`; validate every supplied value; add `0` to the rejected-bounds loop. |
| EXT-5 | low | `tests/run.js:3701-3703` | AC-1 outcome test confirms the partial literal exists in `external-review.md` but not that the grammar-box mirrors (`review-policy.md`, README) admit it. | Assert both mirrors restate or link the skip/partial carve-out. |
| EXT-6 | low | `tests/run.js:4766` | AC-7 rotation-name sweep regex only matches dash-shaped names; a malformed mention (`test-plan.entry_01.md`) escapes the assertion. | Match any `test-plan.<token>.md` / `decisions-log.<token>.md` and assert the token is canonical. |

## Dropped findings (counts only)

- Below severity floor: 0
- Nitpick: 0

## Unreviewed files

none
