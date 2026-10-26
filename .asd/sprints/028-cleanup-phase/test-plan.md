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
| 3 |  | delta since entry 2 (review-fix wave-1/iter-01) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `14.0.0.js` `mergedVerdict`: per-node legacy roster (review-fix F-1) | an iteration lacking a roster-required reviewer (lost dispatch) upgraded as `quality: APPROVE`, so the lost review counts as passed | unit (fixture repo) | adapt | `sprint-028 AC-18` state-rewrite test: wave 2 (no `documentation`) now expects no `quality` key; design iter-07 (no `documentation`) added to the fixture |
| `14.0.0.js` `migrateReviewNode`: roster-based latch (F-2) | a design node never latches `quality` because `testing` never ran in design-review | unit (fixture repo) | adapt | same test: the design node drops the `testing` verdicts and latch no real design node held, and now expects `quality` latched at the larger of the correctness and documentation latches; impl wave 2 (partial latch) still expects none |
| `runtime.js` docs predicate over `scopeFiles` (F-3) | the `--test-plan` path the CLI appends to combined's file list is a `.md`, voiding `no documentation file in scope` for every lite code-only review | unit (CLI path) | add | one assert in `sprint-020 AC-4`'s combined-manifest test: `emit-manifest --test-plan` over a code-only scope has the same `n/a` holders as without it; the test's `emit` helper takes extra flags |
| `asd-reviewer-efficiency.md` declared inputs (F-4) | inputs undeclared | none | none | prose list in an agent definition; no stable token to pin, and the dispatch passes `inputs` whole; quality review judges it |
| `.asd/release-manifest.json` hashes, regenerated views | stale hash or view | contract | keep | existing release-manifest integrity and `sync.js --check` (exit 0) green |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| `sprint-020 AC-4` combined-manifest test, F-3 assert (extended) | mutation `input.scopeFiles || input.files` → `input.files` in `.asd/runtime.js` standingPredicates: `node tests/run.js --filter "sprint-020 AC-4"` exit 1, 1/313 matched, runner-reported failing test `sprint-020 AC-4: emit-manifest --reviewer combined composes the rubrics its agent names…`; restored |
| `sprint-028 AC-18` state-rewrite test, F-1 and F-2 (adapted fixture) | mutation 1: delete the roster-completeness guard in `mergedVerdict`; mutation 2: latch test `roster.every` → `LEGACY_REVIEWERS.every`. Each: `node tests/run.js --filter "sprint-028 AC-18"` exit 1, 3/313 matched, 2/3 passed, runner-reported failing test `sprint-028 AC-18 (D13): the 14.0.0 migration gives every review iteration of an active sprint a quality verdict…`; both restored |

## Suite run

- Command: `node tests/run.js` (shared infrastructure touched: `runtime.js`, `.asd/migrations/`, `tests/run.js` — the impacted set is the full suite)
- Scope: full
- Result: pass — 313 passed / 0 failed / 0 skipped of 313, exit 0
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0
- HEAD: c68467d8676d2963af868ed3a7db9716a2c635b9

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
