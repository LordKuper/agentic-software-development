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
| 4 |  | delta since entry 3 |

Entry 4: the delta is `git diff afa606e...HEAD` over the same pathspec. It holds 5 files (+27/−8), all agent memory: the wave-1/iter-02 memory-fix 028ce49 (`asd-reviewer-testing/{feedback_workflow-definition-sprints.md,MEMORY.md}`) and the reviewer memory committed with the iter-02 reviews (`asd-reviewer-correctness/{reference_persist-review-return-shape.md,MEMORY.md}`, `asd-reviewer-efficiency/project_020-workflow-definition-keys.md`). No canon, code or test changed, so the safety valve does not apply. The search-derived impacted set is every test that reads `.claude/agent-memory/**`: the T-2/T-4 index bijection, the sprint-017 AC-5 and DOC-2 memory sweeps, the sprint-019 AC-14/AC-16 sweep, the sprint-020 AC-1 leftover sweep, and the two single-file readers `T-2: feedback_no-shell-review-method.md …` and `T-2/iter-05 …`, whose files sit in touched directories but are unchanged. The full suite was run instead, because it takes seconds and a hand-picked set of 7 could miss a reader. The pre-strategy run (full suite, HEAD be399d4, tests as found) was `node tests/run.js` → exit 0, 246/246 passed. Entry 3's rows were rotated into `test-plan.entry-03.md`. No review-fix or in-place tester rows had been added after entry 3, and none was a removal row to carry forward.

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

Entry 1's rows are in `test-plan.entry-01.md`. Entry 2's rows and the review-fix wave-1/iter-01 tester rows are in `test-plan.entry-02.md`. Entry 3's rows are in `test-plan.entry-03.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Reviewer agent-memory edits: memory-fix 028ce49 (asd-reviewer-testing, documentation.md F-1 of wave-1/iter-02) plus the iter-02 memory writes of asd-reviewer-correctness (new `reference_persist-review-return-shape.md`) and asd-reviewer-efficiency | A memory line names a retired mechanism, or an index line and its memory file fall out of step, so a reviewer loads a stale or missing memory | static | keep | These are the literal-token risks of a memory write, and existing tests already derive each one from every `.claude/agent-memory/**` file. The sprint-020 AC-1 sweep and the sprint-017 AC-5/DOC-2 and sprint-019 AC-14/AC-16 sweeps cover retired terms and the wrong wave-index form. `T-2/T-4/sprint-010 TST-01` covers the MEMORY.md ↔ file bijection, which the new correctness file and its index line enter. All are green at this HEAD. The remaining risk is that a memory claim about the suite or runtime is false. That claim is not a token the suite can derive from a source, so it goes through the memory-fix route (`review-policy.md` "Autofix vs escalation"), which F-1 just used. Checked by hand at this HEAD: the new file's `persist-review` rules match `runtime.js` `persistReview` (a bare APPROVE with findings and a CONCERNS/FAIL without findings are both refused), and the persist-review test's `rejected` list already pins both refusals. Its `[[review-method-no-shell]]` link resolves. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 4.

## Added tests

| Test | Regression proof |
|---|---|

None in entry 4.

## Suite run

- Command: `node tests/run.js`
- Scope: full. The safety valve does not apply, because the delta is agent memory only. The full suite was chosen over the 7-test search-derived set (see Entry 4) because it runs in seconds.
- Result: pass — 246/246 passed, 0 failed, 0 skipped (exit 0) at HEAD be399d4. This entry changed no test.
- Lint / build: pass. Lint (`git diff --cached --check`) exited 0 on this entry's staged commit. Build (`node .asd/sync.js --check`) exited 0, `ok: true`, 74/74 items current.
- HEAD: be399d4

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/sprint-lifecycle.md | AssertionError [ERR_ASSERTION]: sprint 020 moved the chain into .asd/workflows/<name>.json and the reset phases into each definition's rollback_reset, so a line still naming PHASE_CHAIN or the rollback-reset table points a reader at something that no longer exists (CHANGELOG.md and .asd/project/decisions-log.md are history and stay out of the sweep). Found: .asd/rules/sprint-lifecycle.md:96 | sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line still names a mechanism the workflow definitions replaced - the PHASE_CHAIN literal or the rollback-reset table | fixed | 52c72ed |
| D-2 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-6: the user always chooses the workflow and no config default exists, so no line may call a workflow "the default" - an absent state field reading standard is legacy handling, not a default a user can rely on. Found: README.md:132 | sprint-020 AC-6: the workflow is a hard, never-defaulted choice asked only at scope step 1, frozen through the t_state.json seed and gated in checkpoints.md, held by no config key, and no doc calls a workflow the default | fixed | 3550328 |
