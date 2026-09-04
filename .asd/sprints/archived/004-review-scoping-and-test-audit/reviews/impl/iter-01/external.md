[REVIEW-impl-external]: APPROVE

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | None — no external findings produced. The wrapped CLI (`codex-cli 0.150.1`, probe OK) accepted the prompt + 390 KB payload but refused the run: `ERROR: You've hit your usage limit ... try again at Sep 7th, 2026 9:54 AM`. One retry made, same quota error. Skipped per `external-review.md` § Detection; verdict is the contract's skip-APPROVE, not a judgment on the diff. | — |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0

## Verdict

APPROVE — external review skipped, codex unavailable (usage quota exhausted until 2026-09-07 09:54).

## Wrapper-side observation — CONFIRMED by the phase orchestrator

Not produced by the wrapped CLI and not counted in the verdict above. The wrapper surfaced it while waiting on codex; the orchestrator verified it directly and it is **carried into the iteration's fix set as `critical`**.

**Stale `sync.js` in the migration's `require` cache breaks the 4.0.0 migration for every consumer.**

- `.asd/skills/asd-update/update.js:61` loads `sync` at module level from `<repoRoot>/.asd/sync.js` — the consumer's OLD (pre-4.0.0) engine. `loadFreshSync` (`:71`) busts that cache only for the post-apply check at `:392`, which runs *after* `runMigrations` at `:390`.
- `.asd/migrations/4.0.0.js:205` does `require(path.join(repoRoot, '.asd', 'sync.js'))` — the same resolved path — so inside a real `asd-update` process it receives the cached OLD module.
- `hasOwnershipMarker` is new in this diff. Verified: `git show main:.asd/sync.js | grep -c hasOwnershipMarker` → `0`; current working tree → `3`. So `4.0.0.js:92`'s `sync.hasOwnershipMarker(absPath)` throws `TypeError` on the first marked file, `runMigrations` records a failure, `reachedVersion` stays at the old version, and `main()` dies.
- `loadFreshMigration` (`:338`) busts the cache for the migration file only, never for `sync.js` — its own comment ("there is none yet in practice, since these files are new") describes the migration's cache, not the engine's.
- Recovery is doubtful: on re-run `main()` (`:507`) returns "Already up to date." before `applyPlan` whenever no managed path differs, so the migration is never retried unless the version-bearing manifest itself counts as a planned write.
- Untestable as written: `makeMigrationFixtureRepo` copies `sync.js` to a fresh temp path, so no existing test drives `4.0.0.js` through `applyPlan`/`runMigrations` in a process that already loaded `sync.js`.

Matches `review-policy.md`'s `critical` example ("broken migration"). Cheapest fix shape: have `runMigrations` bust `require.cache` for `<repoRoot>/.asd/sync.js` before loading each migration (the same trick `loadFreshSync` already uses), plus one test running the real migration through `applyPlan` with a pre-poisoned cache.

## Orchestrator note — latch interaction (`critical`, carried into the fix set)

This APPROVE is a **skip**, not a review. Under the AC-2 APPROVE latch as written, `asd-phase-impl-review.md` step 8 would write `latched.external = 1`, permanently removing external review from every later iteration of this sprint — including iterations run after the codex quota resets on 2026-09-07. A contract-mandated skip must not latch. The orchestrator therefore did **not** write a latch entry for `external` this iteration, and the rule needs an explicit carve-out.

Fix shape: in `sprint-lifecycle.md` "APPROVE latch", state that only a verdict produced by an actual review latches; an availability skip (`external-review.md`'s skip-APPROVE) records the verdict without latching.

## Next action

1. Append to the sprint decisions-log: `codex CLI unavailable (usage limit exhausted, resets 2026-09-07 09:54), external review skipped for iter 1`. No user prompt required.
2. DoD proceeds on the four internal verdicts; if a later iteration runs after the quota reset, external review resumes normally with the iter-N incremental diff.
3. Both items above (stale-`sync.js` cache, latch-on-skip) route to `impl` review-fix mode with the internal findings.

Signal: `REVIEW_DONE` (external review skipped — codex quota exhausted).
