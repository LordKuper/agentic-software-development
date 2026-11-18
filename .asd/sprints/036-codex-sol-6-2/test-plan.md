---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 036-codex-sol-6-2

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | dcd77aa6 | full change surface |
| 2 | c41f7a35 | delta since dcd77aa6: the D-1 fix, `renderOwnedArray` in `.asd/sync.js` (2d190ca6); the re-render of `.claude/settings.json` (7478e40a) |
| 3 | eb329004 | delta since c41f7a35: review-fix commits 76b90101 (commit contract), 5c3af791 (attribution settings writes), d9fba3c2 (workflow gates), a44f5e38 (liveness); views 4ea39611; tester 843c0199 |
| 4 |  | delta since eb329004: review-fix commits 0702af2d (sync releases only the recorded attribution), 92c4bb8c (`cleanSettingsFile` mode and failure path), 8185f58b (tech-reference gate, `attribution-check` per-file skip); views and `owned_keys` seed 44bd775a; tester 5b71f711 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `recordedKeys`, `owned_keys`, release only what sync wrote (0702af2d, AC-15) | A hand-set off value sync never wrote is read stale and deleted under an absent or `enabled` key; an entry with no record never seeds | component (`runApply`, `runCheck`) | none | 5b71f711 already pins it: `AC-15: an off attribution value the user set by hand ...`, the `owned_keys` record asserts in `AC-15: sync json-merge carries ...` and the stale-until-recorded change in `AC-15/AC-16: under disabled attribution-check inserts ...`, each with its fail-first run in the iter-02 rows of entry 3's segment |
| `cleanSettingsFile` failure path (92c4bb8c, AC-16) | A failed write or rename exits 2 or leaves a `.tmp` | component (CLI behind a `--require` stub) | none | `AC-16: attribution-check that cannot write or rename ...` (5b71f711) runs on every host and has its fail-first run |
| `cleanSettingsFile` keeps the file mode (92c4bb8c, AC-16) | A 0600 file becomes umask-default | component (POSIX) | none | `AC-16: attribution-check keeps the file mode ...` (5b71f711) is POSIX-only and skips on win32; its fail-first run is still owed to the first POSIX run, the only host here being win32 |
| `attribution-check -- <files>` per-file skip (8185f58b, AC-16) | One dirty file skips the whole check; a flag or foreign path is accepted | component (CLI) | none | `AC-16: attribution-check skips a file named after -- ...` and the re-pinned `AC-16: asd-sprint runs its attribution check ...` (5b71f711), each with a fail-first run |
| tech-reference gate per tech and per command (8185f58b, AC-8) | A new library with no tech-reference raises no `FAILED` | content-contract pin | none | the AC-8 assert in `AC-8/AC-10/AC-11/AC-13 ...` (5b71f711) pins both clauses, with mutations and a reword control |
| views and `owned_keys` seed (44bd775a) | Stale view; a missing seed | static | none | `node .asd/sync.js --check` proves the views; the seed is exercised by the record asserts above |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Entry 4 adds none: 5b71f711's tests cover every risk of the delta (rows above, regression proofs in `test-plan.entry-03.md`).

| Test | Regression proof |
|---|---|

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 417 passed, 0 failed of 417 (reused: review-fix wave-1/iter-02's run, recorded at HEAD 44bd775a)
- Lint / build: pass — build `node .asd/sync.js --check`, lint `git diff --cached --check`, run before this entry's commit
- HEAD: 44bd775a — reused, not re-run: since it the only code, test or stub path changed is `tests/run.js` (5b71f711), the run's own committed file

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/sync.js | AssertionError [ERR_ASSERTION]: AC-15: adding the attribution key must not re-indent the hooks.SessionStart array it did not change | sprint-036 AC-15 (D-1): a json-merge re-render that only adds the owned attribution key keeps the owned hooks array as it was indented - the file reads as JSON.stringify with two spaces writes it | fixed | 2d190ca6 |

## Manual verification

| AC | Steps | Expected observation |
|---|---|---|
| AC-5 | `echo "Reply with exactly: PROBE OK" \| codex exec --model gpt-6.2-sol -c model_reasoning_effort="high" --sandbox read-only -` (third-party live integration: the model is served only by the provider) | a reply, exit 0 |

result: pass — 2026-11-18 04:14, codex-cli 0.169.1, exit 0, reply `PROBE OK` (21 563 tokens). An attempt at 03:09 was refused by the account's usage limit, which is not a model-access error.
