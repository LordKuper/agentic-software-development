---
name: asd-phase-impl
description: "Runs the ASD impl phase. Updates state.json to phase=impl. Parses Task N blocks from plan.md and dispatches each task to its assigned dev (asd-backend-dev, asd-frontend-dev, or asd-test-engineer per Task body owner field), respecting declared dependencies (sequential where dependent, parallel where independent). Each dev verifies tech-reference exists for every library/framework/runtime/external service touched (refuses with FAILED if missing), reads context (plan, requirements, ADR, custom-rules, accessibility), proposes approach (Complication Approval if non-trivial), writes code and unit tests, runs test/lint/build per commands.yaml, commits per Conventional Commits, ticks plan.md checkboxes, registers TODO stubs in project-global .asd/project/stubs.md (append-only). After all tasks complete, asd-pm presents impl summary for user assessment before phase exit. Use when asd-sprint dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint."
metadata:
  asd-role: phase
  asd-order: "7"
  version: "0.1"
allowed-tools: "Read AskUserQuestion Task"
---

# ASD Phase: Impl

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- `plan.md` approved (per checkpoints precondition chain)
- `state.json.phase` advanced from `plan`

## Tool policy
- Read — `.asd/config.yaml`, `state.json`, `plan.md`, persistent design/ docs, `.asd/project/custom-rules.md`, `.asd/project/stubs.md`
- AskUserQuestion — escalation only (devs handle Complication Approval per task)
- Task — dispatch devs per task owner; PM for state + assessment + decisions-log

## Workflow

1. Read `.asd/config.yaml` (`backward_compat`, `system.tools`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → confirm plan approved
3. Read `<sprint>/plan.md` → parse Task blocks: title, owner (backend-dev / frontend-dev / test-engineer), subtask checkboxes, dependencies
4. Dispatch `asd-pm` via Task: update `state.json` (phase=impl)
5. **Build execution graph** from Task dependencies; topological sort; mark independent tasks parallelisable
6. **Dispatch tasks** per execution graph:
   - sequential where dependent
   - parallel where independent (caller schedules concurrent Task calls)
   - per task: dispatch to assigned dev (`asd-backend-dev` | `asd-frontend-dev` | `asd-test-engineer`) via Task with payload:
     - Task block excerpt (title + subtasks + dependencies)
     - relevant context paths (PRD AC-N referenced, ADRs, ux-spec, DESIGN.md, accessibility, stack, commands.yaml, tech-reference/, custom-rules.md)
     - `language.chat`, `language.docs`
     - instruction:
       - read context first
       - verify `design/architecture/tech-reference/<tech>-<version>.md` exists for every tech touched; if missing → emit `FAILED — tech-reference missing for <tech>@<version>` (Architect creates it via design re-run or out-of-band step)
       - propose approach if non-trivial (Complication Approval format via AskUserQuestion in `language.chat`); wait approval
       - write code + unit tests (or integration/e2e for test-engineer)
       - run `lint`, `test` per `commands.yaml`; do not advance with failures unreported
       - **stub handling**:
         - when introducing new TODO: insert `// TODO(sprint-<NNN-slug>): <reason>` marker in code AND add row to `.asd/project/stubs.md` (Sprint, File:Line, Reason, Owner)
         - when resolving an existing stub (current task is "Resolve stub X" or as side effect): remove `// TODO(sprint-...)` marker from code AND delete the row from `.asd/project/stubs.md`
         - never edit-in-place a stub row; always delete + (optionally) re-add under new sprint id for migration
       
       - commit per Conventional Commits (one logical change per commit; subject ≤50 chars; body describes WHY)
       - tick corresponding checkboxes in `<sprint>/plan.md`
       - emit COMPLETED with summary (files touched, AC-N satisfied, stubs added)
7. Wait all task COMPLETED signals
8. **Impl assessment checkpoint** — dispatch `asd-pm` via Task:
   - read updated `<sprint>/plan.md` → verify all checkboxes ticked
   - read `.asd/project/stubs.md` → list stubs introduced this sprint (filter by Sprint=<NNN-slug>; all rows are open by definition since delete-on-resolve)
   - compose impl summary: tasks done, AC-N coverage map, files changed, tests added, lint status, sprint-introduced stubs
   - present to user via AskUserQuestion: approve (advance to impl-review) / request changes / abort
   - on approve: update `state.json`, append decisions-log entry ("impl assessment approved"); emit COMPLETED
   - on request changes: relay specific feedback to relevant dev(s) via Task; loop step 7
   - on abort: emit ABORT
9. Emit phase COMPLETED with return contract
10. Any dev QUESTION (e.g., requirement ambiguity) → relay to user, halt; resume on answer
11. Any dev FAILED / ABORT → relay, halt

## Artefacts produced
- Source code + unit tests in repo
- Integration / e2e tests in repo (from test-engineer tasks)
- Updated `.asd/project/stubs.md` (project-global, append-only)
- Updated `<sprint>/plan.md` checkboxes
- Updated `state.json` (phase=impl)
- Git commits per Conventional Commits
- decisions-log entry on impl assessment approval

## Agents dispatched
- `asd-pm` (state, impl assessment, decisions-log)
- `asd-backend-dev` (per Task with owner=backend-dev)
- `asd-frontend-dev` (per Task with owner=frontend-dev)
- `asd-test-engineer` (per Task with owner=test-engineer)

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: impl | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: impl-review
```

## References
- `.asd/rules/sprint-lifecycle.md` (impl phase contract)
- `.asd/rules/checkpoints.md` (impl assessment gate)
- `.asd/rules/git-strategy.md` (commits, project-global stubs, dirty tree)
- `.asd/rules/artifact-layout.md` (tech-reference refuse-to-implement rule, project stubs path)
- `.asd/rules/language-policy.md`
- Templates: `t_plan.md` (Task parsing reference), `t_stubs.md`
