# ASD Workflow: Impl

Orchestration body for the `asd-phase-impl` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- **Initial mode**: `plan.md` approved (per checkpoints precondition chain); `state.json.phase` advanced from `plan`
- **Review-fix mode**: `state.json.review_fixes_pending` set to `iter-NN`; `<sprint>/reviews/impl/iter-NN/` reviewer files exist
- **Test-fix mode**: `state.json.test_defects_pending` set; `<sprint>/test-plan.md` has pending `Defects` rows

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `plan.md`, `<sprint>/reviews/impl/iter-NN/` (review-fix), `<sprint>/test-plan.md` (test-fix), persistent docs, `.asd/project/custom-common-rules.md`, `custom-coding-rules.md`, `stubs.md`, `<sprint>/manual-steps.md`
- write a file: `state.json` inline, for the mechanical non-gate writes at steps 4, 11 (`sprint-lifecycle.md` "State recovery")
- request user decision: escalation only (see Execution mode)
- delegate to agent: devs per task owner / finding owner / defect owner; PM for manual-steps gate, impl completion gate, impl assessment gate, decisions-log tied to those gates

## Modes

Detected at step 2 from `state.json`:

- **Initial mode** (both fix flags null/absent) — implement `plan.md` Task blocks. Ends with user-facing impl assessment gate (step 10).
- **Review-fix mode** (`review_fixes_pending` = `iter-NN`) — entered when impl-review routed sprint back. Resolve reviewer findings in `<sprint>/reviews/impl/iter-NN/`. On completion clears `review_fixes_pending`.
- **Test-fix mode** (`test_defects_pending` set) — entered when impl-test found code defects. Resolve pending `D-N` rows in `<sprint>/test-plan.md`. On completion clears `test_defects_pending`.

Fix modes **skip the impl assessment gate**. Impl completion gate (step 9) applies in **all** modes. Devs write production code only — tests are authored and run in `impl-test`.

## Execution mode

Impl runs **autonomously** in all modes. Once tasks/fixes dispatched, devs work without user contact until **one** of:

- **all plan tasks (initial), findings (review-fix), or defects (test-fix) signal COMPLETED** — then initial mode hits impl assessment gate (step 10), the first and only user pause; fix modes have no such pause; or
- **all unblocked work COMPLETED and validated manual steps remain pending** — phase halts at manual-steps gate (step 8); or
- **a blocker requiring escalation arises** — execution halts, blocker relayed.

A blocker is exactly one of:
- dev `QUESTION` — requirement ambiguity unresolvable from plan + persistent docs;
- dev `FAILED`/`ABORT` — missing tech-reference, or unrecoverable lint/build failure;
- a Simplicity Default trigger (`core.md`) — new abstraction, dependency, config flag, or generalization — needs Complication Approval before proceeding.

A dev `BLOCKED_MANUAL` does **not** halt immediately: dev registers the manual action, defers only affected subtasks, continues all unblocked work. Phase halts at manual-steps gate (step 8) only after every unblocked task COMPLETED.

Devs do **not** pause user for routine "non-trivial approach" decisions. Within plan + persistent docs scope, make the reasonable call and proceed. Pausing mid-impl for anything other than a blocker above (or manual-steps gate) is a protocol violation.

Fix modes are unbounded by design: impl-test may route defects back any number of times. A dev that cannot fix a defect emits `FAILED` rather than looping silently.

## Workflow

1. Read `.asd/project/config.yaml` (`backward_compat`, `system.tools`, `self_hosting`, `language.chat`, `language.docs`). When `self_hosting: enabled`, devs' write scope extends to canonical `.asd/rules/`, `.asd/templates/`, `.asd/agents/`, `.asd/skills/`, `.asd/workflows/`, `.asd/hooks/`, `.asd/sync.js`, `.asd/release-manifest.json`, root `AGENTS.md`, `README.md`, `tests/**` per plan scope (`sprint-lifecycle.md` "Self-hosting"); dev instruction (step 6) adds: after any canonical edit, run `node .asd/sync.js --apply <targets>` before marking the task done; generated `.claude/`/`.codex/`/`.agents/skills/` stay off-limits always
2. Read `<sprint>/state.json` → **detect mode**:
   - both fix flags null/absent → **initial mode**; confirm `plan.md` approved
   - `review_fixes_pending` = `iter-NN` → **review-fix mode**; confirm `<sprint>/reviews/impl/iter-NN/` exists (else `ABORT — precondition not met: reviews/impl/iter-NN missing`)
   - `test_defects_pending` set → **test-fix mode**; confirm `<sprint>/test-plan.md` exists with pending `D-N` rows (else `ABORT — precondition not met: test-plan.md defects missing`)
