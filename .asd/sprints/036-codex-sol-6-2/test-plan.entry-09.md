# Test plan — sprint 036-codex-sol-6-2, entry 9 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| link guard moved into `loadSyncState`; `recordOwnedKeys`' own copy removed (26c3f66e, AC-16, external 1). Supersedes entry 8's `recordOwnedKeys` row | `sync --check`, `--apply` and `recordOwnedKeys` read a linked ledger or `.asd` and parse it, so the parse error text, and the linked file's content, reaches stderr; the guard is lost for one caller after the dedup | component (CLI over a symlink and a junction, invalid JSON behind the link, both sync flags and the attribution check) | none | already pinned: 1f34644c `AC-16 (external 1, iter-07): sync --check and --apply over a symlinked ledger or a linked .asd directory ...`, fail-first (`Added tests`); entry 8's `attribution-check` test still covers the recordOwnedKeys caller and passes |
| sync.js CLI catch-all: a thrown error becomes one `sync: <message>` stderr line, exit 1 (26c3f66e) | The catch-all is exercised only by the link refusal; a regression that rethrows or prints a stack for any other thrown error passes the link test | component (CLI over an unlinked ledger of an unsupported `schema_version`) | add | `AC-16 (external 1, iter-07): sync --check over an unlinked ledger of an unsupported schema_version exits 1 with one "sync: " stderr line ...`, fail-first (`Added tests`) |
| hash ledger 69e01d42 (`.asd/release-manifest.json` `upstream_hashes` for `.asd/sync.js`) | Stale ledger fails the hash tests and the sync check | static, suite | none | full suite green; `node .asd/sync.js --check` reports `ok: true` |

## Removed tests

No test removed this entry. Entry 5 removed the 0600 mode test (`test-plan.entry-05.md`).

## Added tests

The review-fix tester's 1f34644c added the first test below, entry 9 the second. Proof runs: pre-fix tree = `git archive <parent of the dev commit>` extracted to `.asd/tmp/prefix-<sha>/` with this `tests/run.js` copied in, deleted after; each is `node tests/run.js --filter "<substring>"`, matched 1 of 1, exit 1.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-16 (external 1, iter-07): sync --check and --apply over a symlinked ledger or a linked .asd directory holding invalid JSON each exit 1 with one "sync: " stderr line naming the link refusal, no stack and no fragment of the linked file, and leave it byte-identical` | fail-first (1f34644c): pre-fix tree = `26c3f66e^`, the linked ledger was parsed first so the error text and a stack reached stderr; exit 1, 0/1 passed |
| tests/run.js:`sprint-036 AC-16 (external 1, iter-07): sync --check over an unlinked ledger of an unsupported schema_version exits 1 with one "sync: " stderr line naming it, no stack and no stdout - the CLI catch-all reports any thrown error, not only a link refusal` | fail-first (entry 9): pre-fix tree = `26c3f66e^` (no catch-all), the CLI died with an uncaught stack trace; exit 1, 0/1 passed, `AC-16: a non-link thrown error ends as one sync: line and exit 1, not a stack trace` |

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 428 passed, 0 failed of 428
- Lint / build: pass — build `node .asd/sync.js --check` (every target current), lint `git diff --cached --check`, run before the commit
- HEAD: a09b3804
