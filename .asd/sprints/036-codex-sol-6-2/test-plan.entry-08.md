# Test plan — sprint 036-codex-sol-6-2, entry 8 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `recordOwnedKeys` refuses a linked `sync-state.json` or `.asd` before `loadSyncState` reads it (ff7b49e0, AC-16, external 1) | A linked ledger holding invalid JSON is parsed first, so the parse error text, and with it the linked file's content, reaches the warning; the refusal fires only after the read | component (CLI over a symlink and a junction, invalid JSON behind the link) | add | f844ba86 pins it: `AC-16 (external 1, iter-06): attribution-check over a linked ledger holding invalid JSON ...`, fail-first (`Added tests`) |
| link helpers hoisted (`linkedLedgerRepo`, `linkedAsdDirRepo`, `linkedLedgerCases`; f844ba86) | The refactor weakens the entry 7 linked-ledger test | component | none | `AC-16 (external 3): ...over a symlinked .asd/sync-state.json or a linked .asd directory ...` keeps its assertion and expected outcomes unchanged and passes in the full run |
| hash ledger 2e0e50d3 (`.asd/release-manifest.json` `upstream_hashes` for `.asd/sync.js`) | Stale ledger fails the hash tests and the sync check | static, suite | none | full suite green; `node .asd/sync.js --check` reports `ok: true` |

## Removed tests

No test removed this entry. Entry 5 removed the 0600 mode test (`test-plan.entry-05.md`).

## Added tests

The review-fix tester's f844ba86 added the test below; entry 8 adds none further. Proof run: pre-fix tree = `git archive ff7b49e0^` (the parent of the dev commit) extracted to `.asd/tmp/prefix-ff7b49e0/` with this `tests/run.js` copied in, deleted after; `node tests/run.js --filter "linked ledger holding invalid JSON"`, matched 1 of 1, exit 1.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-16 (external 1, iter-06): attribution-check over a linked ledger holding invalid JSON warns its record could not be saved without any text of the linked file in stdout or stderr, and leaves that file byte-identical` | fail-first: pre-fix tree, exit 1, 0/1 passed, `AC-16: the linked file is refused before it is parsed, so the warning carries none of its text and its bytes stay` |
