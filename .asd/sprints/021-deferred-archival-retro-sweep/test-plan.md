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

Entry 2: the delta is `git diff f4ccc40...HEAD` over the self-hosting pathspec. It holds 5 files (+8/−8), README's self-hosting answer and agent memory only: test-fix 4d3a7d3 (D-1..D-3), the asd-dev index line ac11fee and b48906e (D-4). No canon, runtime, hook or test changed, so the safety valve does not fire. The impacted set is every test reading `README.md` or `.claude/agent-memory/**` (the README mirrors, the memory index bijection, the memory sweeps, sprint-021 AC-11 and AC-13). `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d9a047c, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 1's rows were rotated into `test-plan.entry-01.md`; it held no live removal row to carry forward.

Entry 3: the delta is `git diff 74948d3...HEAD` over the self-hosting pathspec. It holds 10 files (+32/−17): the impl-review wave-1/iter-01 review-fix commits f9df1c3 (C-1), 4d6286a (external #1), 9e88920 (C-4, external #2), 73745d4 (C-2, external #3) and fcb9d2c (C-3), the ledger refresh a284a0d, and a new `asd-reviewer-combined` memory. `.asd/runtime.js` changed, and `tests/run.js` requires it, so the safety valve fires. `tests/run.js` has no selector, so the set runs as the whole file either way. Pre-strategy run (HEAD 43c604a, tests as found): `node tests/run.js` → exit 1, 252/253 passed, FAIL sprint-021 AC-12: surface-check never counts a generated provider view …, "every provider-tree file sync.js writes is regenerated from canon, never reviewable change surface, so none may count against the cap", `2 !== 0`. That is a test defect: the test took every sync-plan target containing `/` as a view, including the two JSON-merge targets that 4d6286a now counts on purpose. Entry 2's rows were rotated into `test-plan.entry-02.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 4: the delta is `git diff aa58506...HEAD` over the self-hosting pathspec. Outside the sprint folder it holds 2 files (+2/−2): the review-fix commit b0f0daf (iter-02 external #1, `asd-phase-pr.md` merge mode step 1) and the ledger refresh 7a9b496 (`release-manifest.json`). No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading `asd-phase-pr.md` or `release-manifest.json`: the sprint-021 AC-1/AC-2 test, the phase-chain mirrors, the corpus citation sweep and the ledger tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD 3a0b7a4, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 3's rows were rotated into `test-plan.entry-03.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 5: the delta is `git diff 0eab194...HEAD` over the self-hosting pathspec. Outside the sprint folder and the generated views it holds 6 files (+18/−14): the review-fix commit fd0a5b0 (iter-03 external #1, the head-branch lookup in `sprint-lifecycle.md` "PR phase", the `asd-sprint` SKILL Step 1/1A, `asd-phase-pr.md` open mode step 2 and `asd-phase-scope.md` step 1), ff0ef0c (friction F-5/F-4, `t_review-report.md`), and the ledger refresh 0307c65. The view regeneration d476b02 falls outside the pathspec. No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading those files, `t_review.md` and `runtime.reviewFindings`: the sprint-021 AC-1/AC-2 and AC-3 tests, the persist-review tests, the phase-chain mirrors, the corpus citation sweep, the leftover-term sweep and the ledger and sync tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d476b02, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 4's rows were rotated into `test-plan.entry-04.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 6: the delta is `git diff f82d54d...HEAD` over the self-hosting pathspec. Outside the sprint folder and the generated views it holds 5 files (+10/−10): the review-fix commit 56c2089 (iter-04 combined #1: `asd-phase-pr.md` open mode step 2, `sprint-lifecycle.md` "Merged-unclosed" and "Closure write" step 2, the `asd-sprint` SKILL Step 1A, `asd-phase-scope.md` step 1) and the sync commit 29b1ae3's ledger refresh in `release-manifest.json`. That commit's regenerated `asd-sprint` views fall outside the pathspec. No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading those files: the sprint-021 AC-1/AC-2 and AC-2 (iter-03 external #1) tests, the phase-chain mirrors, the corpus citation sweep, the leftover-term sweep, and the ledger and sync tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD 9145522, tests as found): `node tests/run.js` → exit 0, 255/255 passed. Entry 5's rows were rotated into `test-plan.entry-05.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`, entry 2's in `test-plan.entry-02.md`, entry 3's in `test-plan.entry-03.md`, entry 4's in `test-plan.entry-04.md`, entry 5's in `test-plan.entry-05.md`. Mutations M-AD to M-AJ are listed under Added tests. Each edits a `managed_paths` file, so each run also fails the `upstream_hashes` ledger test, and an `asd-sprint` SKILL edit also fails the `sync.js --check` and `canon_hashes` tests. That is expected noise and is not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `asd-phase-pr.md` open mode step 2: on an `OPEN` hit or none, write `phase=pr` and commit it on the sprint branch before any push; an `OPEN` hit is adopted into merge mode only after that (56c2089, iter-04 combined #1) | the PR head is base's copy after a squash merge. A `phase=pr` written inline and left uncommitted at step 3's push, or committed only on the no-hit path, leaves base at retro's phase with `pr=null`. asd-sprint Step 1 gates on `phase="pr"`, so it never runs the lookup, and the resume flow re-runs retro on `git.base_branch` | contract | add | §17: a high finding's fix with no pin, as the reviewer asked. Three asserts go into the sprint-021 AC-2 (iter-03 external #1) test, which already reads open mode before its `git-strategy.md` "PR creation" citation. The gate value is derived from the `phase="…"` code span in asd-sprint Step 1, so the two sites are pinned as a relation and no phase literal is written in the test. Among the clauses before the PR-creation step, those naming `MERGED` are dropped, since that path writes nothing. At least one remaining clause must write the gated value, quotes ignored. Every such clause must say `commit` in its prose, with code spans stripped. At least one of them must come no later than the clause that adopts an `OPEN` hit into merge mode. The ordering to step 3's push is structural: every clause checked sits in a step before it |
| the same step now bumps the self-hosting version and changelog on the `OPEN` path too, idempotently (the folded medium of iter-04 #1) | an adopted `OPEN` PR merges without the bump, and scope's closure write tags and releases the previous `asd_version` | contract | add | same test. Some clause no later than the `OPEN` adoption must name both self-hosting and version. The idempotence qualifier ("unless the sprint branch already carries this sprint's bump") is not asserted. It is a qualifier with no derivable substance, and asserting it would lock wording |
| `asd-sprint` Step 1A carries the confirmed PR number whenever detection found one, not only when `pr` is null (56c2089) | a sprint-branch copy holding `pr.number`, over a base copy with `pr=null`, reaches scope's closure write with no carried number, and the archived sprint has no PR number to read its merge commit from | contract | add | same test. Every clause of the approve item that names the number must not say `null`. The existing `number` assert is the positive half: deleting the carry clause empties the set, so without it the absence check would pass vacuously. Ceiling: a synonym ("when `pr` is empty") passes this assert, and a correct reword that names null non-restrictively ("whether or not `pr` is null") reddens it. No token in the condition is derivable from another site, so a clause-level `null` is the narrowest check that is not a phrase lock |
| `sprint-lifecycle.md` "Merged-unclosed" now says why the base copy carries `phase="pr"` | the explanation drifts from the behaviour it explains | — | none | this is the rationale for a rule whose acting site is open mode step 2, which cites "Merged-unclosed". The row above pins that site, and it pins Step 1's gate value against it. Deleting the sentence changes no agent's action. A literal pin would only redden the next correct rewording |
| "Closure write" step 2 and `asd-phase-scope.md` step 1 now take a null `pr`'s number from "the one `asd-sprint` carries" / "the confirmed number `asd-sprint` carries" | scope drops a closure-write field | contract | keep | the AC-1/AC-2 token relation derives every code span in "Closure write", the new `asd-sprint` included, and requires it in scope step 1. The entry-5 assert requires `pr.number` as a span of its own there. Both passed at HEAD 9145522 |
| `release-manifest.json` ledger refresh and the regenerated `asd-sprint` views (29b1ae3) | a stale ledger or view | — | keep | the `upstream_hashes`, `canon_hashes` and `sync.js --check` tests read every entry and view, and they passed at HEAD 9145522 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 6. Every assert in the extended test still guards its fixed text at HEAD 9145522, and the new asserts depend on the existing `number` and `OPEN` asserts to stay non-vacuous.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-2 (iter-03 external #1) … after committing the phase Step 1 gates on so every PR head carries it (extended: 5 asserts and 1 sanity guard; title extended) | M-AD restores `asd-phase-pr.md` from `56c2089~1` → exit 1, 253/255, FAIL sprint-021 AC-2 (iter-03 external #1) …, "AC-2: every pr open mode clause writing phase="pr" must commit it on the sprint branch, before step 3's PR-creation push …". M-AE keeps the commit but moves the `phase=pr` write into a no-hit clause after the `OPEN` adoption → 253/255, "AC-2: pr open mode must commit phase="pr" before adopting an OPEN hit into merge mode, so the adopted PR's head carries it too …". M-AF moves only the self-hosting bump into the no-hit clause → 253/255, "AC-2: pr open mode must bump the self-hosting version before adopting an OPEN hit into merge mode …". M-AG changes only Step 1's gate span to `phase="merging"` and leaves open mode as is → 251/255, "AC-2: pr open mode must write the phase="merging" asd-sprint Step 1 gates detection on, before opening a PR …", which proves the gate value is derived from Step 1. M-AH restores the `asd-sprint` SKILL from `56c2089~1` → 251/255, "AC-2: asd-sprint Step 1A must carry the confirmed PR number whenever detection found one, not only when the detected copy's pr is null …". M-AI rewords open mode step 2 end to end with the same substance → 254/255, and the only FAIL is the ledger noise. M-AJ rewords the Step 1A carry with no `null` → 252/255, and the only FAILs are the ledger, `canon_hashes` and `sync.js --check` noise. Each run exited 1, and after each run the file was restored byte-equal |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: full suite (impl-review terminal gate, wave-1/iter-05), unscoped
- Result: pass. 255/255 passed, 0 failed, 0 skipped (exit 0)
- Lint / build: pass. `git diff --cached --check` exits 0, clean; `node .asd/sync.js --check` exits 0, `ok: true`, 74/74 items current
- HEAD: 901bdda54c14df8065bb3fe34e1a2a30f9a534f8, clean tree

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | fixed | b48906e |
