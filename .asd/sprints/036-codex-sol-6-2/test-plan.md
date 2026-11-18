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
| 8 | 39145211 | delta since 6e04da1e: review-fix wave-1/iter-06 commits ff7b49e0 (`recordOwnedKeys` link guard before `loadSyncState`), hash ledger 2e0e50d3; tester f844ba86 |

## Risk → check decisions

Entry 7's rows are rotated to `test-plan.entry-07.md`.

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

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 426 passed, 0 failed of 426
- Lint / build: pass — build `node .asd/sync.js --check` (every target current), lint `git diff --cached --check`, run before the commit
- HEAD: 82bd745b

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
