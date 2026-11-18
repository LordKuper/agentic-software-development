---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 8 (rotated, never edited)

## Risk → check decisions

Entry 1's rows, removals and added tests moved to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's (the review-fix `wave-1/iter-01` rows) to `test-plan.entry-04.md`, entry 5's (the review-fix `wave-1/iter-02` rows) to `test-plan.entry-05.md`, entry 6's (the review-fix `wave-1/iter-03` rows) to `test-plan.entry-06.md`, entry 7's (the review-fix `wave-1/iter-04` rows) to `test-plan.entry-07.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff 08cde94f...HEAD` outside `.asd/sprints/**`: `checkGapProof` validates every blank-line-separated table of `## Added tests` (each needs a header and a well-formed separator; a pipe-less line inside a table, an empty or `{{`-opening Gap proof in any row refused), prose between tables free (review-fix `wave-1/iter-05`, `6309a721`) | a second table after a blank line passed with an empty Gap proof; the other way round, the per-paragraph split could refuse prose or a valid second table | the dev's two cases in `sprint-037 AC-3/AC-13` (`runtime-tools`): a second table with an empty proof expecting status 2 and `empty Gap proof cell`, prose between two proven tables expecting status 0; no new test | extend existing | the AC-3/AC-13 test owns the Gap proof refusals and holds the valid control (`filled`, status 0); the dev's cases are new assertions in it (311 tests before and after). Fail-first, run in a `git archive` extraction of `6309a721^` under `.asd/tmp/` (deleted after) with the HEAD `tests/runtime-tools.test.js` copied in: `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` exit 1, `FAIL - sprint-037 AC-3/AC-13: test-delta splits the sprint diff…`, `a second table after a blank line is checked like the first (got {"status":0,…})` (1/34 matched, 0/1 passed). Control: the same copy with the HEAD `.asd/runtime.js` → exit 0 (1/34 matched, 1/1 passed). Mutations of that HEAD copy (the repo tree never mutated, `git status --short .asd/runtime.js` empty): `if (start === -1) return;` → `fail(…)` (a prose paragraph refused) → same command exit 1, same failing test (1/34 matched, 0/1 passed; the older `proseAfterBlank` assert trips first); a paragraph after the first table holding `Gap proof` refused → exit 1, same test, `prose between two proven tables is free and closes` (1/34 matched, 0/1 passed). runs: 3 |
| the struck `Removed tests` row stays live, never rotated (`artifact-layout.md` "Test plan" Rotation, `asd-phase-impl-test.md` step 4 and 9a) | a machine-parsed token drifting | none | none | prose of the Tester's rotation and the orchestrator's step 9a filter; no machine reads a struck row (`~~` appears in no `runtime.js` parser), and the `contract-workflows` pin on the Rotation paragraph (existence only) stays green (code-style §17: a prose fix adds a test only for a machine-parsed token) |
| `72dcc9cb` hash refresh, `81f658a7` round close, `.asd/release-manifest.json` | none reachable by a test | none | none | hashes and bookkeeping; `node .asd/sync.js --check` and the full suite (manifest hash tests included) cover them |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Gap proof | Regression proof |
|---|---|---|
