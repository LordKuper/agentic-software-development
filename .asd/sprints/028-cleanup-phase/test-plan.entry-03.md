# Test plan — sprint 028-cleanup-phase, entry 3 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `14.0.0.js` `mergedVerdict`: per-node legacy roster (review-fix F-1) | an iteration lacking a roster-required reviewer (lost dispatch) upgraded as `quality: APPROVE`, so the lost review counts as passed | unit (fixture repo) | adapt | `sprint-028 AC-18` state-rewrite test: wave 2 iter-01 (full roster, `testing: CONCERNS` resolved under `reviews/impl/wave-2/iter-01`) expects `quality: APPROVE`, wave 2 iter-02 (no `documentation`) expects no `quality` key; design iter-07 (no `documentation`) added to the fixture |
| `14.0.0.js` `migrateReviewNode`: roster-based latch (F-2) | a design node never latches `quality` because `testing` never ran in design-review | unit (fixture repo) | adapt | same test: the design node drops the `testing` verdicts and latch no real design node held, and now expects `quality` latched at the larger of the correctness and documentation latches; impl wave 2 (partial latch) still expects none |
| `runtime.js` docs predicate over `scopeFiles` (F-3) | the `--test-plan` path the CLI appends to combined's file list is a `.md`, voiding `no documentation file in scope` for every lite code-only review | unit (CLI path) | add | one assert in `sprint-020 AC-4`'s combined-manifest test: `emit-manifest --test-plan` over a code-only scope has the same `n/a` holders as without it; the test's `emit` helper takes extra flags |
| `asd-reviewer-efficiency.md` declared inputs (F-4) | inputs undeclared | none | none | prose list in an agent definition; no stable token to pin, and the dispatch passes `inputs` whole; quality review judges it |
| `.asd/release-manifest.json` hashes, regenerated views | stale hash or view | contract | keep | existing release-manifest integrity and `sync.js --check` (exit 0) green |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| `sprint-020 AC-4` combined-manifest test, F-3 assert (extended) | mutation `input.scopeFiles || input.files` → `input.files` in `.asd/runtime.js` standingPredicates: `node tests/run.js --filter "sprint-020 AC-4"` exit 1, 1/313 matched, runner-reported failing test `sprint-020 AC-4: emit-manifest --reviewer combined composes the rubrics its agent names…`; restored |
| `sprint-028 AC-18` state-rewrite test, F-1 and F-2 (adapted fixture; wave-K directory read restored by wave 2 iter-01, lost dispatch moved to wave 2 iter-02) | mutation 1: delete the roster-completeness guard in `mergedVerdict`; mutation 2: latch test `roster.every` → `LEGACY_REVIEWERS.every`; mutation 3 (combined.md F-1): wave directory `wave-${index + 1}` → `wave-${index}` in `.asd/migrations/14.0.0.js`. Each: `node tests/run.js --filter "sprint-028 AC-18"` exit 1, 3/313 matched, 2/3 passed, runner-reported failing test `sprint-028 AC-18 (D13): the 14.0.0 migration gives every review iteration of an active sprint a quality verdict…`; both restored |
