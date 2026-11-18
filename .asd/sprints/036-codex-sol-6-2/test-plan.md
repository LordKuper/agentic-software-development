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
| 4 | 557d6957 | delta since eb329004: review-fix commits 0702af2d (sync releases only the recorded attribution), 92c4bb8c (`cleanSettingsFile` mode and failure path), 8185f58b (tech-reference gate, `attribution-check` per-file skip); views and `owned_keys` seed 44bd775a; tester 5b71f711 |
| 5 | 8f9eb1cd | delta since 557d6957: review-fix wave-1/iter-03 commits cc4df9f7 (sync records `owned_keys` for a changed key only), e888835c (in-place settings write, symlink and junction refusal, asd-sprint `sync --apply` first and tracked-only commit); views bf520fc8; tester 7ec4c1ab |
| 6 |  | delta since 8f9eb1cd: review-fix wave-1/iter-04 commit f7229065 (the check inserts and records the owned value without sync, restores on a write error, warns per file on a read error); views 0d40d74a; tester bd2d284a |

## Risk → check decisions

Entry 5's rows, with the iter-04 review-fix tester's, are rotated to `test-plan.entry-05.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `attribution-check` inserts, replaces and records the owned value itself; no startup `sync --apply` (f7229065, AC-15/AC-16) | The check writes the release manifest, the sync state without a record, or `settings.local.json`; replaces nothing for a missing-`pr`, non-object or extra-member value; records a file sync never applied; the skill and its `ops` still run sync | component (CLI, `runApply`, `runCheck`) and content-contract pin | none | bd2d284a already pins it: `AC-15/AC-16 (external 1, 2, 5): ...inserts the missing owned attribution value ...`, `(external 5): ...replaces a present attribution value ...`, `(external 5): ...no sync-state record ...`, and the re-pinned `AC-16: asd-sprint runs its attribution check ...`, each with a fail-first run or mutation (`test-plan.entry-05.md`) |
| `rewriteInPlace` restore after a failed write (f7229065, AC-16) | A write failing after truncating leaves a damaged file reported as untouched | component (CLI, preload stub) | none | bd2d284a already pins it: `AC-16 (external 3): attribution-check whose in-place write ... restores the original bytes ...`, fail-first |
| per-file read warning (f7229065, AC-16) | A read error drops the other file and the Codex hint | component (CLI) | none | bd2d284a already pins it: `AC-16 (external 4): ...whose read of one settings file fails ...`, fail-first |
| link refusal on a startup check (f7229065, AC-16) | A startup check writes through a linked `.claude` | component (CLI, junction) | none | bd2d284a already pins it: `AC-16 (external 2): a startup check over a .claude junction ...`, with a mutation |
| views 0d40d74a | Stale view | static | none | `node .asd/sync.js --check` reports every target `current` |

## Removed tests

No test removed this entry. Entry 5 removed the 0600 mode test (`test-plan.entry-05.md`).

## Added tests

Entry 6 adds no test; every delta risk is pinned by bd2d284a (rows above, regression proofs in `test-plan.entry-05.md`).

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 422 passed, 0 failed of 422, reused from the iter-04 review-fix tester run (entry 5 recorded 418/418 at 144e3aba); no code, test or stub path changed since 0d40d74a other than that run's own committed `tests/run.js` (bd2d284a), so no re-run
- Lint / build: pass — build `node .asd/sync.js --check` (every target current), lint `git diff --cached --check`, run before the commit
- HEAD: 0d40d74a plus bd2d284a's `tests/run.js`

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
