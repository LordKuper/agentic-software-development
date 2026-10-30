---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 030-english-only-asd-issues

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | f334866b03b06470cadb74a21a92e1ba1692d024 | full change surface |
| 2 | ef2247b8f9c37f1ee6913c095488e66c4a10de6e | delta since entry 1 |
| 3 | d40581e25b1b80e0dc3d0c2fc1859ce86fb906ec | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `rotateDecisions` guard removal (2a3cd4bb) and the `unborn` asserts dropped (63020cb0) | a missing `state.json` stops throwing, or the dropped asserts left the reachable rotation paths unpinned | — | none | the throw on a missing `state.json` is the unguarded read's own failure, no authored behaviour to pin; the test keeps every reachable-path assert (cycle, ordinal, template recreation, missing flags) and gained the fixture-root assert, whose fail-first proof is in the entry 2 segment |
| `release-manifest.json` `upstream_hashes` for `runtime.js` (35105bf3) | a stale hash breaks `update.js` verification | — | none | the existing manifest-hash test already failed on the stale value (324/325 in review-fix) and passes now; the full gate run is 325/325 |
| reviewer agent memory file (`feedback_double-fix-caller-and-callee.md`) | a false line, or a removed term surviving in memory | content contract (sweep) | none | repo grep of the delta's removed sentences (the `state.json` guard clause, `unborn`), agent memory included, returned no hit outside sprint folders and the scratch directory; no sprint id or verdict in the file; no removed mechanism, so the leftover-term test needs no new phrase |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|

## Suite run

- Command: `node tests/run.js`
- Scope: full (the delta touches `.asd/runtime.js` and `tests/run.js`, shared infrastructure: safety valve at the step 8 gate); step 3 pre-authoring run `--filter "sprint-030"` (impacted set), 7/7 passed, exit 0
- Result: pass — 325 passed, 0 failed, 0 skipped (exit 0)
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: ebf25fea036f4c0e568aa79a902663d522cbae98

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second defects section.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
