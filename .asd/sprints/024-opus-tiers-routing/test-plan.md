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
| 3 | 4f3ce96 | delta since entry 2 |
| 4 |  | delta since entry 3 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `checkpoints.md` "Gate policy" `It records` → `The orchestrator records` (9bceee2) | the gate-decision record sentence loses its subject, or the AC-8 flagged-choice sentence is disturbed | static/arch | none | wording-only; the AC-8 pin locates its sentence by `flagged choice` + `plan decision`, untouched by the edit, and the suite is green |
| review-fix tester's AC-8/AC-9 pins rewritten onto stable tokens (9674110) | the pins are vacuous | static/arch | none | mutation proof already recorded in the entry-03 segment (M1-M3 plus reword control); not re-authored |
| `release-manifest.json` hash refresh | hashes stale | static/arch | none | the existing `upstream_hashes` test covers it |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no review-fix removal row to carry; nothing in the delta stopped earning its keep | yes |

## Added tests

| Test | Regression proof |
|---|---|
| none | entry 4 adds no test; the delta's risks are already pinned (see `Risk → check decisions`) |

## Suite run

- Command: `node tests/run.js` (`commands.yaml` `test`)
- Scope: full, unscoped (`node tests/run.js` is the whole suite; entry 4 pre-run and gate)
- Pre-run (step 3, before authoring): green — 273 passed, 0 failed (exit 0)
- Result: green — 273 passed, 0 failed, 0 skipped (exit 0); no test authored, so the pre-run is the gate run
- Lint: `git diff --cached --check` (`commands.yaml` `lint`) runs on the staged paths in the commit command, exit 0
- Build: `node .asd/sync.js --check` (`commands.yaml` `build`) exit 0, `ok: true`, every target `current`
- HEAD: b78ffea279bc581910d98c662fb03cb9a0fa271b

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
