---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 024-opus-tiers-routing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 64c1898 | full change surface (`git diff main...HEAD`, sprint/project/generated paths excluded) |
| 2 | 888bdf3 | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| derived-id routing line `; risk <declaration>` (`providers.md`; mirrored in `t_decisions-log.md`, `asd-phase-impl.md` 5a, `asd-phase-impl-test.md` 1a) | the format SSoT loses the declaration clause or `via <check>`; a mirror's wording drifts | static/arch | none | the SSoT sentence is already pinned by the review-fix tester's `logLine` assert (entry-01 segment, last `Added tests` row); the three mirrors are one-clause restatements pointing at it, and a drifted mirror misleads no router (`route-task` takes the declaration as input, not the log line). No gap |
| review-fix tester's `tests/run.js` strengthening (reserved classes from `runtime.js`, AC-3 inheritance rejection, AC-6 sequencing) | the new pins are vacuous | static/arch | none | mutation proof already recorded in the entry-01 segment; not re-authored |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no review-fix removal row to carry; nothing in the delta stopped earning its keep | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | entry 2 adds no test; the delta's one risk is already pinned (see `Risk → check decisions`) |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the whole runner; every content contract of this repo lives in it)
- Result: pass — 273 passed, 0 failed, 0 skipped (exit 0; pre-run 273/273, no additions)
- Lint / build: pass — `node .asd/sync.js --check` exit 0; `git diff --cached --check` run in the commit
- HEAD: 081d3ba

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
