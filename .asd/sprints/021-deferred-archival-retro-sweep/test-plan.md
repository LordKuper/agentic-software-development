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
| 4 | 0eab194 | delta since entry 3 |
| 5 | f82d54d | delta since entry 4 |
| 6 | ffdcb43 | delta since entry 5 |
| 7 | 27136af | delta since entry 6 |

Entry 2: the delta is `git diff f4ccc40...HEAD` over the self-hosting pathspec. It holds 5 files (+8/−8), README's self-hosting answer and agent memory only: test-fix 4d3a7d3 (D-1..D-3), the asd-dev index line ac11fee and b48906e (D-4). No canon, runtime, hook or test changed, so the safety valve does not fire. The impacted set is every test reading `README.md` or `.claude/agent-memory/**` (the README mirrors, the memory index bijection, the memory sweeps, sprint-021 AC-11 and AC-13). `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d9a047c, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 1's rows were rotated into `test-plan.entry-01.md`; it held no live removal row to carry forward.

Entry 3: the delta is `git diff 74948d3...HEAD` over the self-hosting pathspec. It holds 10 files (+32/−17): the impl-review wave-1/iter-01 review-fix commits f9df1c3 (C-1), 4d6286a (external #1), 9e88920 (C-4, external #2), 73745d4 (C-2, external #3) and fcb9d2c (C-3), the ledger refresh a284a0d, and a new `asd-reviewer-combined` memory. `.asd/runtime.js` changed, and `tests/run.js` requires it, so the safety valve fires. `tests/run.js` has no selector, so the set runs as the whole file either way. Pre-strategy run (HEAD 43c604a, tests as found): `node tests/run.js` → exit 1, 252/253 passed, FAIL sprint-021 AC-12: surface-check never counts a generated provider view …, "every provider-tree file sync.js writes is regenerated from canon, never reviewable change surface, so none may count against the cap", `2 !== 0`. That is a test defect: the test took every sync-plan target containing `/` as a view, including the two JSON-merge targets that 4d6286a now counts on purpose. Entry 2's rows were rotated into `test-plan.entry-02.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 4: the delta is `git diff aa58506...HEAD` over the self-hosting pathspec. Outside the sprint folder it holds 2 files (+2/−2): the review-fix commit b0f0daf (iter-02 external #1, `asd-phase-pr.md` merge mode step 1) and the ledger refresh 7a9b496 (`release-manifest.json`). No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading `asd-phase-pr.md` or `release-manifest.json`: the sprint-021 AC-1/AC-2 test, the phase-chain mirrors, the corpus citation sweep and the ledger tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD 3a0b7a4, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 3's rows were rotated into `test-plan.entry-03.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 5: the delta is `git diff 0eab194...HEAD` over the self-hosting pathspec. Outside the sprint folder and the generated views it holds 6 files (+18/−14): the review-fix commit fd0a5b0 (iter-03 external #1, the head-branch lookup in `sprint-lifecycle.md` "PR phase", the `asd-sprint` SKILL Step 1/1A, `asd-phase-pr.md` open mode step 2 and `asd-phase-scope.md` step 1), ff0ef0c (friction F-5/F-4, `t_review-report.md`), and the ledger refresh 0307c65. The view regeneration d476b02 falls outside the pathspec. No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading those files, `t_review.md` and `runtime.reviewFindings`: the sprint-021 AC-1/AC-2 and AC-3 tests, the persist-review tests, the phase-chain mirrors, the corpus citation sweep, the leftover-term sweep and the ledger and sync tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d476b02, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 4's rows were rotated into `test-plan.entry-04.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 6: the delta is `git diff f82d54d...HEAD` over the self-hosting pathspec. Outside the sprint folder and the generated views it holds 5 files (+10/−10): the review-fix commit 56c2089 (iter-04 combined #1: `asd-phase-pr.md` open mode step 2, `sprint-lifecycle.md` "Merged-unclosed" and "Closure write" step 2, the `asd-sprint` SKILL Step 1A, `asd-phase-scope.md` step 1) and the sync commit 29b1ae3's ledger refresh in `release-manifest.json`. That commit's regenerated `asd-sprint` views fall outside the pathspec. No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading those files: the sprint-021 AC-1/AC-2 and AC-2 (iter-03 external #1) tests, the phase-chain mirrors, the corpus citation sweep, the leftover-term sweep, and the ledger and sync tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD 9145522, tests as found): `node tests/run.js` → exit 0, 255/255 passed. Entry 5's rows were rotated into `test-plan.entry-05.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 7: the delta is `git diff ffdcb43...HEAD` over the self-hosting pathspec. Outside the sprint folder and the generated views it holds 4 files (+41/−8): the 13.4.0 release bump d590220 (`release-manifest.json`, `CHANGELOG.md`), Task 11 5645459 for the scope amendment AC-14 (`sprint-lifecycle.md` "PR phase" "Merged-unclosed" and "State recovery", the `asd-sprint` SKILL Step 1), and the sync commit 56db444's ledger refresh. That commit's regenerated `asd-sprint` views fall outside the pathspec. No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading those files: the sprint-021 AC-1/AC-2 and AC-2 (iter-03 external #1) tests, the AC-12 CHANGELOG-heading test, the phase-chain mirrors, the corpus citation sweep, the leftover-term sweep, and the ledger and sync tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD eeb52d8, tests as found): `node tests/run.js` → exit 0, 255/255 passed. The stale AC-2 (iter-03 external #1) test was still green, because its gate value now came from the resume bullet's `phase="pr"` by accident. Entry 6's rows were rotated into `test-plan.entry-06.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it. The leftover check for the removed gate is clean: no canon, view, hook or memory line outside the sprint folder and `CHANGELOG.md` still gates merged-unclosed detection on `phase="pr"`. The session-start hook's comment on phase `pr` describes its own offline check, which AC-14 leaves unchanged.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`, entry 2's in `test-plan.entry-02.md`, entry 3's in `test-plan.entry-03.md`, entry 4's in `test-plan.entry-04.md`, entry 5's in `test-plan.entry-05.md`, entry 6's in `test-plan.entry-06.md`. Mutations M-AK to M-AQ are listed under Added tests. Each edits a `managed_paths` file, so each run also fails the `upstream_hashes` ledger test, and an `asd-sprint` SKILL edit also fails the `sync.js --check` and `canon_hashes` tests. That is expected noise and is not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| "Merged-unclosed" defines the state as a sprint PR `gh` reports `MERGED` whatever its `phase`, and runs the head-branch lookup for every sprint without `pr.number`. `asd-sprint` Step 1's detection bullet drops its `phase="pr"` gate (5645459, AC-14) | a `phase="…"` condition kept or restored at either site. A PR opened and merged by hand before the `pr` phase, or an open-mode `MERGED` hit whose closure was refused, leaves the sprint at an earlier phase with `pr=null`. The lookup never runs for it, and the sprint resumes that phase on `git.base_branch` instead of requesting closure | contract | add | §17: an AC with two acting sites and no pin. Added to the AC-2 (iter-03 external #1) test, which already locates both sites. The home's definition clause, the clause holding the lookup command and the `MERGED` outcome clause must carry no `phase=…` or `phase!=…` code span. Step 1's detection line, located by the same lookup command, must carry none either. Existing asserts keep each clause present, so deleting one cannot pass the absence check vacuously. The bare `phase` span in "whatever its `phase`" is not asserted, because an unrestricted clause already means every phase, so a positive pin on it would lock wording. Ceiling: a restriction written in prose with no code span ("for a sprint in the pr phase") passes |
| the `OPEN` outcome stays `phase="pr"`-only: the home's `OPEN` clause, and a new clause on Step 1's resume bullet (5645459, AC-14) | detection now runs at every phase. Without the restriction, a sprint at an earlier phase with an open PR is adopted into merge mode and skips its remaining phases | contract | add | §17, same test. The home's `OPEN` clause must hold the span `phase="pr"`. Some Step 1 line other than the detection line must hold an `OPEN` span and `phase="pr"`. That line is located by the `OPEN` token, not by its bullet text |
| the same test's title, its lookup message and its open-mode gate derivation described the superseded gate. The gate value was taken from the first `phase="…"` span in Step 1, which after 5645459 is the resume bullet's `OPEN` restriction (test defect) | the test reads as pinning a gate canon removed. A correct reword of the resume bullet without its span would redden the open-mode commit asserts under a sanity message about a gate that no longer exists | contract | keep (rewritten in place) | the title now names AC-14 and "at any phase". The gate value now comes from the "Merged-unclosed" clause that names `pr.number` with a `phase="…"` span, the home's statement that open mode carries that phase to base. The open-mode asserts pin that statement against its acting site. The rationale message no longer says Step 1 skips the lookup, which AC-14 made false. M-AP proves the new source |
| "State recovery": a merged sprint keeps its recorded `phase` and `pr` until the closure write (5645459) | the sentence drifts from the writers it describes | — | none | the sentence describes state that two pinned sites fix. Merge mode writes nothing on base (AC-1 assert). The closure write's fields are required at scope step 1 (the AC-1/AC-2 token relation). Deleting the sentence changes no agent's action, and a literal pin would only redden the next correct rewording |
| 13.4.0 bump, `CHANGELOG.md`, and the ledger refresh in d590220 and 56db444 | a release heading that disagrees with `asd_version`, or a stale ledger or view | — | keep | the AC-12 CHANGELOG-heading test and the `upstream_hashes`, `canon_hashes` and `sync.js --check` tests read these, and they passed at HEAD eeb52d8 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 7. The stale test was rewritten in place rather than removed. Its AC-2 asserts still guard their fixed text at HEAD eeb52d8.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-2 (iter-03 external #1), AC-14: a sprint without pr.number is looked up by head branch at any phase … (rewritten in place: title retargeted, 4 AC-14 asserts and 1 sanity guard added, gate value re-sourced to "Merged-unclosed", 2 messages reworded) | M-AK restores `sprint-lifecycle.md` from `5645459~1` → exit 1, 253/255, FAIL sprint-021 AC-2 (iter-03 external #1), AC-14 …, "AC-14: "Merged-unclosed"'s definition, its head-branch lookup and its MERGED outcome must name no phase="…" condition …". M-AL restores the `asd-sprint` SKILL from `5645459~1` → 251/255, "AC-14: asd-sprint Step 1's merged-unclosed detection must run for every active sprint, with no phase="…" condition …". M-AM drops only "only at `phase="pr"`, and at any other phase is ignored, …" from the home's `OPEN` clause → 253/255, "AC-14: "Merged-unclosed" must adopt an OPEN head-branch hit into merge mode only at phase="pr" …". M-AN drops only "at `phase="pr"` only" from Step 1's resume bullet → 251/255, "AC-14: asd-sprint Step 1 must say an OPEN head-branch hit is adopted into merge mode only at phase="pr" …". M-AO adds "at `phase="pr"`" to the home's `MERGED` outcome clause alone → 253/255, the same "must name no phase="…" condition" message, which proves that clause is checked apart from the definition. M-AP changes only the home's "carries `phase="pr"` and `pr.number` to base" to `phase="retro"` → 253/255, "AC-2: pr open mode must write the phase="retro" "Merged-unclosed" says base carries, before opening a PR …", which proves the gate value is derived from the home. M-AQ rewords the home's definition, lookup and `OPEN` clauses and Step 1's detection and resume bullets end to end, with the same tokens and substance → 252/255, and the only FAILs are the ledger, `canon_hashes` and `sync.js --check` noise, so the asserts do not lock wording. Each run exited 1, and after each run the file was restored byte-equal |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: impacted set (entry 7). The safety valve does not fire, and the runner has no selector, so the whole file runs
- Result: pass. 255/255 passed, 0 failed, 0 skipped (exit 0). The count did not change, because this entry rewrote an existing test in place
- Lint / build: pass. `git diff --cached --check` is clean at commit; `node .asd/sync.js --check` exits 0, `ok: true`, 74/74 items current
- HEAD: eeb52d8, plus this entry's uncommitted test edit, committed right after this record

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | fixed | b48906e |
