# Test plan — sprint 021-deferred-archival-retro-sweep, entry 2

Rotated narrative rows of entry 2 (`artifact-layout.md` "Test plan"). No review-fix or in-place tester rows were added after it. Never edited; a changed risk gets a superseding row in live `test-plan.md`.

## Risk → check decisions

Mutations M-A and M-B restore the pre-fix blob (`<sha>~1`) of each file a fix commit touched; agent memory and README are outside `upstream_hashes`, so neither run carries ledger noise.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| README self-hosting answer and asd-dev How-to-apply sentences (4d3a7d3, D-1..D-3) | a dev is told to run `sync.js --apply` again | static sweep | keep | the entry-1 AC-11 sweep, re-proved against the fix itself: M-A restores the three files from `4d3a7d3~1` → `node tests/run.js` exit 1, 252/253, FAIL sprint-021 AC-11 …, "a memory's How-to-apply is the instruction a dev acts on … D-1/D-2/D-3 (test-plan.md): .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md, …" |
| asd-dev `MEMORY.md` index line (ac11fee) and the same memory's `description` (4d3a7d3) | an index or description line tells a dev to run `--apply` | — | none | the removed text said what `--apply AGENTS.md` does, true and naming no actor, so it had no failure mode. The instruction a dev acts on is the How-to-apply sentence, pinned by the row above. A pin on the new wording would be a wording lock |
| asd-tester memory, stale hash ledger routing (b48906e, D-4) | a stale `upstream_hashes` ledger is routed to a dev again, who never runs `--apply` | static sweep | add | §17: every fixed defect leaves a regression proof, and none existed. The D-4 file restored from `b48906e~1` left the suite green, exit 0, 253/253. The AC-11 rule (a sentence naming `--apply` must deny it or name the orchestrator) cannot widen to all memory: the same file states "only by running `node .asd/sync.js --apply <file...>` afterward" as a fact. So the exact removed phrase joins the AC-13 leftover list, which already sweeps every memory directory (`artifact-layout.md` "Leftover-term check": exact removed terms, no free phrasing). Limit: a reworded reintroduction passes |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 2.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-13: no canon, README, AGENTS.md, runtime, hook … (phrase ``for a dev to fix via `sync-apply` `` added, D-4) | M-B restores the D-4 file from `b48906e~1` → `node tests/run.js` exit 1, 252/253, FAIL sprint-021 AC-13 …, "each phrase is a line this sprint deleted (git diff main...HEAD) …". The same restore before the phrase was added: exit 0, 253/253 |
