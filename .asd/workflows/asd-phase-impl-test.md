# ASD Workflow: Impl Test

Orchestration body for the `asd-phase-impl-test` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl COMPLETED signal received (build + lint green); `state.json.phase` advanced from `impl`
- `state.json.review_fixes_pending` and `test_defects_pending` both cleared by the impl fix-mode finalize

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `plan.md`, `test-plan.md`, persistent docs (PRD ACs, ux-spec), `commands.yaml`, `custom-common-rules.md`, `custom-coding-rules.md`, existing test sources
- run command: change-surface diff; `commands.yaml` `test`/`lint`/`build`, impacted-scoped (`sprint-lifecycle.md` "Impacted test set") for the pre-strategy run and the suite gate alike
- write `state.json` and decisions-log inline for mechanical phase work
- request user decision: out-of-scope test removal gate; escalation
- delegate one live `asd-tester` instance for the whole phase (pre-strategy run, strategy, prune/author and suite run); recover from on-disk evidence only after session loss
- append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log"

## Execution mode

Runs **autonomously**. The only user contacts:

- **removal gate** (step 6) — a proposed deletion of a test outside the sprint change scope;
- a tester blocker — `QUESTION` (AC behaviour genuinely ambiguous), `FAILED` (test runner broken, tech-reference missing), or a Simplicity Default trigger (new test dependency or test infrastructure) needing Complication Approval.

