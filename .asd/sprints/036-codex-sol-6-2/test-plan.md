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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `recordedKeys`, `owned_keys`, release only what sync wrote (0702af2d, AC-15) | A hand-set off value sync never wrote is read stale and deleted under an absent or `enabled` key; an entry with no record never seeds | component (`runApply`, `runCheck`) | none | 5b71f711 already pins it: `AC-15: an off attribution value the user set by hand ...`, the `owned_keys` record asserts in `AC-15: sync json-merge carries ...` and the stale-until-recorded change in `AC-15/AC-16: under disabled attribution-check inserts ...`, each with its fail-first run in the iter-02 rows of entry 3's segment |
| `cleanSettingsFile` failure path (92c4bb8c, AC-16) | A failed write or rename exits 2 or leaves a `.tmp` | component (CLI behind a `--require` stub) | none | `AC-16: attribution-check that cannot write or rename ...` (5b71f711) runs on every host and has its fail-first run |
| `cleanSettingsFile` keeps the file mode (92c4bb8c, AC-16) | A 0600 file becomes umask-default | component (POSIX) | none | `AC-16: attribution-check keeps the file mode ...` (5b71f711) is POSIX-only and skips on win32; its fail-first run is still owed to the first POSIX run, the only host here being win32 |
| `attribution-check -- <files>` per-file skip (8185f58b, AC-16) | One dirty file skips the whole check; a flag or foreign path is accepted | component (CLI) | none | `AC-16: attribution-check skips a file named after -- ...` and the re-pinned `AC-16: asd-sprint runs its attribution check ...` (5b71f711), each with a fail-first run |
| tech-reference gate per tech and per command (8185f58b, AC-8) | A new library with no tech-reference raises no `FAILED` | content-contract pin | none | the AC-8 assert in `AC-8/AC-10/AC-11/AC-13 ...` (5b71f711) pins both clauses, with mutations and a reword control |
| views and `owned_keys` seed (44bd775a) | Stale view; a missing seed | static | none | `node .asd/sync.js --check` proves the views; the seed is exercised by the record asserts above |
| `cleanSettingsFile` writes in place, refuses a symlinked file or `.claude` (e888835c, iter-03 external 1-4, AC-16) — supersedes the entry's failure-path, mode and realpath-guard decisions | A failed in-place write escapes as exit 2 or stops the other file; a file or directory link, outside the repo or inside it, is written through; a spaced preload path breaks the stub | component (CLI behind a quoted `--require` stub of `fs.writeFileSync`; real junctions and, where the host allows, file symlinks) | add | `AC-16: attribution-check whose in-place write ...` replaces the temp-file/rename test (no temp file or rename exists); `AC-16: attribution-check leaves a settings file untouched ...` now expects the one symlink-or-junction warning for an outside and an inside target, with a plain-file control |
| 0600 mode test (`AC-16: attribution-check keeps the file mode ...`, 92c4bb8c) | None left: no temp file and no `chmod` exist, an in-place write never replaces the file, and the test is POSIX-only with no fail-first run owed to a first POSIX host | removal finding | remove | for the next `impl-test` entry to delete under `Removed tests` (a review-fix tester deletes no test); until then it is skipped on win32 and green on POSIX |
| `attribution-check` inserts nothing; sync inserts and records the owned key (cc4df9f7, iter-03 combined F1, external 5, AC-15/AC-16) — supersedes the `attribution-check` insert test of entry 3 | `attribution-check` still inserts the value and never records it, so a flip back to `enabled` keeps Claude Code attribution off | component (CLI over a sync-applied mini repo, then `runApply`, `runCheck`) | add | `AC-15/AC-16: attribution-check never inserts ...`: the check alone changes neither file and the status stays stale; apply inserts and records; the flip back to `enabled` drops the key and its record |
| `writtenKeys`: record only a key sync changed, keep a recorded one (cc4df9f7, iter-03 combined F1, AC-15) — supersedes the hand-set test's stale-once seed | A pre-existing off value is recorded as sync's and an `enabled` apply deletes it; a later hooks-only write forgets a recorded key | component (`runApply`, `runCheck`) | add | `AC-15: an off attribution value the user set by hand ...` now reads `current` and unrecorded under absent, `enabled` and `disabled`, and stays after a later `enabled`; `AC-15 (combined F1): ...` re-renders stale hooks under `disabled` over a hand-set value (unrecorded) and over a sync-written one (still recorded) |
| render-side `recordedKeys` filter in `runApply` (0702af2d, iter-03 combined F2, AC-15) — supersedes the entry's `recordedKeys` `none` row, which held only for the status half | A release that makes the owned hooks stale re-renders and deletes a hand-set `{"commit":"","pr":""}` under `enabled`, turning attribution back on | component (`runApply` over hooks aged by `ageOwnedHooks`: `_asd` entry and sync-state digest moved together, status `stale`) | add | `AC-15 (combined F2): ...`; the status-only hand-set test stays green with the render filter reverted, which is the gap |
| asd-sprint `### Attribution check`: `sync --apply` first, extended status, tracked-only commit (cc4df9f7, e888835c, AC-16) | The check inserts through no writer; a dirty `sync-state.json` is overwritten; an untracked `settings.local.json` is staged | content-contract pin | add | `AC-16: asd-sprint runs its attribution check ...` re-pinned to the new status command, the `sync --apply` step ahead of the check, `attribution-check [-- <listed settings files>]`, the `git ls-files --error-unmatch` clause and the `ops` grant |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Iter-03 review-fix tester rows. Pre-fix tree = `git archive e100625d` (the parent of the dev commits cc4df9f7, e888835c) extracted to `.asd/tmp/prefix-e100625d/` with this `tests/run.js` copied in; mutation tree = `git archive bf520fc8` (the synced HEAD) extracted likewise with this `tests/run.js`; both deleted after. Each run is `node tests/run.js --filter "<substring>"`, matched 1 of 419. A mutation is restored by recopying the archived file.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-16: attribution-check whose in-place write ...` (replaces the temp-file test) | fail-first: pre-fix tree, filter `AC-16: attribution-check whose in-place`, exit 1, `AC-16: a failed in-place write is a warning with exit 0 and the file stays as it was`; the preload sits under a directory named `stub dir` and is passed quoted: the same path unquoted makes `node` exit 1 at load, quoted exit 0 |
| tests/run.js:`sprint-036 AC-16: attribution-check leaves a settings file untouched ...` (changed) | fail-first: pre-fix tree, filter `AC-16: attribution-check leaves a settings file untouched`, exit 1, `AC-16: a .claude directory linked outside the repo is refused with a warning and the file behind it is untouched`; the plain-file control is green on both trees |
| tests/run.js:`sprint-036 AC-15/AC-16: attribution-check never inserts ...` (replaces the insert test) | fail-first: pre-fix tree, filter `AC-15/AC-16: attribution-check never inserts`, exit 1, `AC-16: attribution-check alone inserts nothing into either settings file, so sync still reads the missing key stale` |
| tests/run.js:`sprint-036 AC-15: an off attribution value the user set by hand ...` (changed) | fail-first: pre-fix tree, filter `AC-15: an off attribution value`, exit 1, `AC-15: ai_attribution disabled - a hand-set off value is the user's own, never stale` |
| tests/run.js:`sprint-036 AC-15 (combined F1): a write under disabled records ...` | fail-first of the changed-key assert: pre-fix tree, filter `AC-15 (combined F1)`, exit 1, `AC-15: a re-render that finds the owned value already there leaves it the user's, unrecorded`; the recorded-key-stays assert is green on the pre-fix tree (it recorded every write), so its proof is a mutation: mutation tree, `previous.includes(key) || ` removed from `writtenKeys` in `.asd/sync.js`, same filter, exit 1, `AC-15: a later write that changes only the hooks keeps the key recorded`; runs: 2 |
| tests/run.js:`sprint-036 AC-15 (combined F2): an apply that re-renders stale hooks ...` | the pre-fix tree is green (the render filter already existed), so mutation proof: mutation tree, the render-side `recordedKeys(syncState, item.relKey, releasedKeys)` in `runApply` reverted to `releasedKeys`, filter `AC-15 (combined F2)`, exit 1, `AC-15: the hooks are re-rendered to the released ones and the render releases no key sync never wrote`; under the same mutation filter `AC-15: an off attribution value` exits 0, so only this test reaches the render site; runs: 2 |
| tests/run.js:`sprint-036 AC-16: asd-sprint runs its attribution check ...` (re-pinned) | mutation tree, filter `asd-sprint runs its attribution check`, each exit 1 and restored: the status command without `.asd/sync-state.json` (`AC-16: a tracked settings or sync-state file with a user change is found by status ...`), the `sync --apply` step turned into `sync.js --check` (`AC-16: sync --apply runs before the check ...`), the check form back to `[-- <listed files>]` (`AC-16: the check always runs and takes the user-modified settings files after --`), the `git ls-files --error-unmatch` clause removed (`AC-16: it commits only a tracked file that a fix line names or the sync changed ...`), `git ls-files` dropped from `ops` (`AC-16: the skill grants the sync, the status read, the tracked-file lookup and the commit its step performs`); control: "so its edit" reworded, exit 0; runs: 6 (five mutations, one control) |

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 419 passed, 0 failed of 419 (review-fix wave-1/iter-03 tester run)
- Lint / build: pass — build `node .asd/sync.js --check`, lint `git diff --cached --check`, run before the commit
- HEAD: bf520fc8 plus this review-fix's `tests/run.js`, the only path changed since the views sync

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
