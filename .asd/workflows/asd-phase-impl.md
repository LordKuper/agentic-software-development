# ASD Workflow: Impl

Owner: inline orchestrator; dispatches `asd-dev`, `asd-tester`, a memory-fix owner, `asd-advisor`, skill `asd-init`.

## Entry
```json
{"requires": ["active sprint at .asd/sprints/<NNN-slug>/"], "modes": {"initial": "review_fixes_pending and test_defects_pending both null; plan.md approved (checkpoints precondition chain); state.json.phase advanced from plan", "review-fix": "review_fixes_pending = <id> (wave-<K>/iter-NN; a legacy bare iter-NN reads as wave 1, its dir the legacy one, sprint-lifecycle.md 'Review iteration counters'); <sprint>/reviews/impl/<id>/ reviewer files exist", "test-fix": "test_defects_pending = true; <sprint>/test-plan.md has pending Defects rows"}, "ops": ["context: agent-protocol.md 'Orchestrator phase entry'; agent bundles per 'Dispatch payload'", "run command: git status --porcelain / git diff for step 9's round diff", "dispatch a skill: asd-init sprint-mediated mode (step 6)", "append friction: F-N to <sprint>/friction-log.md per sprint-lifecycle.md 'Friction log'", "timing: a dispatch op around each agent delegation in ## Dispatch (sprint-lifecycle.md 'Operation timing')"]}
```

## Inputs
```json
[".asd/project/config.yaml", "<sprint>/state.json", "<sprint>/plan.md", "<sprint>/reviews/impl/<id>/ (review-fix)", "<sprint>/test-plan.md (test-fix)", "persistent docs per sprint-lifecycle.md 'Input sources'", ".asd/project/custom-common-rules.md, custom-coding-rules.md", ".asd/project/stubs.md", "<sprint>/manual-steps.md"]
```

## Steps

After dispatch, user contact is limited to blockers, validated manual steps (8) or initial assessment (10). Test-fix loops until green or stalemate (`asd-phase-impl-test.md` step 9).

1. Read `.asd/project/config.yaml` (`backward_compat`, `system.tools`, `self_hosting`, `language.chat`, `language.docs`); `self_hosting: enabled` binds `## Rules`' self-hosting bullet into every dispatch.
2. Select the mode from `<sprint>/state.json` (`## Entry` resolves legacy round IDs).

   | State | Mode | Required input | Assignment |
   |---|---|---|---|
   | `review_fixes_pending` = `<id>` | `review-fix` | `<sprint>/reviews/impl/<id>/`, else `ABORT — precondition not met: reviews/impl/<id> missing` | Dev chain, then Tester chain for test files. Orchestrator applies fixes outside Dev's allowlist (step 5). |
   | `test_defects_pending` set | `test-fix` | Pending `D-N` rows in `<sprint>/test-plan.md`, else `ABORT — precondition not met: test-plan.md defects missing` | Dev chain. |
   | Both fix flags null or absent | `initial` | Approved `plan.md` | Dev per Task, Tester for `Test-only`. |

   At most one fix flag is set. Finish the pending round before routing, including the review-fix-to-initial continuation under `sprint-lifecycle.md` "Scope amendment" (step 11).
3. **Build work set** per mode:
   - **initial** — read Task titles, subtask checkboxes, wave table and dependency lines in `plan.md`.
   - **review-fix** — take CONCERNS, admitted late findings and FAIL findings accepted for fix or retained on stalemate **continue fixing**, from all iteration reports including `<reviewer>.late.md`. Exclude `resolved:` IDs (`sprint-lifecycle.md` "User-resolved findings"). Carry `answer:` under `question:` per `review-policy.md` "Gate Verdict Format". Deduplicate per its "Autofix vs escalation". Group independent findings, routing test files to Tester and paths outside Dev's allowlist to orchestrator (step 5).
   - **test-fix** — group pending `D-N` rows in `test-plan.md` by independent fixes.
   - **Critical review-fix reach.** Before grouping, verify premise at current HEAD. Name the failure mechanism and search callers, consumers and equivalents. Brief each verified sibling; use normal owners and scope-amendment gate for expansion.
