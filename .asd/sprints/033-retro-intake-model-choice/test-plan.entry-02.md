# Test plan entry 02 — sprint 033-retro-intake-model-choice

Rotated narrative rows of `Entry log` entry 2 (HEAD analysed 14898f4a). Never edited.

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
- Scope: impacted
- Result: pass — 361 passed, 0 failed, 0 skipped of 361, exit 0
- HEAD: f41b2995
