---
name: asd-phase-impl
description: "Runs the ASD impl phase. Updates state.json to phase=impl. Parses Task N blocks from plan.md and dispatches each task to its assigned dev (asd-backend-dev, asd-frontend-dev, or asd-test-engineer per Task body owner field), respecting declared dependencies (sequential where dependent, parallel where independent). Each dev verifies tech-reference exists for every library/framework/runtime/external service touched (refuses with FAILED if missing), reads context (plan, requirements, ADR, custom-rules, accessibility), proposes approach (Complication Approval if non-trivial), writes code and unit tests, runs test/lint/build per commands.yaml, commits per Conventional Commits, ticks plan.md checkboxes, registers TODO stubs in project-global .asd/project/stubs.md (append-only). When a plan subtask needs a human-only manual action, the dev registers it in <sprint>/manual-steps.md, defers that subtask, and continues unblocked work; PM validates each manual entry for necessity and the phase halts at the manual-steps gate until the user performs the actions and confirms. After all tasks complete, asd-pm presents impl summary for user assessment before phase exit. Use when asd-sprint dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint."
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
- Read — `.asd/config.yaml`, `state.json`, `plan.md`, persistent design/ docs, `.asd/project/custom-rules.md`, `.asd/project/stubs.md`, `<sprint>/manual-steps.md`
- AskUserQuestion — escalation only (see Execution mode)
- Task — dispatch devs per task owner; PM for state + assessment + decisions-log

## Execution mode

Impl runs **autonomously**. Once tasks are dispatched, devs work without user contact until **one** of:

- **all plan tasks signal COMPLETED** — then the impl assessment gate (step 9) is the first and only user pause; or
- **all unblocked work is COMPLETED and validated manual steps remain pending** — the impl phase halts at the manual-steps gate (step 8); or
- **a blocker requiring escalation arises** — execution halts and the blocker is relayed to the user.

A blocker is exactly one of:
- dev `QUESTION` — requirement ambiguity that cannot be resolved from plan + design docs;
- dev `FAILED` / `ABORT` — missing tech-reference, or unrecoverable lint / test / build failure;
- a Simplicity Default trigger (`core.md`) — new abstraction, dependency, config flag, or generalization — which needs Complication Approval before proceeding.

A dev `BLOCKED_MANUAL` signal is **not** a blocker that halts immediately: the dev registers the manual action, defers only the affected subtasks, and continues all unblocked work. The phase halts at the manual-steps gate (step 8) only after every unblocked task is COMPLETED.

Devs do **not** pause the user for routine "non-trivial approach" decisions. Within plan + design-doc scope they make the reasonable call and proceed. Pausing mid-impl for anything other than a blocker above (or the manual-steps gate) is a protocol violation.

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
       - work autonomously within plan + design-doc scope; do NOT pause the user for routine approach choices — make the reasonable call and proceed
       - escalate only on a blocker (see Execution mode): emit `QUESTION` for unresolvable requirement ambiguity, `FAILED` for missing tech-reference / unrecoverable failure, or raise Complication Approval via AskUserQuestion **only** when a Simplicity Default trigger fires (new abstraction / dependency / config flag / generalization)
       - **manual-steps handling**: when a plan subtask cannot proceed without a human-only operational action (a secret, cloud resource, migration run by hand, env var, third-party account):
         - append an `MS-N` entry to `<sprint>/manual-steps.md` per `t_manual-steps.md` (full step-by-step instructions plus a `Verification` field stating how completion is confirmed)
         - mark the affected subtask `- [ ] <subtask> — BLOCKED: MS-N` in `<sprint>/plan.md`
         - emit `BLOCKED_MANUAL` for that subtask and continue all unblocked work in the task
         - registering a manual step is a last resort — only when the action genuinely cannot be done with agent tools (code, `commands.yaml` commands, file ops); PM may bounce an entry back to be implemented autonomously
       - write code + unit tests (or integration/e2e for test-engineer)
       - run `lint`, `test` per `commands.yaml`; do not advance with failures unreported
       - **stub handling**:
         - when introducing new TODO: insert `// TODO(sprint-<NNN-slug>): <reason>` marker in code AND add row to `.asd/project/stubs.md` (Sprint, File:Line, Reason, Owner)
         - when resolving an existing stub (current task is "Resolve stub X" or as side effect): remove `// TODO(sprint-...)` marker from code AND delete the row from `.asd/project/stubs.md`
         - never edit-in-place a stub row; always delete + (optionally) re-add under new sprint id for migration
       
       - commit per Conventional Commits (one logical change per commit; subject ≤50 chars; body describes WHY)
       - tick corresponding checkboxes in `<sprint>/plan.md`
       - emit COMPLETED with summary (files touched, AC-N satisfied, stubs added) when all subtasks done; when some subtasks are manual-blocked, emit COMPLETED for the unblocked portion plus `BLOCKED_MANUAL` listing the deferred `MS-N`