4. Write `state.json` (phase=impl) inline (mechanical, no gate)
5. **Build execution graph**:
   - Initial: schedule unticked work by ascending wave table, parallel within wave. Topologically sort dependencies only for plans predating the table. Skip fully ticked waves (`sprint-lifecycle.md` "Scope amendment").
   - Recover unticked `Test-only` work before dispatch per `sprint-lifecycle.md` "Creator dispatch recovery". Carry verified work to step 7; give Tester only unfinished work, Task commits and relevant authorized leftovers.
   - Fix modes: one agent per ordered chain, one chain in flight. Sort by finding/defect ID, keeping collisions adjacent. After Dev commits/signals, apply orchestrator-owned fixes per `review-policy.md` "Verify before applying"; commit under `git-strategy.md` "Commit before review" with `ASD-Task: <finding id>` before sync. Share Dev outcomes with Tester, which edits only `artifact-layout.md` "Test plan" rows authorized for the mode and records required checks in `Suite run`.
5a. Before each `asd-dev` task dispatch, run `node .asd/runtime.js route-task --input <path|->`, its input keys per `providers.md` "Task-class variants and routing", `risks` the task's `Material risk` lines as typed entries (`sprint-lifecycle.md` "Plan file format"; a fix round's: same section). `execution="command"` runs directly; `execution="agent"` dispatches `asd-dev-mechanical` for `mechanical`, `asd-dev-escalated` for `escalated`, or the base `asd-dev` for `tier: standard`. **Effort step**: a task failing step 9's objective check (`build`/`lint`) after its correction attempt is re-routed with `failedObjectiveCheck: true`, its `priorTier` and `effortRaised: false`; on `raiseEffort: true` re-dispatch as `providers.md` "Task-class variants and routing" says, re-routing with `effortRaised: true` when that attempt fails too; each re-dispatch's routing line records the persisted `reason`. Persist the record in `state.json.task_routing[taskId]` per `providers.md`, supplying its tier as `priorTier` only on a re-dispatch of the same id, and append the decisions-log routing line `- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]` (`git rev-parse HEAD`, one per dispatch; the `risk` suffix for a fix round's ids per `providers.md` "Task-class variants and routing"). Invalid routing blocks. In a fix mode, route every task of the chain first and persist each record, then dispatch the whole chain to a single agent at the highest tier returned. `asd-tester` work — a Task carrying a `Test-only:` line, the test-file findings chain — is unrouted: no `route-task` call, no `task_routing` record, its base agent dispatched with the line `- YYYY-MM-DD — route <ids>: standard, dispatch HEAD <sha>` (the anchor `sprint-lifecycle.md` "Creator dispatch recovery" "Failed dispatch" reads).
6. **Dispatch tasks** per execution graph:
   - For every migration Task, require the minimal failing fixture, reproducing command and expected result from the Task brief (`sprint-lifecycle.md` "Plan author checklist"). Include them in `work` before dispatch. Resolve a missing fixture before dispatch.
   - Before an initial wave with `Settings change:`, apply exactly its pairs via sprint-mediated `asd-init` against working-tree `t_config.yaml`. Orchestrator commits config, no `MS-N`. On `FAILED` halt before dispatch; else dispatch remaining subtasks.
   - initial mode: waves ascending, every task of a wave dispatched concurrently. Tag each task dispatch timing open with `impl_wave=<wave number>`. Close its own operation as soon as its terminal return or stop is observed, before waiting for other dispatches, per `sprint-lifecycle.md` "Operation timing". The next wave opens after all required signals. A fix mode uses step 5's ordered chain, Dev before Tester.
   - Before each review-fix chain verify commands/APIs per `artifact-layout.md` "Tech reference docs". Write/log missing entries and pass `inputs.tech_reference`; verification failure → `FAILED`.
   - per task, or once per chain in a fix mode (5a): delegate to the agent `## Dispatch` names (`dev` in `## Rules` reads as that agent); payload per `agent-protocol.md` "Dispatch payload", `## Dispatch`'s role keys: `work` — initial: Task block excerpt (title + subtasks + dependencies); review-fix: grouped finding list (each finding's id per `git-strategy.md` "Commits", severity, location, description, brief per step 3 for critical findings, plus the user-approved change note for accepted FAIL findings); test-fix: grouped defect list (`D-N`, location, symptom, failing test) plus the guidance of a stalemate continue answer logged for it in the live `decisions-log.md` (`artifact-layout.md` "Decisions log" rotation), if any; `inputs` — "Input sources" keys plus `commands`, `tech_reference`, `custom_rules`, `mockups` when the folder exists ("Input sources" `ux`), review-fix `reviews` (`reviews/impl/<id>/`), test-fix `test_plan`; `language` — `language.chat`, `language.docs`; instruction: `## Rules`
