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
| 2 |  | delta since entry 1 |

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

Entry 1's rows are in `test-plan.entry-01.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `sprint-lifecycle.md` "Red-full-suite invalidation": "the rollback-reset table never fires" is now "`rollback_reset` never fires" (52c72ed, D-1) | The line points a reader at a removed mechanism again, or the fix drops the clause saying the red-suite route is not a rollback | static | keep | The leftover-term sweep (sprint-020 AC-1) turned red on this line at 47e0d13 (entry 1's fail-first, `Found: .asd/rules/sprint-lifecycle.md:96`) and is green at this HEAD. The fix reverts to exactly the state that failed, so that proof also covers the revert. The new wording names the live key that `sprint-020 AC-2/AC-4/AC-6` pins. The clause's substance (that the route is not a rollback) is unchanged, and no test pinned the old wording. |
| `README.md` `standard` bullet: "the default when nothing is selected" is now "what a `state.json` without the field reads as — a sprint started before v13.3.0" (3550328, D-2) | README calls a workflow the default again | static | keep | The sprint-020 AC-6 no-default sweep turned red on this line at 47e0d13 (entry 1's fail-first, `Found: README.md:132`) and is green at this HEAD. The absent-field reading the new text states is the hook behaviour pinned by `sprint-020 AC-1/AC-6: SessionStart takes its chain …` (absent-field case). |
| Same README line: the version literal "v13.3.0" | The release named is not the one that introduced `state.json.workflow` | — | none | This is a fact about a release that has already shipped, so a later edit elsewhere cannot make it false. A test could only pin this one literal. Checked by hand at this HEAD: `release-manifest.json` `asd_version` is 13.3.0, the `CHANGELOG.md` v13.3.0 entry adds "Workflows", and main is at 13.2.0. |
| `.asd/release-manifest.json` `upstream_hashes` for the two edited files | The ledger drifts from the edited files | static | keep | The existing `upstream_hashes` test (both directions) is green at this HEAD. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 2.

## Added tests

| Test | Regression proof |
|---|---|

None in entry 2: the delta changes no behaviour that an existing test does not already guard (see the rows above).

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: shared infrastructure)
- Result: pass — 245/245 passed, 0 failed, 0 skipped (exit 0). This is entry 2's gate. Entry 1's red run (243/245, D-1/D-2) is superseded.
- Lint / build: pass — `git diff --cached --check` exit 0, run on this entry's staged commit; `node .asd/sync.js --check` exit 0, `ok: true`, 74/74 items current
- HEAD: 7ab8347

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/sprint-lifecycle.md | AssertionError [ERR_ASSERTION]: sprint 020 moved the chain into .asd/workflows/<name>.json and the reset phases into each definition's rollback_reset, so a line still naming PHASE_CHAIN or the rollback-reset table points a reader at something that no longer exists (CHANGELOG.md and .asd/project/decisions-log.md are history and stay out of the sweep). Found: .asd/rules/sprint-lifecycle.md:96 | sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line still names a mechanism the workflow definitions replaced - the PHASE_CHAIN literal or the rollback-reset table | fixed | 52c72ed |
| D-2 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-6: the user always chooses the workflow and no config default exists, so no line may call a workflow "the default" - an absent state field reading standard is legacy handling, not a default a user can rely on. Found: README.md:132 | sprint-020 AC-6: the workflow is a hard, never-defaulted choice asked only at scope step 1, frozen through the t_state.json seed and gated in checkpoints.md, held by no config key, and no doc calls a workflow the default | fixed | 3550328 |
