---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 7 (rotated, never edited)

## Risk → check decisions

Entry 1's rows, removals and added tests moved to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's (the review-fix `wave-1/iter-01` rows) to `test-plan.entry-04.md`, entry 5's (the review-fix `wave-1/iter-02` rows) to `test-plan.entry-05.md`, entry 6's (the review-fix `wave-1/iter-03` rows) to `test-plan.entry-06.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff 46f1b75d...HEAD` outside `.asd/sprints/**`: `checkGapProof` validates only the contiguous `## Added tests` table (header row to the next blank line) and refuses a row whose cell count differs from the header's (`row cell count differs from the header's N`) (external 1, `59922fc5`) | a one-cell row reads as a proof or is dropped, so a malformed row closes green; the other way round, a pipe in prose after the table is refused as a table row | extend `sprint-037 AC-3/AC-13` (`runtime-tools`) with a `| b.js:t |` row after the valid `proven` table expecting status 2 and the cell-count refusal, and a blank line then a prose line holding a pipe expecting status 0 | extend existing | the AC-3/AC-13 test owns the Gap proof refusals and already holds the valid control (`filled`, status 0); both cases are new assertions in it (311 tests before and after). Mutations (each restored in a `finally`, `git status --short .asd/runtime.js` empty after): the cell-count `fail` line removed → `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` exit 1, `FAIL - sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` (1/34 matched, 0/1 passed); `const run = body.slice(start, blank === -1 ? undefined : blank)` → `body.slice(start)` → same command, exit 1, same failing test (1/34 matched, 0/1 passed). runs: 2 |
| struck rejected-removal row (`d13d0a8b`, `asd-phase-impl-test.md` step 9a, `asd-tester.md`) and the pagination-failure block (`f2503796`, `asd-phase-scope.md`) | a machine-parsed token drifting | none | none | prose of a dispatch route and an orchestrator-run `gh` sequence; no machine parses either (code-style §17: a prose fix adds a test only for a machine-parsed token) |
| `wave-1/iter-04` view sync (`03c09b3a`), release-manifest hashes, `CHANGELOG.md` | none reachable by a test | none | none | generated views and hashes; `node .asd/sync.js --check` (`ok: true`) and the full suite (manifest hash test included) cover them |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Gap proof | Regression proof |
|---|---|---|