7. Wait all task signals (COMPLETED and/or BLOCKED_MANUAL); a dispatch returning none → `sprint-lifecycle.md` "Creator dispatch recovery" failed dispatch. Initial mode, once the wave has its live signals and reconstructed results and before the next wave opens: apply the Test-only check below, then tick the `plan.md` checkboxes of subtasks reported done by accepted completions or verified complete in recovery, append each returned `memory_index` line to its `MEMORY.md`, and commit; a `memory-check` hit on that commit goes to its owner's memory-fix dispatch here (`review-policy.md` "Memory-fix dispatch"). `self_hosting: enabled`: initial mode, once a wave's last canon-editing dispatch has signalled and before the next wave opens or step 9 runs; fix modes, once the dev chain has signalled and before the tester chain is dispatched (before step 9 when no tester chain follows) — run `node .asd/sync.js --apply <generated-view-path...>` (generated view paths only, per `providers.md` "Canonical path -> per-provider path") over every view whose canon changed — `--apply AGENTS.md` when canon changed but no view did, since any valid `--apply` recomputes `release-manifest.json`'s hash ledgers — then `node .asd/sync.js --check`, and commit the regenerated views
   - **Test-only completion.** Check completed subtasks against the full committed Task diff, including recovered and resumed work. For every new or extended behavior regression test, verify `Regression proof` against the diff and `code-style.md` §17. Record verified proof with the Task ID and test commit(s) in `decisions-log.md` before ticking; reuse matching records on re-entry. Compile-only or other adaptations that add or extend no behavior regression test need no proof. If proof is missing or invalid, keep the affected subtasks unticked and the wave open. Re-dispatch `asd-tester` for evidence only, with the gap and Task commit(s) in `work`, and check its return here.
   - **Contract-wave build.** On a wave containing a public contract change or its compile-only test-caller repairs, confirm the applicable build is green on the combined wave tree after sync where required. Reuse build evidence from that tree or run the configured build. Keep the wave open on failure and route the failure to the owning dev or compile-only `Test-only` repair. Dispatch any build-dependent work only after the planned check confirms the affected callers compile.
8. **Manual-steps validation + gate** [GATE hard: manual steps] — when any `BLOCKED_MANUAL` emitted:
   - validate each new `MS-N` for necessity (`artifact-layout.md` "Manual steps"); reject any entry the agent could do with its own tools → re-dispatch its owning dev with feedback "implement autonomously, remove MS-N"; loop step 7
   - once all remaining `MS-N` are validated and all unblocked tasks COMPLETED: append a decisions-log entry; add an `F-N` citing the `MS-N` ids only when the halt itself was a malfunction — unexpected, unworkable or raised at the wrong point (`sprint-lifecycle.md` "Friction log"); present `manual-steps.md` to the user (`checkpoints.md` "Gate mechanics"); wait for an explicit continue command
   - on continue: re-dispatch each deferred task to its owning agent to verify its `MS-N` (`## Rules`); on COMPLETED apply step 7's acceptance checks before ticking its `plan.md` checkboxes; a repeated `BLOCKED_MANUAL` is relayed to the user
   - loop until every `MS-N` is `done` and every deferred task COMPLETED
9. **Impl completion gate** (all modes) — phase MUST NOT emit COMPLETED until the orchestrator verifies, via `commands.yaml`:
   - `build` and `lint` each executed and finished with no errors and no warnings
   - then every `commands.yaml` `checks` entry (absent map: none) executed, on the views step 7's sync regenerated, exiting 0 — a non-zero exit fails the gate as a lint error does
   - Read committed and uncommitted round diff before commit/advance. Allow only dispatched path scopes, declared config write, orchestrator-synced views, step 7 plan/memory writes and memory-fix edits, orchestrator-owned fixes named by finding ID, and sprint `timing.jsonl`. Any extra path fails as build does, independent of staged lint.
   - No tests at this gate. Dev self-checks do not replace impl-test/impl-review gates.
   - Relay failures to owners and loop step 7. Escalate unrecoverable `FAILED`; no routine user pause.
