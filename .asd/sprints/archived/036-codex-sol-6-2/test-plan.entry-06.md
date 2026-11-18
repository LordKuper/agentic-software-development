# Test plan — sprint 036-codex-sol-6-2, entry 6 (rotated)

## Risk → check decisions

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
