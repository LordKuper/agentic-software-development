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
| 5 | 7e38ed1e | delta since entry 4 (amendment AC-21, plan Tasks 13-14) |
| 6 | 22f6738e | delta since entry 5 (review-fix wave-1/iter-03, commit 14c8639e, plus the combined memory-fix 5d73b2e5) |
| 7 | 8a2fca08 | delta since entry 6 (review-fix wave-1/iter-04: skill allowed-tools b56279ad, views 3678f2fe, pin fba933f9) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| ten skills' Claude `allowed-tools` gain `Glob`, `Grep`, `Bash`, `WebSearch`, `WebFetch` (`b56279ad`, views `3678f2fe`, review-fix iter-04 F1) | a phase skill missing a tool its workflow's inline steps use stalls on a permission prompt | content-contract (token pin) | keep | the review-fix tester's pin (`fba933f9`, `sprint-028 AC-12 (review-fix): every phase skill pre-approves Grep ...`) reads every `asd-phase-*` skill's `allowed-tools` and fails on a missing `Grep`, `WebSearch` or `WebFetch`; its fail-first proof is recorded in `test-plan.entry-06.md` and it passes against the new tool lists; the other added tools (`Glob`, `Bash` forms) have no stable per-skill contract beyond the sprint-025 `Bash` pin, which accepts the new `Bash` form; manifest ledger hashes and view parity are covered by existing release-manifest checks and `sync.js --check` (exit 0) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | n/a: the delta's pin is existing (`fba933f9`), its fail-first proof is recorded in `test-plan.entry-06.md`; no test authored this entry |

## Suite run

- Command: `node tests/run.js` (shared infrastructure touched: `runtime.js`, `.asd/migrations/`, `tests/run.js` — the impacted set is the full suite)
- Scope: full
- Result: pass — 316/316 passed, exit 0
- Lint / build: pass — `git diff --cached --check` exit 0 at commit, `node .asd/sync.js --check` exit 0
- HEAD: 9bb37b86a8ae065bbcfa4c9fa55bee100a69683d

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
