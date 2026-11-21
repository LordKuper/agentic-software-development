---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 2 (rotated, never edited)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1 test-fix prose: `AGENTS.md` tail (per-area suite), `sprint-lifecycle.md` "Cleanup phase" step 3, `asd-phase-retro.md` Draft step, `commands.yaml` comment and `test_paths`/`test_durations` | a machine-parsed token changed (a heading, a command, a parsed field) and a pin goes stale | content contract (existing owners) | none | `git diff bbb52783...HEAD` changes only prose sentences: no heading, table header, quoted gate phrase or `commands.yaml` key/value a test parses (`test`, `lint`, `build`, `test_durations`, `test_paths` values unchanged in the machine-read form). The impacted run below is green on every behaviour and contract test; the one red test is the `upstream_hashes` byte ledger (D-2), not a pin. No test added (§17: prose adds none) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
