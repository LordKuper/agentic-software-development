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
| 3 |  | delta since entry 2 |

Entry 2: the delta is `git diff f4ccc40...HEAD` over the self-hosting pathspec. It holds 5 files (+8/−8), README's self-hosting answer and agent memory only: test-fix 4d3a7d3 (D-1..D-3), the asd-dev index line ac11fee and b48906e (D-4). No canon, runtime, hook or test changed, so the safety valve does not fire. The impacted set is every test reading `README.md` or `.claude/agent-memory/**` (the README mirrors, the memory index bijection, the memory sweeps, sprint-021 AC-11 and AC-13). `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d9a047c, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 1's rows were rotated into `test-plan.entry-01.md`; it held no live removal row to carry forward.

Entry 3: the delta is `git diff 74948d3...HEAD` over the self-hosting pathspec. It holds 10 files (+32/−17): the impl-review wave-1/iter-01 review-fix commits f9df1c3 (C-1), 4d6286a (external #1), 9e88920 (C-4, external #2), 73745d4 (C-2, external #3) and fcb9d2c (C-3), the ledger refresh a284a0d, and a new `asd-reviewer-combined` memory. `.asd/runtime.js` changed, and `tests/run.js` requires it, so the safety valve fires. `tests/run.js` has no selector, so the set runs as the whole file either way. Pre-strategy run (HEAD 43c604a, tests as found): `node tests/run.js` → exit 1, 252/253 passed, FAIL sprint-021 AC-12: surface-check never counts a generated provider view …, "every provider-tree file sync.js writes is regenerated from canon, never reviewable change surface, so none may count against the cap", `2 !== 0`. That is a test defect: the test took every sync-plan target containing `/` as a view, including the two JSON-merge targets that 4d6286a now counts on purpose. Entry 2's rows were rotated into `test-plan.entry-02.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`, entry 2's in `test-plan.entry-02.md`. Mutations M-C to M-I are listed under Added tests. Each one edits a `managed_paths` file, so each run also fails the `upstream_hashes` ledger test. That is expected noise and is not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `isGeneratedView` counts `.claude/settings.json` and `.codex/hooks.json` (4d6286a, external #1); supersedes entry 1's `surfaceCheck` generated-views row | a hand edit to a JSON-merge hook registration escapes review again, or the two pathspecs drift from the classifier | unit + contract | keep (rewritten in place) | the AC-12 test now derives the JSON-merge set from the sync plan's `class: 'json-merge'` items. It drops that set from the views and requires both targets to count. It also requires the consumer row in `external-review.md` "Phase-scoped payload" and the framework change surface in `sprint-lifecycle.md` "Self-hosting" to exclude every view and keep the JSON-merge targets in. The self-hosting pathspec had no pin before this entry, although 4d6286a edited it |
| `runtime.js` `isUiSurface` case-folds its `.asd/` exception and loses its export (9e88920, external #2, C-4) | `.ASD/rules/notes.html` is read as a UI surface; a test imports the dropped export | unit/property | add | the sprint-012 AC-12 loop now runs its framework-HTML case for `.asd/` and `.ASD/`, through the emitted manifest's n/a rows as entry 1 did. No test referenced the export, so its removal needs no test change |
| `asd-phase-pr.md` open mode commits and pushes `state.json.pr` before `NEXT: await-merge` (f9df1c3, C-1) | the step is dropped or moved after `await-merge`, the base copy keeps `pr=null` and asd-sprint never requests closure for a merged sprint | contract | add | §17: the step fixes a medium finding that no test pinned. Deleting it is the live risk, since nothing else restates it at an acting site. Two asserts go into the sprint-021 AC-1/AC-2 test, which already reads pr merge mode. The asserts take the text after the `state.json.pr` write, through every step before the one emitting `NEXT: await-merge`, with code spans stripped, and require `commit` and `push` in it, each on its own. Without the code-span strip, a citation could satisfy the word. M-I rewords the clause and moves it into its own `3a.` step, and the test stays green, so the asserts are no single-sentence wording lock |
| `sprint-lifecycle.md` "PR phase" "Merged-unclosed" sentence (f9df1c3) | the sentence explaining why base carries `pr.number` is lost | — | none | it explains the dependency. The instruction the orchestrator acts on is open mode step 3, pinned by the row above. That step cites the sentence, and the corpus citation sweep resolves the cited `sprint-lifecycle.md` "PR phase" heading. It does not check the second label, "Merged-unclosed". A presence pin on the explanation would lock wording |
| README reviewer return-file sentence (73745d4, C-2, external #3) | README tells a reader that External Review writes a return file | static | keep | the return-file path at README is pinned by the sprint-021 AC-7/AC-10/AC-11 two-site literal test, and it passed at HEAD. The fix narrows the writer set to internal reviewers. The only assertable form of that is qualifier presence (`each internal reviewer`), and a correct rewording such as "every reviewer except External Review" would fail it. A machine-readable writer list in `review-policy.md` would make it assertable |
| AGENTS.md tail sync cadence "once per wave or fix round" (fcb9d2c, C-3) | an AGENTS.md reader expects no view sync after a fix round | — | none | AGENTS.md restates `sprint-lifecycle.md` "Self-hosting". The orchestrator acts on that section and on `asd-phase-impl.md` step 7 ("the round's (fix modes) last canon-editing dispatch"), which already carry the fix round. Neither changed in this delta. The sprint-021 AC-11 sanity assert pins only that the home gives the sync to the orchestrator; no site pins the cadence. A `fix round` token pin on the AGENTS.md copy would lock the wording of a mirror, not substance |
| `artifact-layout.md` folder map moves the JSON-merge files off the generated-view lines (4d6286a) | the map calls a user-editable file a generated view | — | none | a display line. The classification it mirrors is asserted against runtime and both pathspecs (first row), and README's folder map already marks both files JSON-merge. A pin would need a parser for the tree-drawing format |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 3.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-12: surface-check never counts a generated provider view or a pure rename … (test defect fixed: JSON-merge targets filtered out of the views, required to count, and required to stay inside both review pathspecs) | Before the fix, at HEAD 43c604a: exit 1, 252/253, FAIL "every provider-tree file sync.js writes is regenerated from canon …", `2 !== 0`. M-C restores `.asd/runtime.js` from `4d6286a~1` → exit 1, 250/253, FAIL sprint-021 AC-12 …, "root managed-block targets carry hand-edited tails, the JSON-merge hook registrations (ASD owns only its hook entry) can hold user content …". That blob also predates 9e88920, so the sprint-012 AC-12 `.ASD/` case fails in the same run. M-D restores `external-review.md` from `4d6286a~1` → exit 1, 251/253, FAIL sprint-021 AC-12 …, "external-review.md "Phase-scoped payload" consumer impl-review row: the pathspec must keep the JSON-merge hook registrations in …". M-E restores `sprint-lifecycle.md` from `4d6286a~1` → exit 1, 251/253, FAIL sprint-021 AC-12 …, "sprint-lifecycle.md "Self-hosting" framework change surface: the pathspec must keep the JSON-merge hook registrations in …" |
| tests/run.js: sprint-012 AC-12: emit-manifest derives rule and section ids … (`.ASD/rules/notes.html` case added, external #2) | M-F restores `.asd/runtime.js` from `9e88920~1` (pre-fix `isUiSurface`) → exit 1, 251/253, FAIL sprint-012 AC-12 …, ".ASD/rules/notes.html: an .html under .asd/ outside .asd/templates/ is framework infrastructure, not a UI surface …" |
| tests/run.js: sprint-021 AC-1/AC-2 (D1): … pr open mode commits and pushes its state.json.pr write before await-merge … (two asserts added, C-1) | M-G restores `asd-phase-pr.md` from `f9df1c3~1` → exit 1, 251/253, FAIL sprint-021 AC-1/AC-2 …, "AC-2: pr open mode must commit its state.json.pr write before NEXT: await-merge …". M-H drops only `and push the sprint branch` → exit 1, 251/253, FAIL sprint-021 AC-1/AC-2 …, "AC-2: pr open mode must push the sprint branch carrying its state.json.pr write …". M-I rewords the clause and moves it into its own step `3a.` with the same substance → exit 1, 252/253. The only FAIL is the ledger noise, and this test stays green |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: impacted set (entry 3). The safety valve fires because `.asd/runtime.js` changed, and the runner has no selector, so the whole file runs
- Result: pass. 253/253 passed, 0 failed, 0 skipped (exit 0). The count is unchanged: this entry changed or extended three existing tests and added none
- Lint / build: pass. `git diff --cached --check` is clean at commit; `node .asd/sync.js --check` exits 0, `ok: true`, 74/74 items current
- HEAD: 43c604a, plus this entry's uncommitted test edit, committed right after this record

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | fixed | b48906e |
