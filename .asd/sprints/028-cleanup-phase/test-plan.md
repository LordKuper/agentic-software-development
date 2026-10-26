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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-17 escalation consult, delta: `asd-phase-impl-review.md` steps 8, 10 (gate-marked) and 7a, 11 (no gate marker), Owner line, Dispatch row (supersedes the entry 1 AC-17 row) | a user escalation asked at a step without the advisor consult | contract | keep | `sprint-028 AC-17` scans every workflow step holding a failure- or question-class `[GATE hard: …]` marker: steps 8 and 10 were the D-1 sites and now pass (313/313 pre-strategy); no new test |
| AC-17 sites without a gate marker: impl-review step 7a second interruption and step 11 FAILED/QUESTION relay | the consult missing at a site no scan reaches | none | none | the sites carry no stable token to derive them from (only prose: "second consecutive interruption", "FAILED → relay"); a pin would lock wording or a hand list, which §17 forbids; the same relay lines in `asd-phase-impl-test.md` 11, `asd-phase-design.md` 13 and `asd-phase-design-review.md` 11 carry it by the same one-clause edit, quality review judges the prose |
| `.asd/release-manifest.json` hash for the edited workflow | stale `upstream_hashes` entry | contract | keep | the existing release-manifest integrity test (hashes match the files) is green after D-1's refresh |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | n/a: D-1's regression is pinned by `sprint-028 AC-17`, whose fail-first run is recorded in `test-plan.entry-01.md` |

## Suite run

- Command: `node tests/run.js` (shared infrastructure touched: canon rules, `runtime.js`, `sync.js`, `tests/run.js` — the impacted set is the full suite)
- Scope: full
- Result: pass — 313 passed / 0 failed / 0 skipped of 313, exit 0 (pre-strategy run and gate run identical)
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0
- HEAD: c2783777f0efd7465b1f14e15f0cc75d8d8edf04

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
