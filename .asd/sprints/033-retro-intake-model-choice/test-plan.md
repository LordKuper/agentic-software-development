---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 033-retro-intake-model-choice

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 97cdd2f3 | full change surface |
| 2 | 14898f4a | delta since entry 1 (D-1..D-4 fixes) |
| 3 | 245bed7a | delta since entry 2 (review-fix wave-1/iter-01, bcd4f6ac..c6d460a8) |
| 4 |  | delta since entry 3 (review-fix wave-1/iter-02) |

## Risk → check decisions

Entry 4 delta (`245bed7a...HEAD`, canon only: `.asd/runtime.js`, `release-manifest.json` hashes, agent memory; review-fix wave-1/iter-02 a5dbb6a9, a2c3a591, in-place test fix f830dbab, manifest sync 5349e5dc). Entry 3 rows rotated to `test-plan.entry-03.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `applyFloor` stalemate guard narrowed (a2c3a591): stalemate = verdict line FAIL and a `Stalemate: <N> iterations` line | a `Stalemate: no` line, or a count line under a non-FAIL verdict, keeps a CONCERNS whose every row dropped from becoming APPROVE (review finding F2) | component | add | Two cases added to the existing AC-25 test. Its stalemate-FAIL fixture used the off-grammar `Stalemate: D-1` (red at this entry's start, test defect, pinned the old broad `^Stalemate: ` match): re-pointed to the `t_review-report.md` `## Stalemate` line, so the kept-FAIL branch is exercised by the grammar the guard now reads |
| `collapsePatch` in-body comment removed (a5dbb6a9) | none: no behaviour change | — | none | The existing AC-24 (review-fix) test over the same function is green at this HEAD |
| f830dbab C-quoted deleted path case (AC-24 review-fix test) | covered at its own entry | component | keep | Already fail-first proven (entry 3 row, review finding F3); green at this HEAD |
| `release-manifest.json` hashes, agent-memory edits | a hash or memory line out of step with canon | contract | none | `sync --check` and the leftover-term / manifest pins already read both; green at this HEAD |

## Removed tests

None. No test is redundant with a surviving one in this delta; none was touched.

| Test | Reason | In change scope |
|---|---|---|
| — | — | — |

## Added tests

Fail-first proof is a run of the new `tests/run.js` against the pre-fix tree (`git archive a5dbb6a9`, the parent of the guard fix, extracted under `.asd/tmp/`, new runner copied in) — no production file was touched; the extraction was deleted afterwards.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-033 AC-25: persist-review --floor… (grammatical stalemate FAIL fixture; `Stalemate: no` CONCERNS and CONCERNS-with-count cases added) | `node tests/run.js --filter "AC-25: persist-review"` in the pre-fix tree → exit 1, that test (1 matched), `AC-25: a "Stalemate: no" line is no stalemate FAIL - a CONCERNS whose every row dropped still becomes APPROVE` (actual `CONCERNS`, expected `APPROVE`). Second run, that assert dropped from the copy → exit 1, that test (1 matched), `AC-25: only a FAIL verdict is a stalemate - a CONCERNS carrying the count line becomes APPROVE when every row dropped`. Reword control: the grammatical stalemate-FAIL asserts (kept FAIL, persisted verdict line FAIL) sit ahead of both and pass in the pre-fix tree and at HEAD; green at HEAD; runs: 2 |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the one runner holds every impacted test; the shared-infrastructure valve would give the same set)
- Result: pass — 362 passed, 0 failed, 0 skipped of 362, exit 0
- Lint / build: `node .asd/sync.js --check` exit 0 (`ok: true`); lint runs at commit (`git diff --cached --check`)
- HEAD: 50c9f5de (F3 in-place test fix: `--filter "sprint-033"` 21/21, full 362/362, exit 0)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: sprint-018 AC-3: asd-scout must render web_search = "disabled" - Codex parity with its canonical Claude web grant, variants inheriting the base key | AC-3/6/7: every canonical Codex agent renders a supported delegate config | fixed | b5edbb1f |
| D-2 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: AC-2: asd-scout keeps WebFetch in disallowedTools | sprint-018 AC-1/AC-2/AC-4/AC-8/AC-9: no agent grants AskUserQuestion, web access is granted whole or withheld whole with every grant scoped by policy, and every shell is bounded with commit holders matching git-strategy.md | fixed | b5edbb1f |
| D-3 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: orchestrator/impl: 148496 B is 0.7211 of 205926 B, ceiling 0.7 | sprint-026 AC-16 (D13): per-dispatch load of dev (impl), tester (impl-test), combined reviewer (impl-review) and the orchestrator (impl) is at most 0.70 of its main baseline | fixed | 6c66383c |
| D-4 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-25: persist-review --floor applies the floor, but the README roster row of asd-external-review still says the wrapper does | sprint-033 AC-25: README no longer says the External Review wrapper applies the severity floor - persist-review does, so its roster row names no wrapper-applied floor | fixed | b5edbb1f |
