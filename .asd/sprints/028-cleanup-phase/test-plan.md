---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 028-cleanup-phase

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 8359218a | full change surface |
| 2 | e1fd93a4 | delta since entry 1 |
| 3 | 9cf1e1f2 | delta since entry 2 (review-fix wave-1/iter-01) |
| 4 | de11b54e | delta since entry 3 (review-fix wave-1/iter-02) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `tests/run.js` `sprint-028 AC-18` fixture, delta of review-fix wave-1/iter-02: wave 2 split into iter-01 (full roster, resolved `testing: CONCERNS` read from `reviews/impl/wave-2/iter-01`) and iter-02 (lost dispatch, no `documentation`) | a fixture whose only wave-K case was the lost dispatch left the wave-K directory read (`wave-${index + 1}`) unpinned | unit (fixture repo) | keep | the adapted test already covers both cases and carries its fail-first proof (mutation 3, Added tests); no production code changed, no new test |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | n/a: the delta adapts the `sprint-028 AC-18` fixture; its fail-first run (mutation 3) is recorded in `test-plan.entry-03.md` |

## Suite run

- Command: `node tests/run.js` (shared infrastructure touched: `runtime.js`, `.asd/migrations/`, `tests/run.js` — the impacted set is the full suite)
- Scope: full
- Result: pass — 313 passed / 0 failed / 0 skipped of 313, exit 0
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0
- HEAD: cae193ddbe4bbc502d2c60b2cd8822efb12f7f6a

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
