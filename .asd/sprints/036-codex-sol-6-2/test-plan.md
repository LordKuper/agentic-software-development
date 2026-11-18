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
| 6 | cdc1a55b | delta since 8f9eb1cd: review-fix wave-1/iter-04 commit f7229065 (the check inserts and records the owned value without sync, restores on a write error, warns per file on a read error); views 0d40d74a; tester bd2d284a |
| 7 | 6e04da1e | delta since cdc1a55b: review-fix wave-1/iter-05 commit 01497426 (`rewriteInPlace` non-truncating write with descriptor restore; `recordOwnedKeys` link guard, atomic ledger save, boolean return; the check's ledger line; asd-sprint ledger clause removed); views eb63010f; tester e59544ce |

## Risk → check decisions

Entry 6's rows are rotated to `test-plan.entry-06.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `rewriteInPlace` writes in place through one descriptor, padded then cut, restored through it on failure (01497426, AC-16, external 1, 3). Supersedes entry 6's truncating-write row | A shorter replacement leaves padding or a longer one is cut; a short or thrown `writeSync` or a failed `ftruncateSync` leaves a damaged file reported untouched; the descriptor leaks | component (CLI, preload stub on `writeSync` and `ftruncateSync`) | none | e59544ce already pins it: `AC-16 (external 1, 3): ...whose in-place write ... fails - a thrown or short writeSync, a failed ftruncateSync - restores ...` and `AC-16 (external 1): ...overwrites a settings file in place so it holds exactly the new bytes ...`, each with a fail-first run or mutation (`Added tests`) |
| `recordOwnedKeys` refuses a linked ledger or `.asd`, saves atomically, returns whether it saved (01497426, AC-16, external 3) | The check writes through a symlinked `sync-state.json` or a linked `.asd`; a failed save leaves a half-written ledger; an existing file at the temp name is opened over or deleted; a leftover temp file stays | component (CLI over a symlink and a junction; direct call with a stubbed `renameSync`) | none | e59544ce already pins it: `AC-16 (external 3): ...over a symlinked .asd/sync-state.json or a linked .asd directory ...` and `AC-16 (external 3): recordOwnedKeys saves the ledger atomically ...`, fail-first |
| the check names the ledger in a fix line of its own, only after a real save (01497426, AC-16) | The line prints for a record that was not saved, or the fix line set differs from what the skill commits | component (CLI) | none | e59544ce re-pinned `AC-15/AC-16 (external 1, 2, 5): ...inserts the missing owned attribution value ...` to the two-line output, fail-first; the linked-ledger test pins the absent line |
| asd-sprint `### Attribution check` drops the git-status guess that committed `.asd/sync-state.json` (01497426, AC-16) | The skill commits a ledger the check did not name | content-contract pin | none | e59544ce re-pinned `AC-16: asd-sprint runs its attribution check ...` (the commit set follows the fix lines alone), fail-first |
| views eb63010f | Stale view | static | none | `node .asd/sync.js --check` reports every target `current` |

## Removed tests

No test removed this entry. Entry 5 removed the 0600 mode test (`test-plan.entry-05.md`).

## Added tests

The review-fix tester's e59544ce added the tests below; no entry-7 test is added, each risk above being pinned. Proof runs: pre-fix tree = `git archive c8d98404` (the parent of the dev commit 01497426) extracted to `.asd/tmp/prefix-01497426/` with this `tests/run.js` copied in, deleted after; each is `node tests/run.js --filter "<substring>"`, matched 1 of 1, exit 1 unless noted.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-16 (external 1, 3): attribution-check whose in-place write of a settings file fails ...` (re-authored for `writeSync` and `ftruncateSync` stubs) | fail-first: pre-fix tree, filter `external 1, 3): attribution-check whose in-place`, exit 1, `AC-16: a write failing after changing the first bytes is restored through the descriptor, the warning states the file untouched and its bytes are the original; the other file is still cleaned` |
| tests/run.js:`sprint-036 AC-16 (external 1): attribution-check overwrites a settings file in place so it holds exactly the new bytes ...` | pre-fix tree green: `writeFileSync` also yields exact bytes, so this guards the new padding and cut; mutation in a `git archive HEAD` copy replacing `fs.ftruncateSync(fd, length);` with `void length;` in `.asd/runtime.js`: filter `external 1): attribution-check overwrites`, exit 1, `AC-16: each file is exactly the new text - the shorter one cut where the new text ends, with no trailing spaces, the longer one whole`; runs: 1 (the copy deleted, the real tree never mutated) |
| tests/run.js:`sprint-036 AC-16 (external 3): attribution-check over a symlinked .asd/sync-state.json or a linked .asd directory ...` | fail-first: pre-fix tree, filter `symlinked .asd/sync-state.json`, exit 1, `AC-16: the settings value is inserted, the failed record is a warning, the ledger line is absent and the link's target keeps its bytes` |
| tests/run.js:`sprint-036 AC-16 (external 3): recordOwnedKeys saves the ledger atomically ...` | fail-first: pre-fix tree, filter `recordOwnedKeys saves the ledger atomically`, exit 1, `Missing expected exception: AC-16: an existing file at the temp name is never opened over` |
| tests/run.js:`sprint-036 AC-15/AC-16 (external 1, 2, 5): attribution-check under disabled inserts the missing owned attribution value ...` (expects the ledger line) | fail-first: pre-fix tree, filter `inserts the missing owned attribution value`, exit 1, `AC-16: one fix line names the inserted value, a second names the ledger that saved its record, and nothing is warned` |
| tests/run.js:`sprint-036 AC-16: asd-sprint runs its attribution check ...` (the commit set follows the fix lines alone) | fail-first: pre-fix tree, filter `asd-sprint runs its attribution check`, exit 1, `AC-16: the commit set follows the fix lines alone - the check names the sync state in a line of its own, so no git-status guess adds it` |

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 425 passed, 0 failed of 425
- Lint / build: pass — build `node .asd/sync.js --check` (every target current), lint `git diff --cached --check`, run before the commit
- HEAD: ebf924a7

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