No user gate on a green impacted-set run, and none on routing defects back to impl.

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`, `backward_compat`, `self_hosting`), `<sprint>/state.json` → write `phase=impl-test` inline (mechanical, no gate). Check `<sprint>/test-plan.md` for an `Entry log` with a prior row: none → this is **entry 1** (first entry this sprint); a prior row exists → this is a **re-entry**, and its `HEAD analysed` is `<prior-sha>`
1a. Route Tester work through `node .asd/runtime.js route-task --input <path>` and persist its result. `execution="command"` runs directly; `execution="agent"` dispatches `asd-tester-<tier>` for `mechanical`/`critical`, or the base `asd-tester` for `tier: standard` (no `-standard` variant exists — `providers.md` "Task-class variants and routing"). Persist `state.json.task_routing[taskId]` per `providers.md`; reuse its tier on re-entry. A risk declared against the change and a failed objective check after one correction are critical and never later downgraded.
2. **Change surface**:
   - **Entry 1**: run command for `git diff <git.base_branch>...HEAD --stat <exclude_paths>` plus file list, using the same `exclude_paths` as impl-review's self-hosting-aware scoping (`.asd/rules/external-review.md` "Phase-scoped payload" — consumer default excludes `.asd/**`/`docs/**`; `self_hosting: enabled` includes the whole repo minus `.asd/project/**`/`.asd/sprints/**`/generated views). This is the **full change surface**
   - **Re-entry**: run command for `git diff <prior-sha>...HEAD --stat <exclude_paths>` (same `exclude_paths`) — the review-fix or test-fix commits made since the prior entry. This **delta** is the scope for steps 4 and 7 only
   - Either branch, before running its diff: reuse `state.json.derived_handoff.files` when valid per `sprint-lifecycle.md` "State recovery" (sole SSoT for its shape, validity rule and absent-key fallback); otherwise run the diff as written above and write the resulting list back to that slot inline (mechanical, no gate)
   - Either way: derive the **impacted set** per `sprint-lifecycle.md` "Impacted test set" (diff test files + reference/import search + AC-tag search, native selector override when `commands.yaml` carries one, mandatory shared-infrastructure safety valve checked before use) — this is the scope for steps 3 and 8
3. **Pre-strategy impacted run** — the same live `asd-tester` runs the impacted existing tests before authoring. Its raw result feeds the strategy pass.
4. **Strategy pass** — the same live `asd-tester` receives: change surface, prior plan evidence, ACs, contracts, commands and rules. It:
   - **authoring bar + no-new-test decision rule**: `code-style.md` §17 (SSoT), not restated here — write decision `none` with its reason in `test-plan.md` when no test qualifies
   - test selection happens **now**, after the implementation exists — never speculatively from the plan; check-ladder selection and prune criteria per `code-style.md` §17 (SSoT), not restated here
   - **re-entry**: analyse only the delta — the material risk introduced or changed by the fix commits; leave prior `Risk → check decisions` rows untouched unless a fix actually changed that risk's behaviour, in which case update that row in place
   - specify `Manual verification` only when automation is impossible (visual UI, third-party live integration, ux feel) — `test-plan.md` is its single home, never duplicated in a review file
   - **entry 1**: write `<sprint>/test-plan.md` per `t_test-plan.md` (Risk → check decisions etc.); leave the first `Entry log` row's `HEAD analysed` unfilled for now (scope = "full change surface"). **Re-entry**: amend it — append new/updated rows; leave the new `Entry log` row's `HEAD analysed` unfilled for now (scope = "delta since entry N-1"); never rewrite prior rows outside the ones actually revised. Emit COMPLETED. The `HEAD analysed` sha itself is written in step 10, after the prune/author commit (step 7) and the suite recording (step 8) — never before — so the next re-entry's delta excludes this entry's own test-authoring commits
5. Read `test-plan.md` → collect proposed removals; split into in-scope (test file inside the change surface) and out-of-scope
6. **Removal gate** — only when out-of-scope removals exist: apply `checkpoints.md`; strict requests the user, adaptive needs recorded authority/evidence. Rejected removals are struck from `test-plan.md`.
7. **Prune + author pass** — the same live `asd-tester` handles every independent area serially. Scope is the same set step 4 analysed. It:
   - delete the approved removals; write the `add` decisions at the chosen level; fail-first regression proof and test-quality bars per `code-style.md` §17 (SSoT) — record the proof in the `Added tests` table
   - commit per Conventional Commits; emit COMPLETED
8. **Suite gate** — the same live `asd-tester` runs the impacted suite, lint/build and records raw results. Verdict is runner evidence, not its summary.
9. **Triage** on any failure:
   - **test defect** (bad assertion, wrong fixture, flaky pattern) → re-dispatch step 7 for the offending tests, then step 8 again
   - **code defect** → append a `D-N` row to the `Defects` section of `test-plan.md` (location, symptom, failing test, status `pending`); write `state.json.test_defects_pending = true` inline and append decisions-log "impl-test: defects <D-N list> → impl test-fix" (mechanical, no gate); commit these bookkeeping writes (`sprint-lifecycle.md` "Impl-test commits its own output"); emit COMPLETED with `NEXT: impl`
   - both kinds present → fix the test defects first, re-run, then route the remaining code defects back
10. **Green impacted run** — write inline (mechanical, no gate): fill this entry's `Entry log` row `HEAD analysed` with current `git rev-parse HEAD` (now that step 7's prune/author commit and step 8's suite recording have both landed, so the next re-entry's delta excludes this entry's own test-authoring commits); append decisions-log "impl-test: impacted set green (<counts>), <added>/<removed> tests"; confirm `test_defects_pending` null; re-record `state.json.derived_handoff` by re-running step 2's file-list diff now that step 7's commit has landed (`sprint-lifecycle.md` "State recovery" phase-exit re-record — this is the record `impl-review` reads); commit these bookkeeping writes (`sprint-lifecycle.md` "Impl-test commits its own output") — `git status --porcelain` MUST be empty before this step's COMPLETED, since `impl-review` refuses a dirty worktree; emit COMPLETED with `NEXT: impl-review`
11. tester QUESTION / FAILED / ABORT → relay, halt
12. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Re-entry

Every `impl` exit re-enters this phase. On re-entry the **strategy pass (step 4) and prune pass (step 7)** are scoped to the **delta since the prior entry** — the review-fix or test-fix commits, `git diff <prior HEAD analysed>...HEAD` — never a full re-derivation of the whole change surface. `test-plan.md` is **amended**, not rewritten: prior `Risk → check decisions` / `Added tests` / `Removed tests` rows stand unless a fix actually revised that risk, and a new `Entry log` row records the delta scope and the `HEAD` it was analysed through. `Defects` rows persist — resolved rows stay `fixed` for the record, and a defect that reappears gets a new `D-N` row rather than a reopened one.

The **suite gate (step 8) re-runs on every entry**, scoped to the impacted set (`sprint-lifecycle.md` "Impacted test set", subject to its safety valve) — never the full repo; incremental delta scoping (above) applies only to the analysis passes, not to which tests this gate runs. The **removal gate (step 6)** is unaffected: it still fires whenever a proposed removal (in or out of the current pass's scope) falls outside the sprint's overall change surface.

Bounded risk: a defect outside the impacted set's reach is not caught by this phase at all — the full, unconditional suite run at the end of `impl-review` (`sprint-lifecycle.md` "Impacted test set") is the backstop. No iteration cap on this phase: the loop ends on a green impacted run or on an escalated blocker.

## Artefacts produced
- `<sprint>/test-plan.md` (risk→check decisions, removals, added tests, suite run, defects, optional manual verification spec)
- Tests added, adjusted, and deleted in repo
- Updated `state.json` (phase=impl-test; `derived_handoff` at steps 2 and 10; `test_defects_pending` set when routing back to impl)
- Git commits per Conventional Commits
- decisions-log entry on green impacted run or defect routing

## Agents delegated to
- One live `asd-tester` (pre-strategy, strategy, prune/author, suite); after session loss re-dispatch from disk evidence
- No orchestration dispatch — state/log writes are inline.
- No reviewers — test quality is judged in impl-review by `asd-reviewer-testing`

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: impl-test | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <impl-review|impl>
```
`NEXT: impl-review` on a green impacted-set run; `NEXT: impl` when code defects route the sprint to impl test-fix mode.

## References
- `.asd/rules/sprint-lifecycle.md` (impl-test phase contract, impl⇄impl-test cycle, impacted test set)
- `.asd/rules/code-style.md` §17 (test rubric)
- `.asd/rules/checkpoints.md` (removal gate, precondition chain)
- `.asd/rules/artifact-layout.md` (test-plan ownership)
- `.asd/rules/git-strategy.md` (commits)
- `.asd/rules/language-policy.md`
- Templates: `t_test-plan.md`
