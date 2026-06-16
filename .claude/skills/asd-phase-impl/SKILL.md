---
name: asd-phase-impl
description: "Runs the ASD impl phase in one of two modes detected from state.json.review_fixes_pending: initial mode dispatches plan.md Task blocks to devs, fix mode resolves impl-review findings and returns to impl-review (the impl⇄impl-review cycle). Devs write code and tests, run build/test/lint, and commit; the phase enforces an impl completion gate before COMPLETED. Use when asd-sprint dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint."
metadata:
  asd-role: phase
  asd-order: "7"
  version: "0.1"
allowed-tools: "Read AskUserQuestion Task"
---

# ASD Phase: Impl

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- **Initial mode**: `plan.md` approved (per checkpoints precondition chain); `state.json.phase` advanced from `plan`
- **Fix mode**: `state.json.review_fixes_pending` set to `iter-NN`; `<sprint>/reviews/impl/iter-NN/` reviewer files exist

## Tool policy
- Read — `.asd/project/config.yaml`, `state.json`, `plan.md`, `<sprint>/reviews/impl/iter-NN/` (fix mode), persistent design/ docs, `.asd/project/custom-common-rules.md`, `custom-coding-rules.md`, `stubs.md`, `<sprint>/manual-steps.md`
- AskUserQuestion — escalation only (see Execution mode)
- Task — dispatch devs per task owner / finding owner; PM for state + assessment + decisions-log

## Modes

Detected at step 2 from `state.json.review_fixes_pending`:

- **Initial mode** (`review_fixes_pending` null/absent) — implement `plan.md` Task blocks. Ends with user-facing impl assessment gate (step 9).
- **Fix mode** (`review_fixes_pending` = `iter-NN`) — entered when impl-review routed sprint back. Resolve reviewer findings in `<sprint>/reviews/impl/iter-NN/`. **Skips impl assessment gate** — returns straight to impl-review. On completion clears `review_fixes_pending`.

Impl completion gate (step 9b) applies in **both** modes.

## Execution mode

Impl runs **autonomously** in both modes. Once tasks/fixes dispatched, devs work without user contact until **one** of:

- **all plan tasks (initial) or all findings (fix) signal COMPLETED** — then initial mode hits impl assessment gate (step 9), the first and only user pause; fix mode has no such pause; or
- **all unblocked work COMPLETED and validated manual steps remain pending** — phase halts at manual-steps gate (step 8); or
- **a blocker requiring escalation arises** — execution halts, blocker relayed.

A blocker is exactly one of:
- dev `QUESTION` — requirement ambiguity unresolvable from plan + design docs;
- dev `FAILED`/`ABORT` — missing tech-reference, or unrecoverable lint/test/build failure;
- a Simplicity Default trigger (`core.md`) — new abstraction, dependency, config flag, or generalization — needs Complication Approval before proceeding.

A dev `BLOCKED_MANUAL` does **not** halt immediately: dev registers the manual action, defers only affected subtasks, continues all unblocked work. Phase halts at manual-steps gate (step 8) only after every unblocked task COMPLETED.

Devs do **not** pause user for routine "non-trivial approach" decisions. Within plan + design-doc scope, make the reasonable call and proceed. Pausing mid-impl for anything other than a blocker above (or manual-steps gate) is a protocol violation.

## Workflow

