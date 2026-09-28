---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 020-multi-workflow-lite

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 9463f2c35157d12d97a6e91e1285f1407536a101 | full change surface |
| 2 | a4f4e51c0ac79575740a81734986fd9307e59a96 | delta since entry 1 |
| 3 | afa606eef858f3d18aa1cab15afd3457b3cd8cc4 | delta since entry 2 |

Entry 3: the delta is `git diff a4f4e51...HEAD` over the same pathspec. It holds 21 files (+147/−70) from review-fix wave-1/iter-01: the dev chain 1a1a983..2cecb8b and the review-fix tester commit c8a34db. It touches `.asd/runtime.js`, the hook and rule docs, so the safety valve applies and the impacted set is the full suite. The pre-strategy run (full suite, HEAD 05f0df4, tests as found) was `node tests/run.js` → exit 0, 246/246 passed. No review-fix removal row existed to carry forward. Entry 2's rows and the review-fix tester rows were rotated into `test-plan.entry-02.md`.

Entry 2: the delta is `git diff 9463f2c...HEAD` over the same pathspec. It holds 3 files and 3 changed lines (`.asd/rules/sprint-lifecycle.md`, `README.md`, `.asd/release-manifest.json`) from the D-1/D-2 test-fix commits 52c72ed and 3550328. Those are framework-wide files, so the safety valve applies again and the impacted set is the full suite. The pre-strategy run (full suite, HEAD 7ab8347, tests as found) was `node tests/run.js` → exit 0, 245/245 passed.

Impacted set (entry 1): the change surface (`git diff main...HEAD`, 38 files, commits 848168f..9f29356) touches `.asd/runtime.js`, `.asd/hooks/session-start.js`, the workflow definitions, every rule doc the chain lives in, README and AGENTS.md. That is framework-wide shared infrastructure, so the `sprint-lifecycle.md` "Impacted test set" safety valve applies and the impacted set is the full suite (`node tests/run.js`). `commands.yaml` carries no `test_affected`.

Pre-strategy run (full suite, HEAD 47e0d13, tests as found): `node tests/run.js` → exit 1, 222/238 passed. The 16 failures were stale tests, not code defects: 7 read the removed `PHASE_CHAIN` literal (`session-start.js must keep PHASE_CHAIN as a literal array`); 5 hardcoded the reviewer roster (11 agents, 6 read-only agents, 5 reviewers), which `asd-reviewer-combined` changed; 2 emitted the combined reviewer's own rubric, so emission threw `rubric entry missing for n/a predicate: SSoT`; 2 pinned wording the sprint changed (the `validate-ledger --manifest` step, now the `persist-review` step; "Applies to the 4 internal reviewers").

Leftover-term check (`artifact-layout.md` "Agent memory"; removed: the `PHASE_CHAIN` literal and the rollback-reset table). The whole repo was searched, `.claude/agent-memory/**` included. Hits:
- `.asd/rules/sprint-lifecycle.md:96`: "the rollback-reset table never fires for this route". This is canon, so it is filed as D-1.
- `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md:18`: this tester's own memory. It was rewritten in this entry and the fix is committed with the tests.
- `.asd/project/decisions-log.md:221` and `CHANGELOG.md:399`: historical records of past releases and decisions, true when written. They are not in scope.
- `tests/run.js`: every `PHASE_CHAIN` use in the tests was rewritten in this entry.

`sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line …` makes the check permanent.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`. Entry 2's rows and the review-fix wave-1/iter-01 tester rows are in `test-plan.entry-02.md`. Those rotated rows already cover testing.md 1-6, external.md 1 and efficiency.md 1-2, so this entry does not re-decide them.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| asd-reviewer-combined.md "Persistent actuality before promotion" bullet (6f1b279, external.md 2, high) | The bullet is deleted, or it points at a design-promote step that no longer writes the docs. Either way the combined reviewer applies the inherited Documentation "Persistent actuality" entry to docs lite has not promoted yet, so every lite impl-review FAILs | static relation | add | Nothing pinned this single-home bullet. It is now pinned in the sprint-020 AC-4 emit-manifest test. The test asks whether any definition runs `combined` in impl-review before design-promote. If one does, exactly one combined-agent bullet must cite `asd-phase-design-promote.md` step N, and it must also cite `sprint-lifecycle.md` "Workflows". Step N must be the step whose creators write the `lite` docs, and the bullet's label must extend a Documentation rubric id. If no definition does, the bullet must be absent. The wording is not pinned. |
| Hook archived-sprint filter collapsed to one condition (ba7be46, documentation.md F-1) | A precedence or negation slip recovers an archived sprint whose phase is outside its chain or that is `done`, or drops a non-done one whose definition does not resolve | unit (hook in temp root) | add | Before this entry no test caught any slip on that line. Three mutations each left the suite at 244/246, with only the `sync --check`/`upstream_hashes` noise: H1 dropped the chain check, H2 inverted the null-phases case, H3 dropped the `done` check. The existing archived-recovery test now has a second temp root with three archived fixtures: a phase outside the chain, a non-done sprint on an unknown definition, and a done sprint on an unknown definition. It asserts that only the second is recovered (`sprint-lifecycle.md` "State recovery": legacy archived non-done sprints remain recoverable). |
| Hook in-body comments removed (ba7be46, documentation.md F-1) | An in-body comment returns in hook code (`code-style.md` §7) | — | none | A check would need to tell a function-body comment from a member doc, which takes a JS parser: new test infrastructure or a new dependency. The ~60 pre-existing in-body comments in `tests/run.js` would also need exemptions. The owner is the Documentation reviewer's "In-code doc comments" rubric entry, which raised F-1. |
| lite design-promote inputs: `audit.md` added to the "Workflows" home (8868b71, documentation.md F-3) | The files that design-promote reads in place of drafts diverge between the "Workflows" home and its acting sites (asd-phase-design-promote.md step 4 and the architect/ba/ux Inputs lines). A wider site reads what the rule never grants. A narrower one promotes without it | static relation | add | The chain-mirror test's lite design-promote block now finds every canon line (other than the home) that names what is read "in place of drafts". The site set is derived, and the design-promote workflow is required among the sites as a sanity check. For each site, the backticked `.md` inputs of its `lite` clause, with citations stripped and basenames compared, must equal the home's inputs. |
| artifact-layout.md "Test plan" grant, in-place tester sentence, plus asd-tester.md now citing that grant instead of restating it (87860ea, documentation.md F-2) | The grant loses its in-place tester sentence, so asd-tester.md bounds its in-place fix by a grant that no longer covers it | static relation | add | This extends the sprint-019 AC-11..16 test. The asd-tester.md line that names the in-place fix and cites `artifact-layout.md` "Test plan" requires the grant to keep a sentence that names the in-place tester and cites `review-policy.md` "Low-severity test-only findings". The pin covers deletion only. Reverting 87860ea keeps it green, because the pre-fix text also named the in-place tester and cited both homes. Whether the agent line restates its home again is a paraphrase judgement with no derivable proxy, and the Documentation reviewer owns it. |
| README mirrors and review-policy.md "Reviewer responsibility": "one reviewer per concern per workflow roster", the persist-review sentence, "(in `lite`, Combined)", the combined reviewer on the web-tool list, the lite FAQ (3a9b0ea, documentation.md F-4, correctness.md 4) | README states a reviewer set or grant that the agents do not carry | — | none | The facts on the agent side are pinned exactly: web grants by sprint-018 AC-2 (the four withheld agents), and roster ↔ agent ↔ token ↔ DoD row by sprint-020 AC-2/AC-4/AC-6. README names roles by display labels and group words ("creators", "the combined reviewer", "Advisor"). A mirror check would need a hand-kept label → agent map, which is a second copy. The owner is the Documentation reviewer's "Framework mode" rubric entry. |
| Reviewer agent-memory additions (asd-external-review, asd-reviewer-documentation, asd-reviewer-efficiency, asd-reviewer-testing) | A memory line names a retired mechanism | static | keep | The sprint-020 AC-1 leftover-term sweep reads every `.claude/agent-memory/**` file and is green at this HEAD. Any other memory defect goes through the memory-fix route (`review-policy.md` "Autofix vs escalation"), not a test. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 3. No review-fix removal row was carried forward.

## Added tests

| Test | Regression proof |
|---|---|
| sprint-020 AC-4: emit-manifest --reviewer combined composes the rubrics its agent names … (extended: pre-promotion actuality carve-out, external.md 2) | All mutations are on asd-reviewer-combined.md. The 3 other FAIL lines in every run are `canon_hashes`, `upstream_hashes` and `sync --check` noise. C1 deletes the bullet, which reverts 6f1b279: exit 1 (242/246), `external.md 2 (wave-1/iter-01): a workflow that runs combined in impl-review before its design-promote writes the persistent docs needs exactly one asd-reviewer-combined.md bullet …`. C2 changes step 4 to step 3: exit 1, `the carve-out cites asd-phase-design-promote.md step 3, which must be the step whose creators write the lite persistent docs …`. C3 drops the "Workflows" citation: exit 1, `the carve-out must cite sprint-lifecycle.md "Workflows" …`. C4 renames the label: exit 1, `the carve-out "Pre-promotion scope" must name the Documentation rubric entry it narrows …`. C5 rewords the whole bullet body and keeps both pointers: the test stays green (243/246, noise only), so the pin does not lock wording. |
| AC-2/4/5/6/7: SessionStart recovers only archived active sprints and reports conflicts (extended: archived filter degradation, F-1) | Mutations H1-H3 were run before and after the edit (see the risk row). After the edit each exits 1 (243/246) with `sprint-lifecycle.md "State recovery": an archived sprint is recovered only while non-done …`. The recovered text differs: H1 `multiple active sprints found (780-stale, 781-unknown)`, H2 `No active sprint`, H3 `multiple active sprints found (781-unknown, 782-unknown-done)`. The other 2 FAIL lines are `upstream_hashes` and `sync --check` noise. |
| AC-8/G-11, sprint-020 AC-7: the ordered chain mirrors match their definitions … (extended: lite promote inputs, F-3) | Fail-first for F-3: G1 reverts 8868b71 on sprint-lifecycle.md. Exit 1 (244/246), `documentation.md F-3 (wave-1/iter-01): every site stating what lite's design-promote reads in place of drafts must name the same files as its "Workflows" home (plan.md, sprint.md) …`. G2 drops only asd-ux.md's `audit.md`, which proves the loop reaches the last site: exit 1 (242/246), the same message with `(audit.md, plan.md, sprint.md)`. G3 rewords and reorders the home's inputs: the test stays green (245/246, `upstream_hashes` noise only). |
| sprint-019 AC-11/AC-12/AC-13/AC-15/AC-16: each review-fix, rotation and tester-lifecycle rule keeps its single home … (extended: in-place tester grant, F-2) | P1 deletes the in-place sentence from artifact-layout.md "Test plan": exit 1 (244/246), `documentation.md F-2 (wave-1/iter-01): asd-tester.md bounds its in-place test fix by the "Test plan" grant alone, so that grant must state the in-place tester's reach …`. P2 rewords that sentence and keeps its citation: the test stays green (245/246, `upstream_hashes` noise only). A revert of 87860ea does not redden (see the risk row). |

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: shared infrastructure)
- Result: pass — 246/246 passed, 0 failed, 0 skipped (exit 0). The run covered HEAD 05f0df4 plus this entry's test edits, before they were committed. The count is unchanged because every assertion was added to an existing test.
- Lint / build: pass. `git diff --cached --check` exited 0 on this entry's staged commit. `node .asd/sync.js --check` exited 0, `ok: true`, 74/74 items current.
- HEAD: 05f0df4

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/sprint-lifecycle.md | AssertionError [ERR_ASSERTION]: sprint 020 moved the chain into .asd/workflows/<name>.json and the reset phases into each definition's rollback_reset, so a line still naming PHASE_CHAIN or the rollback-reset table points a reader at something that no longer exists (CHANGELOG.md and .asd/project/decisions-log.md are history and stay out of the sweep). Found: .asd/rules/sprint-lifecycle.md:96 | sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line still names a mechanism the workflow definitions replaced - the PHASE_CHAIN literal or the rollback-reset table | fixed | 52c72ed |
| D-2 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-6: the user always chooses the workflow and no config default exists, so no line may call a workflow "the default" - an absent state field reading standard is legacy handling, not a default a user can rely on. Found: README.md:132 | sprint-020 AC-6: the workflow is a hard, never-defaulted choice asked only at scope step 1, frozen through the t_state.json seed and gated in checkpoints.md, held by no config key, and no doc calls a workflow the default | fixed | 3550328 |