10. **Impl assessment checkpoint** [GATE adaptive: initial impl assessment] — **initial mode only** (fix modes skip to step 11) — apply `checkpoints.md`, recording adaptive evidence or requesting the user:
   - read updated `<sprint>/plan.md` → verify all checkboxes ticked
   - Resolve or return all `flagged` choices before adaptive pass. Validate predicate/contract changes per `checkpoints.md` "Gate policy". Search live and rotated decisions before acceptance; log any reversal naming the earlier decision.
   - read `.asd/project/stubs.md` → list stubs introduced this sprint (filter Sprint=<NNN-slug>; all rows open by definition since delete-on-resolve)
   - compose impl summary: tasks done, AC-N coverage map, files changed, build + lint status, sprint-introduced stubs
   - present via request for user decision: approve (advance to impl-test) / request changes / abort
   - on approve: update `state.json`, append decisions-log entry ("impl assessment approved")
   - on request changes: relay specific feedback to relevant dev(s); loop step 7
   - on abort: emit ABORT
11. **Fix-mode finalize** — fix modes only — write inline (mechanical, no gate), after resolving or routing back any non-empty `flagged` as step 10 does:
   - review-fix: clear `state.json.review_fixes_pending` (set null), append decisions-log entry "impl fix for <id>: findings resolved"; when `plan.md` still holds an unticked Task (an amendment accepted while the flag was set), continue in initial mode, steps 3 to 10, before step 12 (`sprint-lifecycle.md` "Scope amendment")
   - test-fix: clear `state.json.test_defects_pending` (set null), append decisions-log entry "impl test-fix: defects <D-N list> resolved"
12. Emit phase COMPLETED with `## Return` (`NEXT: impl-test` in all modes)

## Rules
- must: read the payload context first; tech-reference precondition (refuse-to-implement): `artifact-layout.md` "Tech reference docs"; apply the checklists and iron rules of `code-style.md` §1 while authoring, not only at review.
- must: work autonomously within plan + persistent docs scope — never pause the user for routine approach choices, make the reasonable call and proceed; escalate only on a blocker: `QUESTION` for requirement ambiguity unresolvable from plan + persistent docs, a Complication Approval `QUESTION` only when a Simplicity Default trigger (`core.md`) fires, `FAILED` for a missing tech-reference, an unrecoverable lint/build failure, a defect it cannot fix (never a silent loop), or a command its host denied — committing its edits first and naming that command.
- must: register a human-only operational action as an `MS-N` in `<sprint>/manual-steps.md` (`t_manual-steps.md`), mark its subtasks `BLOCKED:`, defer only those and continue all unblocked work; emit COMPLETED for the unblocked portion plus `BLOCKED_MANUAL` listing the deferred `MS-N`. Rejected as avoidable (step 8): delete the entry, unmark the `BLOCKED:` subtask, implement it. On resume verify the `MS-N` per its `Verification` field: verified → flip its `Status` to `done`, finish the `BLOCKED:` subtasks, emit COMPLETED; not verified → `BLOCKED_MANUAL` again, entry stays `pending`. A manual step is an operational *setup* action, distinct from a `test-plan.md` Manual verification spec.
- never: author, modify or prune a test — write production code only. The impacted set (`sprint-lifecycle.md` "Impacted test set") may be run in any mode to self-check work in progress, never satisfying or substituting for step 9 or the `impl-test`/`impl-review` gates. Exception: a `Test-only` Task, whose `asd-tester` edits only that Task's test paths, never `test-plan.md` (`sprint-lifecycle.md` "Plan file format").
- must: review-fix — resolve every finding of `work`, applying `review-policy.md` "Verify before applying"; a fix changing a rule other files consume runs the consumer search of its "Autofix vs escalation"; a finding about a rule's reach is fixed per its "Reach findings".
- must: test-fix — fix the root cause behind the failing test, never weakening or deleting the test, then set the defect row `Status` to `fixed` with the fixing commit sha in `<sprint>/test-plan.md`.
- must: run `build` and `lint` per `commands.yaml`; never advance with failures or warnings unreported.
- must: stubs per `git-strategy.md` "TODO stubs"; staging and commit ownership — concurrently dispatched tasks share one worktree — per `git-strategy.md` "Commit before review"; commit per Conventional Commits (`git-strategy.md` "Commits").
- must: `self_hosting: enabled` — write scope extends per plan scope to the exhaustive allowlist in `sprint-lifecycle.md` "Self-hosting"; edit canon only, never run `sync.js --apply` (the orchestrator syncs at step 7); generated `.claude/`/`.codex/`/`.agents/skills/` stay off-limits always.
- never: edit `<sprint>/plan.md` (step 7 ticks it); in a wave of more than one Task leave a shared `MEMORY.md` untouched, returning its index line as `memory_index`.
- must: COMPLETED (`agent-protocol.md` "Return") when all subtasks/findings/defects are done: `changed` the files touched; `resolved` — initial: AC-N satisfied; review-fix: finding ids; test-fix: `D-N`; review-fix body adds the consumers the consumer search updated, initial body the stubs added; `flagged` in every mode.

