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

## Risk → check decisions

Entry 4's rows, with the iter-03 review-fix tester's, are rotated to `test-plan.entry-04.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `cleanSettingsFile` in-place write and symlink or junction refusal (e888835c, AC-16) | A failed in-place write escapes as exit 2 or stops the other file; a linked file or `.claude` is written through; a spaced preload path breaks the stub | component (CLI) | none | 7ec4c1ab already pins it: `AC-16: attribution-check whose in-place write ...` and `AC-16: attribution-check leaves a settings file untouched ...`, each with its fail-first run in `test-plan.entry-04.md` |
| `attribution-check` inserts nothing; sync inserts and records the owned key (cc4df9f7, AC-15/AC-16) | The check inserts the value unrecorded, so a flip back to `enabled` keeps attribution off | component (CLI, `runApply`, `runCheck`) | none | 7ec4c1ab already pins it: `AC-15/AC-16: attribution-check never inserts ...`, with its fail-first run |
| `writtenKeys` records only a changed key, keeps a recorded one (cc4df9f7, AC-15) | A pre-existing off value is recorded as sync's and deleted under `enabled`; a hooks-only write forgets a recorded key | component (`runApply`, `runCheck`) | none | 7ec4c1ab already pins it: `AC-15: an off attribution value the user set by hand ...` and `AC-15 (combined F1): ...`, with a fail-first run and a mutation |
| render-side `recordedKeys` filter in `runApply` (AC-15) | Stale hooks re-render and delete a hand-set `{"commit":"","pr":""}` under `enabled` | component (`runApply`) | none | 7ec4c1ab already pins it: `AC-15 (combined F2): ...`, with its mutation proof |
| asd-sprint `### Attribution check`: `sync --apply` first, tracked-only commit (cc4df9f7, e888835c, AC-16) | The check inserts through no writer; an untracked `settings.local.json` is staged | content-contract pin | none | 7ec4c1ab already re-pinned `AC-16: asd-sprint runs its attribution check ...` with five mutations and a reword control |
| `attribution-check` inserts, replaces and records the owned value itself; no startup `sync --apply` (f7229065: combined F1, external 1, 2, 5, 6, AC-15/AC-16). Supersedes the rows above that pin `attribution-check` inserting nothing and the `sync --apply` first step | The check writes the release manifest or the sync state without a record; writes through a linked `.claude`; leaves a missing-`pr`, non-object or extra-member `attribution` unreplaced; inserts into or records `settings.local.json`; records a file sync never applied; the skill and its `ops` still run sync | component (CLI, `runApply`, `runCheck`) and content-contract pin | add | the iter-04 review-fix tester's rows under `Added tests`; the older `never inserts` test and `asd-sprint runs its attribution check` pin are re-pinned in place |
| `rewriteInPlace` restore and the per-file read warning (f7229065: external 3, 4, AC-16). Supersedes the in-place write row above | A write failing after truncating leaves a damaged file reported as untouched; a read error escapes the per-file handler and drops the other file and the Codex hint | component (CLI, preload stub, a directory in place of the file) | add | the in-place write test is re-authored in place for both restore outcomes; the read error is a new test |
| 0600 mode test `AC-16: attribution-check keeps the file mode ...` (92c4bb8c) | None left: the in-place write at `.asd/runtime.js` creates no file and performs no `chmod`, so no mode can be lost; POSIX-only, with no fail-first run owed to a first POSIX host | removal | remove | the review-fix row of entry 4; deleted this entry, recorded under `Removed tests` |
| views bf520fc8, release manifest, README, `t_config.yaml`, asd-init text | Stale view or mirror | static | none | `node .asd/sync.js --check` reports every target `current`; the prose adds no contract beyond the pins above |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| tests/run.js:`sprint-036 AC-16: attribution-check keeps the file mode of the settings file it rewrites, a 0600 file staying 0600` | The mechanism it guarded is gone: e888835c writes the file in place, so no replacement file is created and no `chmod` runs; the file's mode is the filesystem's own and nothing in the change can alter it. It was POSIX-only and skipped on win32, so it never ran on the only host. Not a redundancy removal: no surviving test covers it, there is no branch left to cover | yes: `tests/run.js` is in the sprint change surface (the test was authored in this sprint, 5b71f711) |