1. Read `.asd/project/config.yaml` (`backward_compat`, `system.tools`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → **detect mode** from `review_fixes_pending`:
   - null/absent → **initial mode**; confirm `plan.md` approved
   - set to `iter-NN` → **fix mode**; confirm `<sprint>/reviews/impl/iter-NN/` exists (else `ABORT — precondition not met: reviews/impl/iter-NN missing`)
3. **Build work set** per mode:
   - **initial** — read `<sprint>/plan.md` → parse Task blocks: title, owner (backend-dev / frontend-dev / test-engineer), subtask checkboxes, dependencies
   - **fix** — read every reviewer file in `<sprint>/reviews/impl/iter-NN/`; collect all CONCERNS findings plus all FAIL findings the user accepted for fix (skip FAIL noted resolved-by-override); from each finding's `Location` (file:line) determine owning dev (backend-dev / frontend-dev / test-engineer); group findings by owner into fix tasks
4. Dispatch `asd-pm` via Task: update `state.json` (phase=impl)
5. **Build execution graph**:
   - initial — from Task dependencies; topological sort; mark independent tasks parallelisable
   - fix — fix tasks independent unless two touch same file; parallel where independent, sequential where they collide
6. **Dispatch tasks** per execution graph:
   - sequential where dependent; parallel where independent (caller schedules concurrent Task calls)
   - per task: dispatch to assigned dev (`asd-backend-dev` | `asd-frontend-dev` | `asd-test-engineer`) via Task with payload:
     - initial — Task block excerpt (title + subtasks + dependencies); fix — grouped finding list (each finding's severity, location, description, suggested fix; plus user-approved change note for accepted FAIL findings)
     - relevant context paths (PRD AC-N referenced, ADRs, ux-spec, DESIGN.md, accessibility, stack, commands.yaml, tech-reference/, custom-common-rules.md, custom-coding-rules.md; fix mode also: reviewer files in `reviews/impl/iter-NN/`)
     - `language.chat`, `language.docs`
     - instruction:
       - read context first
       - verify `design/architecture/tech-reference/<tech>-<version>.md` exists per tech touched; if missing → emit `FAILED — tech-reference missing for <tech>@<version>` (Architect creates it via design re-run or out-of-band)
       - work autonomously within plan + design-doc scope; do NOT pause user for routine approach choices — make the reasonable call and proceed
       - escalate only on a blocker (see Execution mode): emit `QUESTION` for unresolvable requirement ambiguity, `FAILED` for missing tech-reference / unrecoverable failure, or raise Complication Approval via AskUserQuestion **only** when a Simplicity Default trigger fires (new abstraction / dependency / config flag / generalization)
       - **manual-steps handling**: when a plan subtask cannot proceed without a human-only operational action (secret, cloud resource, hand-run migration, env var, third-party account):
         - append `MS-N` entry to `<sprint>/manual-steps.md` per `t_manual-steps.md` (full step-by-step instructions plus `Verification` field stating how completion is confirmed)
         - mark affected subtask `- [ ] <subtask> — BLOCKED: MS-N` in `<sprint>/plan.md`
         - emit `BLOCKED_MANUAL` for that subtask, continue all unblocked work
         - registering a manual step is last resort — only when action genuinely cannot be done with agent tools (code, `commands.yaml` commands, file ops); PM may bounce an entry back to be implemented autonomously
       - write code + unit tests (or integration/e2e for test-engineer); fix mode — apply suggested fix per finding, or equivalent correct fix, and add/adjust tests so finding cannot recur
       - run `build`, `lint`, `test` per `commands.yaml`; do not advance with failures or warnings unreported
       - **stub handling**:
         - new TODO: insert `// TODO(sprint-<NNN-slug>): <reason>` marker in code AND add row to `.asd/project/stubs.md` (Sprint, File:Line, Reason, Owner)
         - resolving existing stub (task is "Resolve stub X" or side effect): remove `// TODO(sprint-...)` marker AND delete the row from `.asd/project/stubs.md`
         - never edit-in-place a stub row; always delete + (optionally) re-add under new sprint id for migration
       - commit per Conventional Commits (one logical change per commit; subject ≤50 chars; body describes WHY)
       - initial — tick corresponding checkboxes in `<sprint>/plan.md`
       - emit COMPLETED with summary (files touched; initial: AC-N satisfied, stubs added; fix: findings resolved by id) when all subtasks/findings done; when some subtasks manual-blocked, emit COMPLETED for unblocked portion plus `BLOCKED_MANUAL` listing deferred `MS-N`
7. Wait all task signals (COMPLETED and/or BLOCKED_MANUAL)
8. **Manual-steps validation + gate** — when any `BLOCKED_MANUAL` emitted:
   - dispatch `asd-pm` via Task to validate each new `MS-N` for necessity:
     - keep only when action genuinely cannot be done autonomously (needs access, secret, external account, or authority agent lacks)
     - reject any entry agent could do with own tools → PM re-dispatches that task to owning dev with feedback "implement autonomously, remove MS-N"; dev deletes entry, unmarks `BLOCKED:` subtask, implements it; loop step 7
   - once all remaining `MS-N` PM-validated and all unblocked tasks COMPLETED, dispatch `asd-pm` via Task:
     - record manual-steps halt in `state.json` `escalations[]`, append decisions-log entry
     - present `manual-steps.md` to user (pause-message format per `checkpoints.md`); wait for explicit continue command
   - on user continue: re-dispatch each deferred task to owning dev via Task with instruction:
     - verify referenced `MS-N` per its `Verification` field
     - if verified → flip entry `Status` to `done`, finish `BLOCKED:` subtasks, tick `plan.md` checkboxes, emit COMPLETED
     - if not verified → emit `BLOCKED_MANUAL` again (entry stays `pending`); relay to user
   - loop until every `MS-N` is `done` and every deferred task COMPLETED
9. **Impl completion gate** (both modes) — dispatch `asd-pm` via Task to verify, via `commands.yaml`:
   - `build` command executed and finished with no errors and no warnings
   - `test` command executed and every test passed
   - if any condition fails → phase MUST NOT advance: PM relays specific failure to owning dev(s) via Task to fix and re-run; loop step 7. Unrecoverable failure escalates as a blocker (`FAILED`).
   - automatic verification — no user pause
10. **Impl assessment checkpoint** — **initial mode only** (fix mode skips to step 11) — dispatch `asd-pm` via Task:
   - read updated `<sprint>/plan.md` → verify all checkboxes ticked
   - read `.asd/project/stubs.md` → list stubs introduced this sprint (filter Sprint=<NNN-slug>; all rows open by definition since delete-on-resolve)
   - compose impl summary: tasks done, AC-N coverage map, files changed, tests added, build + test status, sprint-introduced stubs
   - present via AskUserQuestion: approve (advance to impl-review) / request changes / abort
   - on approve: update `state.json`, append decisions-log entry ("impl assessment approved")
   - on request changes: relay specific feedback to relevant dev(s) via Task; loop step 7
   - on abort: emit ABORT
11. **Fix-mode finalize** — fix mode only — dispatch `asd-pm` via Task: clear `state.json.review_fixes_pending` (set null), append decisions-log entry "impl fix for iter-NN: findings resolved"
12. Emit phase COMPLETED with return contract (`NEXT: impl-review` in both modes)

## Escalation (interruptions before phase exit)

Per Execution mode, the **only** reasons impl contacts user before all tasks/findings complete (same in both modes):

- Any dev `QUESTION` (unresolvable requirement ambiguity) → relay, halt; resume on answer
- Any dev Complication Approval request (Simplicity Default trigger) → relay, halt; resume on decision
- Any dev `FAILED`/`ABORT` → relay, halt
- Manual-steps gate (step 8) — after all unblocked work COMPLETED and PM-validated `MS-N` remain, PM presents `manual-steps.md`; resume on user continue command

Impl completion gate (step 9) and, initial mode only, impl assessment gate (step 10) are the post-work gates. Fix mode has no user-facing assessment gate.

## Artefacts produced
- Source code + unit tests in repo
- Integration/e2e tests in repo (from test-engineer tasks)
- Updated `.asd/project/stubs.md` (project-global; open stubs only, deleted on resolution)
- `<sprint>/manual-steps.md` when a manual action arose (per-sprint, append-only)
- Updated `<sprint>/plan.md` checkboxes (initial mode)
- Updated reviewer files in `<sprint>/reviews/impl/iter-NN/` with user-approved change notes (fix mode)
- Updated `state.json` (phase=impl; `review_fixes_pending` cleared on fix-mode exit)
- Git commits per Conventional Commits
- decisions-log entry on impl assessment approval (initial) or fix-mode finalize

## Agents dispatched
- `asd-pm` (state, impl completion gate, impl assessment, fix-mode finalize, decisions-log)
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
- `.asd/rules/sprint-lifecycle.md` (impl phase contract, impl modes, completion gate, impl⇄impl-review cycle)
- `.asd/rules/checkpoints.md` (impl assessment gate, fix-mode precondition)
- `.asd/rules/review-policy.md` (severity, finding format consumed in fix mode)
- `.asd/rules/git-strategy.md` (commits, project-global stubs, dirty tree)
- `.asd/rules/artifact-layout.md` (tech-reference refuse-to-implement rule, project stubs path)
- `.asd/rules/language-policy.md`
- Templates: `t_plan.md` (Task parsing reference), `t_review.md` (reviewer finding format, fix mode), `t_stubs.md`, `t_manual-steps.md`
