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
| 3 | 685d63932087144cece49ba6bfff0520178efb4d | delta since entry 2 |
| 4 | af85cd527ee289c00691c81ef61788718e0d1ad6 | delta since entry 3 |

## Risk → check decisions

Rows from earlier entries are in `test-plan.entry-01.md`, `test-plan.entry-02.md` and `test-plan.entry-03.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `surfaceCheck(files, bound, testPlanFiles = 1)` / `surface-check --test-plan-files <n>` (c1438ca, EXT-4) | the dispatch bound undercounts Testing's parts once the re-entry chain appends more than `SPLIT_THRESHOLD_FILES` test-plan paths, so the cap-override request asks the user to approve fewer dispatches than run; or it overcounts; or an unusable count, or a CLI that drops the flag, silently falls back to 1 | unit against real emitted parts, plus CLI | extended | supersedes entry 2's "Known ceiling, recorded not tested" clause (`test-plan.entry-02.md`, D-1 row): the fix makes that case reachable input. The sprint-015 AC-11 loop now also runs 26 and 53 test-plan paths through `reviewerFiles`/`emitCoverageManifests`, requires the bound tight somewhere for each count and, for the default, at bounds 25 and 100 (multiples of the split threshold, where the default formula is unchanged), rejects 0/-1/1.5/NaN, and checks the CLI flag both ways |
| `asd-phase-impl-review.md` surface-cap precondition passes `--test-plan-files <n>` (c1438ca, EXT-4) | the entry check never passes the count, so the fixed function runs with the default and undercounts as before | static | add | one assert in the AC-11 test on the `surface-check --files` line |
| `release-manifest.json` hashes for `runtime.js` and the impl-review workflow (c1438ca) | ledger drift | static | keep | the existing `upstream_hashes` test covers it; green at this entry's HEAD |
| `.claude/agent-memory/asd-reviewer-testing/feedback_temp-repo-git-determinism.md` one line (695b43d, DOC-1) | the reviewer memory keeps pointing at an AC-7 message this sprint already fixed | none | none | a per-agent memory file, not canon: outside `managed_paths`, read by no test and mirrored by no other file, so there is no invariant to derive. Assertable only if memory files ever became a sync or ledger input |
| `tests/run.js` AC-8 capture widened (26c5254, TST-3) | — | fail-first | keep | already fail-first proven in entry 3 (`test-plan.entry-03.md`, TST-3 row); the change is test code, not behaviour |

## Removed tests

None this entry.

## Added tests

In `tests/run.js`. Each proof: mutate, run the suite, restore in the same call, byte-compare (all six restored byte-equal). Every mutation also fails the `upstream_hashes` ledger test (managed_paths files); that noise is not counted. Each run: 211/213, exit 1.

| Test | Regression proof (first failing assertion) |
|---|---|
| extended: sprint-015 AC-11 (EXT-4) test-plan count | `.asd/runtime.js` restored to `c1438ca~1` (pre-fix `4 * ceil(cap / 25) + 2`) → exit 1, `bound 25, 26 test-plan paths: a scope of 25 test files emits 6 internal-review parts plus External Review, above the 6 dispatches the cap-override request tells the user to approve`. With one test-plan path the pre-fix formula equals the new one at bounds 25 and 100 and overcounts by one at 1, 24 and 26, so the default rows stay green under it |
| same | `--test-plan-files` validation line removed → exit 1, `Missing expected exception: test-plan files 0: an unusable count must fail closed, never size Testing's parts from a guess` |
| same | CLI stops passing `flags['test-plan-files']` → exit 1, `--test-plan-files carries the test-plan count into the CLI` |
| same | overcount: `parts(cap + testPlanFiles) + 1` → `+ 2` → exit 1, `the bound must be reached for the default and for every test-plan count, or an over-count passes` |
| same | impl-review precondition loses ``and `--test-plan-files <n>`, the count of step 6's `--test-plan` paths`` → exit 1, `impl-review entry must pass the test-plan count to surface-check, or the cap-override request undercounts Testing on a long re-entry chain` |
| same | dispatches loosened by one only where `cap % SPLIT_THRESHOLD_FILES === 0` → exit 1, `the default count must stay tight at every multiple of the split threshold - where test-plan.md alone opens one extra Testing part - or plan-time callers get a looser bound than before` |

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: `.asd/runtime.js` is framework-wide infrastructure)
- Entry 4 pre-strategy (HEAD b8abf24d8e4f5dc749c44fe61c3eebe82aceaa27, before any edit): 213/213 passed, 0 failed, exit 0
- Entry 4 result: pass. 213/213 passed, 0 failed, 0 skipped, exit 0 (HEAD b8abf24d8e4f5dc749c44fe61c3eebe82aceaa27 plus this entry's test edits; the AC-11 test was extended, so the count is unchanged). Build (`node .asd/sync.js --check`) pass: exit 0, `ok: true`, 72 of 72 current. Lint (`git diff --cached --check`) pass
- Pre-strategy (entry 3, HEAD 351dd3ff159744f3b9013ab50f63572580fc9726, before any edit): 211/211 passed, exit 0
- Result: pass. 213/213 passed, 0 failed, 0 skipped, exit 0 (HEAD 351dd3ff159744f3b9013ab50f63572580fc9726 plus this entry's test edits)
- Lint / build: lint (`git diff --cached --check`) pass. Build (`node .asd/sync.js --check`) pass: exit 0, `ok: true`, 0 items not current
- Review-fix iter-02 (TST-3, over c1438ca): 213/213 passed, exit 0; build and lint pass
- Entry 2 record: 211/211 at 9452acf, then 211/211 after review-fix iter-01 over 7566611

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/runtime.js | AssertionError [ERR_ASSERTION]: bound 25: a scope of 25 test files emits 5 internal-review parts plus External Review, above the 5 dispatches the cap-override request tells the user to approve | sprint-015 AC-11: surface-check dispatches bounds the impl-review dispatches its bound implies - every internal reviewer's emitted parts, Testing's --test-plan path included, plus External Review - and the override request quotes that field | fixed | e3baf5b |

No new defect in entry 3 or entry 4.
