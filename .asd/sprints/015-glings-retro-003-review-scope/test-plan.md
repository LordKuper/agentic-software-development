---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 015-glings-retro-003-review-scope

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | a201d2881f0e59a59f19134bccbe4f492877d159 | full change surface |
| 2 | 1464b4159d5b0c2c70fc6724743644b1e53bee57 | delta since entry 1 |

## Risk → check decisions

Entry 1 rows: `test-plan.entry-01.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `surfaceCheck.dispatches` (D-1 fix, e3baf5b): `+ 1` → `+ 2` | the bound again undercounts Testing's parts, or overcounts everywhere so the override request asks for more than runs | unit against real emitted parts | keep | supersedes entry 1's "Red, D-1" row. The existing sprint-015 AC-11 test is the fail-first proof: red at 3352fd5, green at 9452acf, and its `tight` assert stops an overcount from passing (bound 25 is tight: 4 non-Testing parts + 2 Testing parts + External Review = 6 = `dispatches`). Known ceiling, recorded not tested: the `+ 2` holds while Testing's `--test-plan` paths (test-plan.md + one segment per re-entry) number at most `SPLIT_THRESHOLD_FILES` (25), i.e. 24 re-entries, beyond the review-iteration cap. A test for more paths would pin a case the workflow cannot reach |
| `release-manifest.json` hash for `runtime.js` | ledger drift | static | keep | the existing `upstream_hashes` ledger test covers it |

## Removed tests

None this entry.

## Added tests

None this entry. The delta changes one arithmetic term that the AC-11 test already asserts (above).

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: `.asd/runtime.js` is framework-wide infrastructure)
- Result: pass — 211/211 passed, 0 failed, 0 skipped. Pre-strategy run at the same HEAD: 211/211, exit 0
- Lint / build: lint (`git diff --cached --check`) pass. Build (`node .asd/sync.js --check`) pass: exit 0
- HEAD: 9452acf (the delta analysed; this entry commits only test-plan files, no test code)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/runtime.js | AssertionError [ERR_ASSERTION]: bound 25: a scope of 25 test files emits 5 internal-review parts plus External Review, above the 5 dispatches the cap-override request tells the user to approve | sprint-015 AC-11: surface-check dispatches bounds the impl-review dispatches its bound implies - every internal reviewer's emitted parts, Testing's --test-plan path included, plus External Review - and the override request quotes that field | fixed | e3baf5b |