3. **Build work set** per mode:
   - **initial** — read `<sprint>/plan.md` → parse Task blocks: title, owner (backend-dev / frontend-dev), subtask checkboxes, dependencies
   - **review-fix** — read every reviewer file in `<sprint>/reviews/impl/iter-NN/`; collect all CONCERNS findings plus all FAIL findings the user accepted for fix (skip FAIL noted resolved-by-override); from each finding's `Location` (file:line) determine owning dev; group findings by owner into fix tasks. Findings located in test files route to `asd-test-engineer`
   - **test-fix** — read `<sprint>/test-plan.md` `Defects` section; collect every `D-N` with status `pending`; from each `Location` determine owning dev; group by owner into fix tasks
4. Write `state.json` (phase=impl) inline (mechanical, no gate)
5. **Build execution graph**:
   - initial — from Task dependencies; topological sort; mark independent tasks parallelisable
   - fix modes — fix tasks independent unless two touch same file; parallel where independent, sequential where they collide
6. **Dispatch tasks** per execution graph:
   - sequential where dependent; parallel where independent (caller schedules concurrent delegations)
   - per task: delegate to assigned dev (`asd-backend-dev` | `asd-frontend-dev`; `asd-test-engineer` only for review findings in test files) with payload:
     - initial — Task block excerpt (title + subtasks + dependencies); review-fix — grouped finding list (each finding's severity, location, description, suggested fix; plus user-approved change note for accepted FAIL findings); test-fix — grouped defect list (`D-N`, location, symptom, failing test)
     - relevant context paths (PRD AC-N referenced, ADRs, ux-spec, DESIGN.md, accessibility, stack, commands.yaml, tech-reference/, custom-common-rules.md, custom-coding-rules.md; review-fix also: reviewer files in `reviews/impl/iter-NN/`; test-fix also: `test-plan.md`)
     - `language.chat`, `language.docs`
     - instruction:
       - read context first
       - tech-reference precondition (refuse-to-implement rule): see `artifact-layout.md` "Tech reference docs" — do not restate here
       - work autonomously within plan + persistent docs scope; do NOT pause user for routine approach choices — make the reasonable call and proceed
       - escalate only on a blocker (see Execution mode): emit `QUESTION` for unresolvable requirement ambiguity, `FAILED` for missing tech-reference / unrecoverable failure, or raise Complication Approval via request for user decision **only** when a Simplicity Default trigger fires (new abstraction / dependency / config flag / generalization)
       - manual-steps handling: see `sprint-lifecycle.md` "Impl phase" — do not restate here
       - write production code only — **no tests**; test selection, authoring, pruning, and running belong to `impl-test`
       - review-fix — apply suggested fix per finding, or equivalent correct fix; test-fix — fix the root cause behind the failing test (never weaken or delete the test), then set the defect row `Status` to `fixed` with the fixing commit sha in `<sprint>/test-plan.md`
       - run `build` and `lint` per `commands.yaml`; do not advance with failures or warnings unreported
       - stub handling: see `git-strategy.md` "TODO stubs" — do not restate here
       - commit per Conventional Commits (one logical change per commit; subject ≤50 chars; body describes WHY)
       - initial — tick corresponding checkboxes in `<sprint>/plan.md`
       - emit COMPLETED with summary (files touched; initial: AC-N satisfied, stubs added; review-fix: findings resolved by id; test-fix: defects resolved by `D-N`) when all subtasks/findings/defects done; when some subtasks manual-blocked, emit COMPLETED for unblocked portion plus `BLOCKED_MANUAL` listing deferred `MS-N`
7. Wait all task signals (COMPLETED and/or BLOCKED_MANUAL)
8. **Manual-steps validation + gate** — when any `BLOCKED_MANUAL` emitted:
   - delegate to agent `asd-pm` to validate each new `MS-N` for necessity:
     - keep only when action genuinely cannot be done autonomously (needs access, secret, external account, or authority agent lacks)
     - reject any entry agent could do with own tools → PM re-dispatches that task to owning dev with feedback "implement autonomously, remove MS-N"; dev deletes entry, unmarks `BLOCKED:` subtask, implements it; loop step 7
   - once all remaining `MS-N` PM-validated and all unblocked tasks COMPLETED, delegate to agent `asd-pm`:
     - record manual-steps halt in `state.json` `escalations[]`, append decisions-log entry
     - present `manual-steps.md` to user (pause-message format per `checkpoints.md`); wait for explicit continue command
   - on user continue: re-dispatch each deferred task to owning dev with instruction:
     - verify referenced `MS-N` per its `Verification` field
     - if verified → flip entry `Status` to `done`, finish `BLOCKED:` subtasks, tick `plan.md` checkboxes, emit COMPLETED
     - if not verified → emit `BLOCKED_MANUAL` again (entry stays `pending`); relay to user
   - loop until every `MS-N` is `done` and every deferred task COMPLETED
9. **Impl completion gate** (all modes) — delegate to agent `asd-pm` to verify, via `commands.yaml`:
   - `build` command executed and finished with no errors and no warnings
   - `lint` command executed and finished with no errors and no warnings
   - tests are NOT run here — the suite is the `impl-test` gate
   - if any condition fails → phase MUST NOT advance: PM relays specific failure to owning dev(s) to fix and re-run; loop step 7. Unrecoverable failure escalates as a blocker (`FAILED`).
   - automatic verification — no user pause
10. **Impl assessment checkpoint** — **initial mode only** (fix modes skip to step 11) — delegate to agent `asd-pm`:
   - read updated `<sprint>/plan.md` → verify all checkboxes ticked
   - read `.asd/project/stubs.md` → list stubs introduced this sprint (filter Sprint=<NNN-slug>; all rows open by definition since delete-on-resolve)
   - compose impl summary: tasks done, AC-N coverage map, files changed, build + lint status, sprint-introduced stubs
   - present via request for user decision: approve (advance to impl-test) / request changes / abort
   - on approve: update `state.json`, append decisions-log entry ("impl assessment approved")
   - on request changes: relay specific feedback to relevant dev(s); loop step 7
   - on abort: emit ABORT
11. **Fix-mode finalize** — fix modes only — write inline (mechanical, no gate):
   - review-fix: clear `state.json.review_fixes_pending` (set null), append decisions-log entry "impl fix for iter-NN: findings resolved"
   - test-fix: clear `state.json.test_defects_pending` (set null), append decisions-log entry "impl test-fix: defects <D-N list> resolved"
12. Emit phase COMPLETED with return contract (`NEXT: impl-test` in all modes)

## Escalation (interruptions before phase exit)

Per Execution mode, the **only** reasons impl contacts user before all tasks/findings/defects complete (same in all modes):

- Any dev `QUESTION` (unresolvable requirement ambiguity) → relay, halt; resume on answer
- Any dev Complication Approval request (Simplicity Default trigger) → relay, halt; resume on decision
- Any dev `FAILED`/`ABORT` → relay, halt
- Manual-steps gate (step 8) — after all unblocked work COMPLETED and PM-validated `MS-N` remain, PM presents `manual-steps.md`; resume on user continue command

Impl completion gate (step 9) and, initial mode only, impl assessment gate (step 10) are the post-work gates. Fix modes have no user-facing assessment gate.

## Artefacts produced
- Production source code in repo (no tests — see `impl-test`)
- Updated `.asd/project/stubs.md` (project-global; open stubs only, deleted on resolution)
- `<sprint>/manual-steps.md` when a manual action arose (per-sprint, append-only)
- Updated `<sprint>/plan.md` checkboxes (initial mode)
- Updated reviewer files in `<sprint>/reviews/impl/iter-NN/` with user-approved change notes (review-fix mode)
- Updated `<sprint>/test-plan.md` defect rows flipped to `fixed` (test-fix mode)
- Updated `state.json` (phase=impl; the entered mode's fix flag cleared on exit)
- Git commits per Conventional Commits
- decisions-log entry on impl assessment approval (initial) or fix-mode finalize

## Agents delegated to
- `asd-pm` (manual-steps gate, impl completion gate, impl assessment gate, decisions-log tied to those gates; mechanical writes at steps 4, 11 are now inline workflow writes, Task 15)
- `asd-backend-dev` (per Task with owner=backend-dev)
- `asd-frontend-dev` (per Task with owner=frontend-dev)
- `asd-test-engineer` (review-fix mode only, for findings located in test files)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: impl | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: impl-test
```

## References
- `.asd/rules/sprint-lifecycle.md` (impl phase contract, impl modes, completion gate, impl⇄impl-test⇄impl-review cycle)
- `.asd/rules/checkpoints.md` (impl assessment gate, fix-mode preconditions)
- `.asd/rules/review-policy.md` (severity, finding format consumed in review-fix mode)
- `.asd/rules/git-strategy.md` (commits, project-global stubs, dirty tree)
- `.asd/rules/artifact-layout.md` (tech-reference refuse-to-implement rule, project stubs path)
- `.asd/rules/language-policy.md`
- Templates: `t_plan.md` (Task parsing reference), `t_review.md` (reviewer finding format, review-fix mode), `t_test-plan.md` (defect format, test-fix mode), `t_stubs.md`, `t_manual-steps.md`