## Added tests

Entry 5 adds no test; every delta risk is pinned by 7ec4c1ab (rows above).

Iter-04 review-fix tester rows. Pre-fix tree = `git archive fdecf726` (the parent of the dev commit f7229065) extracted to `.asd/tmp/prefix-fdecf726/` with this `tests/run.js` copied in, deleted after. Each run is `node tests/run.js --filter "<substring>"`, matched 1 of 422. A mutation edits `.asd/runtime.js` or the asd-sprint skill and is restored by the same script before its next command (`git status` clean after).

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-16 (external 3): attribution-check whose in-place write ... restores the original bytes ...` (replaces the in-place write test; a first and a second failing write) | fail-first: pre-fix tree, filter `external 3): attribution-check whose in-place`, exit 1, `AC-16: the write fails after truncating the file, the original bytes are written back and the warning states it is untouched; the other file is still cleaned` |
| tests/run.js:`sprint-036 AC-15/AC-16 (external 1, 2, 5): attribution-check under disabled inserts the missing owned attribution value ...` (replaces `never inserts`) | fail-first: pre-fix tree, filter `inserts the missing owned attribution value`, exit 1, `AC-16: one fix line names the inserted value and nothing is warned`; mutation `sync.recomputeAndWriteHashLedgers(repoRoot)` added after the `recordOwnedKeys` call: filter `external 1, 2, 5)`, exit 1, `AC-15: sync --check reads current afterwards; the release manifest bytes and settings.local.json are untouched`; runs: 1 |
| tests/run.js:`sprint-036 AC-15/AC-16 (external 5): attribution-check replaces a present attribution value that is not the owned one ...` | fail-first: pre-fix tree, filter `replaces a present attribution value`, exit 1, `AC-16: each non-owned shape is replaced by the owned value with a "replaced by" line, recorded, and the local file with its own incomplete attribution stays as it was`; mutation `ownAttribution(settings)` applied to every settings file: filter `external 5): attribution-check replaces`, exit 1, the same assertion; runs: 1. A record written for `settings.local.json` has no mutation: `recordOwnedKeys` returns for a file with no sync-state entry, so the mutation is equivalent |
| tests/run.js:`sprint-036 AC-15/AC-16 (external 5): attribution-check with no sync-state record of .claude/settings.json ...` | fail-first: pre-fix tree, filter `no sync-state record`, exit 1, `AC-15: the value is inserted and no sync-state file is created` |
| tests/run.js:`sprint-036 AC-16 (external 4): attribution-check whose read of one settings file fails ...` | fail-first: pre-fix tree, filter `(external 4)`, exit 1, `AC-16: the unreadable first file is a warning, the second file is cleaned and the Codex hint still prints` |
| tests/run.js:`sprint-036 AC-16 (external 2): a startup check over a .claude junction writes nothing anywhere ...` | pre-fix tree green: the old startup write was the skill's `sync --apply`, now pinned by the asd-sprint row below, and the runtime check never wrote through a link; mutation removing the `isSymlink` refusal in `cleanSettingsFile`: filter `external 2): a startup check`, exit 1, `AC-16: the link is refused before any write, so no file of the repo changes`; runs: 1 |
| tests/run.js:`sprint-036 AC-16: asd-sprint runs its attribution check ...` (re-pinned: no sync step or grant, the check inserts and records, the sync state committed when changed) | mutation restoring the superseded sync step in the check, then in `ops`, then removing the sync-state commit clause keeping its citation, then removing the sync-state record from `ops`: filter `asd-sprint runs its attribution check`, each exit 1 at `AC-16: the check runs without a sync step ...`, `AC-16: the skill grants no sync run, and names the check and the sync-state record it writes` (twice) and `AC-16: the sync state, which the check records into, is committed when status shows it changed`; control rewording `relay its fix` to `pass along its fix`, exit 0; runs: 4 |

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 422 passed, 0 failed of 422 (iter-04 review-fix tester; entry 5 recorded 418/418 at 144e3aba)
- Lint / build: pass — build `node .asd/sync.js --check` (every target current), lint `git diff --cached --check`, run before the commit
- HEAD: 0d40d74a plus this commit's `tests/run.js` and test-plan changes

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
