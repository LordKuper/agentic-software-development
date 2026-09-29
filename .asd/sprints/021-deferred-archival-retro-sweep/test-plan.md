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
| 2 | 74948d3 | delta since entry 1 |
| 3 | aa58506 | delta since entry 2 |
| 4 |  | delta since entry 3 |

Entry 2: the delta is `git diff f4ccc40...HEAD` over the self-hosting pathspec. It holds 5 files (+8/−8), README's self-hosting answer and agent memory only: test-fix 4d3a7d3 (D-1..D-3), the asd-dev index line ac11fee and b48906e (D-4). No canon, runtime, hook or test changed, so the safety valve does not fire. The impacted set is every test reading `README.md` or `.claude/agent-memory/**` (the README mirrors, the memory index bijection, the memory sweeps, sprint-021 AC-11 and AC-13). `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d9a047c, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 1's rows were rotated into `test-plan.entry-01.md`; it held no live removal row to carry forward.

Entry 3: the delta is `git diff 74948d3...HEAD` over the self-hosting pathspec. It holds 10 files (+32/−17): the impl-review wave-1/iter-01 review-fix commits f9df1c3 (C-1), 4d6286a (external #1), 9e88920 (C-4, external #2), 73745d4 (C-2, external #3) and fcb9d2c (C-3), the ledger refresh a284a0d, and a new `asd-reviewer-combined` memory. `.asd/runtime.js` changed, and `tests/run.js` requires it, so the safety valve fires. `tests/run.js` has no selector, so the set runs as the whole file either way. Pre-strategy run (HEAD 43c604a, tests as found): `node tests/run.js` → exit 1, 252/253 passed, FAIL sprint-021 AC-12: surface-check never counts a generated provider view …, "every provider-tree file sync.js writes is regenerated from canon, never reviewable change surface, so none may count against the cap", `2 !== 0`. That is a test defect: the test took every sync-plan target containing `/` as a view, including the two JSON-merge targets that 4d6286a now counts on purpose. Entry 2's rows were rotated into `test-plan.entry-02.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 4: the delta is `git diff aa58506...HEAD` over the self-hosting pathspec. Outside the sprint folder it holds 2 files (+2/−2): the review-fix commit b0f0daf (iter-02 external #1, `asd-phase-pr.md` merge mode step 1) and the ledger refresh 7a9b496 (`release-manifest.json`). No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading `asd-phase-pr.md` or `release-manifest.json`: the sprint-021 AC-1/AC-2 test, the phase-chain mirrors, the corpus citation sweep and the ledger tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD 3a0b7a4, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 3's rows were rotated into `test-plan.entry-03.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`, entry 2's in `test-plan.entry-02.md`, entry 3's in `test-plan.entry-03.md`. Mutations M-J to M-N are listed under Added tests. Each edits `asd-phase-pr.md`, a `managed_paths` file, so each run also fails the `upstream_hashes` ledger test. That is expected noise and is not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `asd-phase-pr.md` merge mode step 1 confirms `origin/<state.branch>`'s `state.json` holds `pr.number`, and commits and pushes it if not, before merging (b0f0daf, iter-02 external #1) | the check is dropped or moved after the merge; an open-mode push that failed or never ran then squashes `pr=null` onto base, and asd-sprint never requests closure | contract | add | §17: the step fixes a medium finding that no test pinned, and it has a single acting site. Entry 3 pinned open mode's commit and push on the same ground. Three asserts go into the sprint-021 AC-1/AC-2 test, which already reads merge mode. They take the merge-mode text before its `git-strategy.md` "Merging a PR" citation, located by the citation and not by step number. The first requires a code span naming both `origin/` and `state.json`. The other two require `commit` and `push` in the prose, each on its own, with code spans stripped and each clause naming `FAILED` dropped. Without the clause filter, "a push failure is `FAILED`" alone satisfies `push`. M-L keeps that clause, drops only the instruction, and the push assert fires. M-N rewrites the check end to end in its own `1a.` step and the test stays green |
| the same step's "a push failure is `FAILED`" | a failed republish push does not halt, and the merge proceeds | — | none | a `FAILED` presence assert proves the clause mentions the signal, not that it halts. "a push failure is not `FAILED`" would pass. Halting on `FAILED` is the workflow's generic signal handling. A machine-readable failure-route list would make it assertable |
| `release-manifest.json` hash refresh (7a9b496) | a stale ledger | — | keep | the `upstream_hashes` test reads every entry, and it passed at HEAD 3a0b7a4 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 4.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-1/AC-2 (D1): … pr merge mode republishes it if the PR head lacks it before merging … (three asserts and one sanity assert added, iter-02 external #1) | M-J restores `asd-phase-pr.md` from `b0f0daf~1` → exit 1, 251/253, FAIL sprint-021 AC-1/AC-2 …, "AC-2: pr merge mode must read state.json from the remote sprint branch before merging …". M-K drops only ``commit the local `state.json.pr` write if uncommitted, `` → exit 1, 251/253, FAIL …, "AC-2: pr merge mode must commit a local state.json.pr write the remote branch lacks before merging …". M-L drops only `push the sprint branch and ` → exit 1, 251/253, FAIL …, "AC-2: pr merge mode must push the sprint branch when the remote lacks pr.number, before merging …". M-M moves the whole check after the merge sentence → exit 1, 251/253, FAIL …, "AC-2: pr merge mode must read state.json from the remote sprint branch before merging …". M-N rewrites the check with the same substance as its own step `1a.` → exit 1, 252/253. The only FAIL is the ledger noise, and this test stays green. After each run the file was restored byte-equal |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: impacted set (entry 4). The safety valve does not fire, and the runner has no selector, so the whole file runs
- Result: pass. 253/253 passed, 0 failed, 0 skipped (exit 0). The count is unchanged: this entry extended one existing test and added none
- Lint / build: pass. `git diff --cached --check` is clean at commit; `node .asd/sync.js --check` exits 0, `ok: true`, 74/74 items current
- HEAD: 3a0b7a4, plus this entry's uncommitted test edit, committed right after this record

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | fixed | b48906e |
