# Test plan — sprint 036-codex-sol-6-2, entry 7 (rotated)

## Risk → check decisions

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