7. Wait all task signals (COMPLETED and/or BLOCKED_MANUAL)
8. **Manual-steps validation + gate** — when any `BLOCKED_MANUAL` was emitted:
   - dispatch `asd-pm` via Task to validate each new `MS-N` entry for necessity:
     - keep the entry only when the action genuinely cannot be done autonomously (needs access, a secret, an external account, or an authority the agent lacks)
     - reject any entry the agent could do with its own tools → PM re-dispatches that task to the owning dev with feedback "implement autonomously, remove MS-N"; the dev deletes the entry, unmarks the `BLOCKED:` subtask, implements it; loop step 7
   - once all remaining `MS-N` entries are PM-validated and all unblocked tasks COMPLETED, dispatch `asd-pm` via Task:
     - record the manual-steps halt in `state.json` `escalations[]`, append a decisions-log entry
     - present `manual-steps.md` to the user (pause-message format per `checkpoints.md`) and wait for an explicit continue command
   - on user continue: re-dispatch each deferred task to its owning dev via Task with instruction:
     - verify the referenced `MS-N` per its `Verification` field
     - if verified → flip the entry `Status` to `done`, finish the `BLOCKED:` subtasks, tick `plan.md` checkboxes, emit COMPLETED
     - if not verified → emit `BLOCKED_MANUAL` again (entry stays `pending`); relay to user
   - loop until every `MS-N` is `done` and every deferred task COMPLETED
9. **Impl assessment checkpoint** — dispatch `asd-pm` via Task:
   - read updated `<sprint>/plan.md` → verify all checkboxes ticked
   - read `.asd/project/stubs.md` → list stubs introduced this sprint (filter by Sprint=<NNN-slug>; all rows are open by definition since delete-on-resolve)
   - compose impl summary: tasks done, AC-N coverage map, files changed, tests added, lint status, sprint-introduced stubs
   - present to user via AskUserQuestion: approve (advance to impl-review) / request changes / abort
   - on approve: update `state.json`, append decisions-log entry ("impl assessment approved"); emit COMPLETED
   - on request changes: relay specific feedback to relevant dev(s) via Task; loop step 7
   - on abort: emit ABORT
10. Emit phase COMPLETED with return contract

## Escalation (only interruptions before the impl assessment gate)

Per Execution mode, these are the **only** reasons impl contacts the user before all tasks complete:

- Any dev `QUESTION` (unresolvable requirement ambiguity) → relay to user, halt; resume on answer
- Any dev Complication Approval request (Simplicity Default trigger) → relay to user, halt; resume on decision
- Any dev `FAILED` / `ABORT` → relay, halt
- Manual-steps gate (step 8) — after all unblocked work is COMPLETED and PM-validated `MS-N` entries remain, PM presents `manual-steps.md`; resume on the user's continue command

## Artefacts produced
- Source code + unit tests in repo
- Integration / e2e tests in repo (from test-engineer tasks)
- Updated `.asd/project/stubs.md` (project-global, append-only)
- `<sprint>/manual-steps.md` when a manual action arose (per-sprint, append-only)
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
- Templates: `t_plan.md` (Task parsing reference), `t_stubs.md`, `t_manual-steps.md`
