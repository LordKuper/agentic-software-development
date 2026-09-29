---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 021-deferred-archival-retro-sweep

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | f4ccc40 | full change surface |
| 2 |  | delta since entry 1 |

Entry 2: the delta is `git diff f4ccc40...HEAD` over the self-hosting pathspec. It holds 5 files (+8/−8), README's self-hosting answer and agent memory only: test-fix 4d3a7d3 (D-1..D-3), the asd-dev index line ac11fee and b48906e (D-4). No canon, runtime, hook or test changed, so the safety valve does not fire. The impacted set is every test reading `README.md` or `.claude/agent-memory/**` (the README mirrors, the memory index bijection, the memory sweeps, sprint-021 AC-11 and AC-13). `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d9a047c, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 1's rows were rotated into `test-plan.entry-01.md`; it held no live removal row to carry forward.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`. Mutations M-A and M-B restore the pre-fix blob (`<sha>~1`) of each file a fix commit touched; agent memory and README are outside `upstream_hashes`, so neither run carries ledger noise.

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

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: impacted set (entry 2), no safety valve, run as the whole file because the runner has no selector
- Result: pass — 253/253 passed, 0 failed, 0 skipped (exit 0). The count is unchanged: the entry added one phrase to an existing test
- Lint / build: pass. `git diff --cached --check` is clean at commit; `node .asd/sync.js --check` exits 0, `ok: true`, 74/74 items current
- HEAD: d9a047c, plus this entry's uncommitted test edit, committed right after this record

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | fixed | b48906e |
