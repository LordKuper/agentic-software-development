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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `review-waves --single` (boolean flag registered in `main`) and impl-review step 1c / `sprint-lifecycle.md` "Review iteration counters" (lite = one wave), amendment AC-21 | `--single` rejected as a value-less flag (`flags require values`, exit 2), or a one-wave division over an above-threshold scope refused under lite, or still accepted without the flag for standard | unit (CLI path, sandbox git repo) | keep | Task 14's test (`cd3f63e2`: `sprint-017 AC-1 ... sprint-028 AC-21` review-waves test) pins step 1c naming `--single`, the one-wave division accepted with `waves: 1` and the measured fields kept, and the same division still refused unflagged (standard); its fail-first is in its commit and return, and it exposed the parse defect, fixed in `7e413ea6` before this entry (never reached impl-test, so no `D-N`); not re-authored |
| `core.md` glossary, `asd-phase-impl-review/SKILL.md`, `README.md`, `.asd/release-manifest.json`, regenerated views (AC-21 prose mirrors) | prose drift between mirrors of the lite one-wave rule | none | none | prose with no stable token beyond `--single` (pinned above); existing phase-chain, README, release-manifest integrity checks and `sync.js --check` (exit 0) cover the mirrors; quality review judges the wording |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | n/a: Task 14's test is existing, its fail-first proof is in its commit `cd3f63e2`; no test authored this entry |

## Suite run

- Command: `node tests/run.js` (shared infrastructure touched: `runtime.js`, `.asd/migrations/`, `tests/run.js` — the impacted set is the full suite)
- Scope: full
- Result: pass — 313/313 passed, exit 0
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0
- HEAD: 221beddc880a9d2f81458d36a525c8995e61415f

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