## Dispatch
```json
[{"agent": "asd-dev", "when": "each Task without a Test-only line (initial); the fix chain (review-fix, test-fix)", "payload": ["mode", "task", "work", "inputs.context", "inputs", "write_scope", "language"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "BLOCKED_MANUAL", "FAILED", "ABORT"]}, {"agent": "asd-tester", "when": "a Test-only Task (initial); the test-file findings chain, after the dev chain (review-fix)", "payload": ["mode", "task", "work", "inputs.context", "inputs", "write_scope", "language"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "BLOCKED_MANUAL", "FAILED", "ABORT"]}, {"agent": "<owner> of .claude/agent-memory/<owner>/", "when": "a memory-check hit on step 7's MEMORY.md commit (Claude only)", "payload": ["mode", "task", "work", "inputs.context", "write_scope"], "signals": ["COMPLETED", "FAILED"]}, {"agent": "asd-advisor", "when": "ADVICE_NEEDED relay; escalation consult before a user escalation (agent-protocol.md 'Relay')", "payload": ["turn_budget", "inputs.context", "question, options, context paths"], "signals": []}, {"agent": "asd-init (skill, sprint-mediated mode)", "when": "a wave holding a Settings change: line opens (initial), step 6", "payload": ["the declared pairs"], "signals": ["COMPLETED", "FAILED"]}]
```

## Signals
```json
{"QUESTION": "blocker: escalation consult, then relay per agent-protocol.md 'Relay'", "FAILED": "blocker, asd-init's at step 6 included: escalation consult, then relay, halt, resume on the user's decision; tech-reference missing: orchestrator writes it", "ABORT": "blocker: relay, halt", "BLOCKED_MANUAL": "no immediate halt: unblocked work continues; the phase halts at step 8 only after every unblocked task COMPLETED", "ADVICE_NEEDED": "relay per agent-protocol.md 'Relay'; execution resumes, never a halt or a blocker"}
```

## Exit
```json
{"writes": ["production source code (no tests; a Test-only Task's excepted)", ".asd/project/stubs.md", "<sprint>/manual-steps.md", "<sprint>/plan.md checkboxes and MEMORY.md index lines (step 7)", "reviewer files in <sprint>/reviews/impl/<id>/ with user-approved change notes (review-fix)", "<sprint>/test-plan.md defect Status (test-fix)", "state.json", "commits", "decisions-log.md"], "next": [{"if": "every mode", "next": "impl-test"}]}
```

## Return
```
PHASE: impl | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: impl-test
```

## References
- `.asd/rules/agent-protocol.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/review-policy.md`
- `.asd/rules/git-strategy.md`
- `.asd/rules/artifact-layout.md`
- `.asd/rules/language-policy.md`
- Templates: `t_plan.md`, `t_review.md`, `t_test-plan.md`, `t_stubs.md`, `t_manual-steps.md`
