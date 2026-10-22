## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix wave-1/iter-01 (CB-1..CB-5, F1, F2): scope step 2 stage-by-stage persistence, placeholder-free re-entry evidence, `t_research.md` `Raw scope` line, design step 10 `inputs.research` | a session lost between stages re-enters with a stale or placeholder-filled `research.md` and skips or redoes a stage; step 10 architect redoes the research; the raw scope has no written home | static contract | extend | four asserts added to the two existing sprint-027 AC-5 tests: re-entry line names the `{{` placeholder rule, step (b) writes Findings and Approaches at `COMPLETED`, every design Dispatch entry derived from the JSON carries `inputs.research`, template `Raw scope` line with its scope writer |
| `sprint-lifecycle.md` / `t_retro-backlog.md` / README trims (CB-3, CB-4, CB-5), reviewer memory file | restatement removed, pointer kept | none | none | wording only; the intake pin (sprint-019) and README mirror checks stay green; leftover-term sweep over the removed sentences found no remaining hit in canon, README, templates or agent memory (one regex in `tests/run.js:6290` is a live assertion, not a leftover) |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-027 AC-3/AC-4/AC-5 (D2-D4) re-entry placeholder rule | mutation (scope step 2 re-entry loses "each counting only with content and no `{{` placeholder"): `node tests/run.js --filter "sprint-027 AC-3/AC-4/AC-5"` → exit 1, FAIL "sprint-027 AC-3/AC-4/AC-5 (D2-D4)", matched 1/302; control (step (b) "at once" → "immediately", tokens kept): same filter and `--filter "sprint-027 AC-5 (D4/D5)"` → exit 0, matched 1/302 each; runs: 2 |
| tests/run.js: sprint-027 AC-3/AC-4/AC-5 (D2-D4) stage (b) persists at COMPLETED | mutation (step (b) loses its `COMPLETED` → write Findings and Approaches clause): same filter → exit 1, FAIL "sprint-027 AC-3/AC-4/AC-5 (D2-D4)", matched 1/302; runs: 1 |
| tests/run.js: sprint-027 AC-3/AC-4/AC-5 (D2-D4) design Dispatch `inputs.research` | mutation (step 10 payload loses `inputs.research`): same filter → exit 1, FAIL "sprint-027 AC-3/AC-4/AC-5 (D2-D4)", matched 1/302; runs: 1 |
| tests/run.js: sprint-027 AC-5 (D4/D5) `Raw scope` line | mutation (`- Raw scope:` line removed from t_research.md): `--filter "sprint-027 AC-5 (D4/D5)"` → exit 1, FAIL "sprint-027 AC-5 (D4/D5)", matched 1/302; runs: 1 |

All mutations ran through the filter only and were restored in the same command; `git status` showed only `tests/run.js` modified afterwards.
