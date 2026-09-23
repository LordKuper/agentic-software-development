---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 016-remove-terra-family

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 83746d1a8896b2e1d107ab080f7b24320f5e308c | full change surface |
| 2 |  | delta since entry 1 |

Impacted set: full suite. Safety valve fires — the surface touches `.asd/sync.js` and `.asd/release-manifest.json`, framework-wide shared infrastructure that every render/hash-ledger test loads. `commands.yaml` carries no `test_affected`. Pre-strategy run at `5b5c91d`: `node tests/run.js` → exit 0, `213/213 passed`.

Entry 2 impacted set: full suite. The delta's only file is `tests/run.js`, the repo's single test file, so impacted-set item 1 (test files in the diff) already selects every test. Pre-strategy run at `10b0850`: `node tests/run.js` → exit 0, `213/213 passed`.

## Risk → check decisions

Entry 1 rows: `test-plan.entry-01.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `tests/run.js` "AC-3/6/7: every canonical Codex agent renders a supported delegate config": the model alternation is now built from `Object.keys(manifest.model_families.codex)` instead of the hand-listed `(sol\|luna)` (64b8e4e, T-1) | deriving the set from the manifest leaves the assert vacuous or over-broad, so a rendered model from a family outside the manifest passes | unit | keep | Mutation: `.asd/sync.js` model emission hard-coded to `model = "gpt-6-terra"` (the removed family, which `resolveModelFamily` does not guard at emission). `node tests/run.js` → exit 1, 209/213. Target FAIL: `AC-3/6/7: every canonical Codex agent renders a supported delegate config`, `asd-advisor: supported model` at `tests/run.js:159`. The other three FAILs are fixture, `sync --check` and `upstream_hashes` noise. Restored by `cp`, byte-compared. The 39f754a AC-5 row (T-2) changes only the record, so it adds no risk |

## Removed tests

None.

## Added tests

None. The only delta is a rewrite of an existing assertion, whose proof is in the row above.

## Suite run

- Command: `node tests/run.js`
- Scope: full (entry 2: the delta is `tests/run.js`, the single test file)
- Result: pass — 213 passed, 0 failed, 0 skipped (exit 0)
- Lint / build: pass — `git diff --cached --check` exit 0; `node .asd/sync.js --check` exit 0
- HEAD: 10b08508a06913429f2a05ddb7d4e50ccc3e722c

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
