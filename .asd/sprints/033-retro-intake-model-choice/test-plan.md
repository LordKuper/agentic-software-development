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
| 2 |  | delta since entry 1 (D-1..D-4 fixes) |

## Risk → check decisions

Entry 2 delta (`97cdd2f3...f41b2995`, canon only): test-fix commits b5edbb1f (D-1/D-2/D-4) and 6c66383c (D-3 prose trims). Entry 1 rows rotated to `test-plan.entry-01.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `asd-scout` WebFetch deny and Codex `web_search = "disabled"`; `asd-external-review` description and README row without the wrapper floor (D-1, D-2, D-4) | scout re-gaining web access, a roster claim contradicting `persist-review --floor` | contract | none | The failing pins (sprint-018 AC-1/AC-2/AC-3 and sprint-033 AC-25 README) are the regression proof — red at entry 1, green at this HEAD; no further check |
| D-3 prose trims in `providers.md`, `sprint-lifecycle.md`, `artifact-layout.md`, `git-strategy.md`, `review-policy.md`, `asd-phase-impl.md`, plus `release-manifest.json` hashes | a trim dropping a token another file or test reads (heading, command, field, parsed literal, AC pin), or a README mirror | contract | none | Every pin of those tokens (sprint-010/020/022/025/026/027/028, 033 leftover-term, AC-12, AC-6, workflow/agent form sweeps) is in the one runner and green at this HEAD; a trimmed contract with no pin is prose, judged by impl-review's quality reviewer |
| sprint-026 AC-16 load ceiling after D-3 (headroom about 148 B of the 0.70 ceiling) | the next prose addition to an orchestrator/impl-loaded section re-breaches the ceiling | contract | keep | Existing pin is the guard and is exact to the byte; a second budget test would duplicate it. Risk recorded, not tested: any later impl-phase canon edit re-runs it in the impacted set |

## Removed tests

None. No test is redundant with a surviving one in this delta; none was touched.

| Test | Reason | In change scope |
|---|---|---|
| — | — | — |

## Added tests

None this entry: the delta adds no behaviour or parsed token without a pin.

| Test | Regression proof |
|---|---|
| — | — |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the one runner holds every impacted test; the shared-infrastructure valve would give the same set)
- Result: pass — 361 passed, 0 failed, 0 skipped of 361, exit 0
- Lint / build: build pass at the orchestrator's post-sync `node .asd/sync.js --check`; lint runs at commit (`git diff --cached --check`)
- HEAD: f41b2995

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: sprint-018 AC-3: asd-scout must render web_search = "disabled" - Codex parity with its canonical Claude web grant, variants inheriting the base key | AC-3/6/7: every canonical Codex agent renders a supported delegate config | fixed | b5edbb1f |
| D-2 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: AC-2: asd-scout keeps WebFetch in disallowedTools | sprint-018 AC-1/AC-2/AC-4/AC-8/AC-9: no agent grants AskUserQuestion, web access is granted whole or withheld whole with every grant scoped by policy, and every shell is bounded with commit holders matching git-strategy.md | fixed | b5edbb1f |
| D-3 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: orchestrator/impl: 148496 B is 0.7211 of 205926 B, ceiling 0.7 | sprint-026 AC-16 (D13): per-dispatch load of dev (impl), tester (impl-test), combined reviewer (impl-review) and the orchestrator (impl) is at most 0.70 of its main baseline | fixed | 6c66383c |
| D-4 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-25: persist-review --floor applies the floor, but the README roster row of asd-external-review still says the wrapper does | sprint-033 AC-25: README no longer says the External Review wrapper applies the severity floor - persist-review does, so its roster row names no wrapper-applied floor | fixed | b5edbb1f |
