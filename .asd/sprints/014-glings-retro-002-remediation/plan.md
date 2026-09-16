---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
- A task whose value depends on two phases agreeing also carries a `Reachability:` line, same placement; absent = no cross-phase dependency, never a fail-closed default (same section)
- A task declaring a project-settings change carries a `Settings change: <key>=<value>[, …]` line, same placement; plan acceptance approves exactly those pairs, and the task sits alone in its wave: wave 1, ahead of any contract-changing task, or a wave after the task adding its key to t_config.yaml (same section)
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave (same section)
-->

## Overview
Carries the still-open framework rows of the Glings 002 retrospective into canon: AC-1..AC-9 of `sprint.md`, with `audit.md` as the path:line map every Task works from. Choices fixed at plan (decisions-log 2026-09-16 plan entries): External Review batches its scope, carries unreviewed files forward, the change-surface cap is 100 files, and rotation follows the audit scheme. Estimated reviewable change surface: ~32 files (rules 6, workflows 7, agents 5, skill 1, templates 6, `runtime.js`, hook, `tests/run.js`, README, release manifest, CHANGELOG), under the cap of 100.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
AC-8 is met with no migration script: rotation reads absent segments as legacy, AC-6 is rule-only, plans without a surface line are grandfathered, and the new multi-`## Defects` failure is a CHANGELOG manual step (merge the sections into one table) written by `pr` open mode.

### Task 1: Recover a failed creator/tester dispatch from git evidence
Material risk: change: workflow gate
- [x] `git-strategy.md` "Commits": every commit a dispatched dev/tester makes carries one `ASD-Task: <id>` trailer (`Task N`, a review finding id, or `D-N`); one line, no restated rationale
- [x] `sprint-lifecycle.md` "State recovery": single home for failed-dispatch reconstruction (AC-2). Trigger: `impl` initial/review-fix/test-fix or `impl-test` dispatch returns no completion signal. Anchor: the HEAD sha the orchestrator logs in its routing line at dispatch. Steps: `git status --porcelain`, `git log --format='%h %s%n%(trailers:key=ASD-Task,valueonly)' <anchor>..HEAD -- . ':!.asd/sprints/**'`; landed ids are dropped from the re-dispatch; uncommitted leftovers are named in the re-dispatch payload for the agent to finish or revert, never swept by the orchestrator; one `reconstruction: landed <ids>; re-dispatched <ids>` decisions-log line
- [x] Routing log line in `asd-phase-impl.md` and `asd-phase-impl-test.md` gains `dispatch HEAD <sha>`; each workflow's no-signal branch points to the rule, no restatement
- [x] `asd-dev.md` / `asd-tester.md`: commit instruction names the trailer by pointer to `git-strategy.md`

### Task 2: Fail closed on multiple Defects sections, with line numbers
Material risk: change: public contract
- [x] `runtime.js` `defectStalemate`: find every heading matching `^## Defects\b` (exact and suffixed); more than one fails closed with `test-plan has <k> ## Defects sections at lines <l1>, <l2>, …`
- [x] Keep original line numbers through parsing; missing column, malformed row and malformed separator errors name the offending line (`line <n>: …`)
- [x] `t_test-plan.md` Defects comment: one table only, rows appended, never a second section

### Task 3: External Review partial-coverage outcome with batching
Material risk: change: workflow gate
- [x] `external-review.md` "Outcome contract": three outcomes. Narrow the availability skip to a non-ready preflight or active negative cache (decisions-log audit contradiction); a failure after invocation is an interrupted dispatch. Add `APPROVE (partial: <n>/<m> files; <cause>)`: never on CONCERNS/FAIL, satisfies only its iteration, never latches, logged to decisions-log and an `F-N` entry
- [x] `external-review.md`: batching (Complication Approval in decisions-log): scope above `SPLIT_THRESHOLD_FILES` is reviewed in sequential batches of that size inside one dispatch; a batch failing after the one retry stops the dispatch; ≥1 completed batch with no finding at or above floor → partial; findings in completed batches → normal verdict over those batches; no completed batch → interrupted dispatch
- [x] `external-review.md` "Iteration semantics": unreviewed `files[]` of a partial, skip or stopped iteration are recorded as an `Unreviewed files:` list in that iteration's `external.md` and unioned into the next iteration's manifest; "Stalemate detection" compares only verdict iterations, skipping partial/skip ones
- [x] `asd-external-review.md`: batch loop, n/m accounting, the three outcomes, narrowed ABORT/skip wording (lines 29, 81, 103, 105, 116 per audit); `t_review-report.md` gains `Reviewed files: <n>/<m>` and `Unreviewed files:`
- [x] `asd-phase-impl-review.md` steps 1a/1b, 7a, 8 and `asd-phase-design-review.md` steps 3a, 8a, 9: accept the partial form, write it verbatim to `verdicts`, add carried-forward files to the external manifest — pointers to `external-review.md`
- [x] `sprint-lifecycle.md` "APPROVE latch" carve-out and "State recovery" verdict values: fifth value (partial: satisfied, never latched); `review-policy.md` skip exclusivity (152) and DoD name both non-verdict forms; `asd-phase-pr.md` DoD accepts partial
- [x] `.asd/hooks/session-start.js`: display a partial verdict as satisfied (prefix check already holds; confirm and adjust label only if it misreports)

### Task 4: Standing n/a for Framework mode and Template adherence
Material risk: change: public contract
- [x] `runtime.js`: `NA_PREDICATES` gains `noSelfHosting: 'self_hosting not enabled'` and `noTemplated: 'no templated artefact in scope'`; `NA_TARGETS` maps them to documentation `Framework mode` and `Template adherence`
- [x] Templated-artefact classifier from its input: basename equals a `.asd/templates/**/t_<name>` stripped of `t_`, or path under `.asd/templates/`, `docs/`, `.asd/sprints/`, or `AGENTS.md`/`CLAUDE.md`; `emitManifestCommand` lists `.asd/templates/` and passes names in; `--self-hosting` boolean flag
- [x] `asd-phase-impl-review.md` step 1 and `asd-phase-design-review.md` step 3 pass `--self-hosting` when `config.self_hosting: enabled`
- [x] `review-policy.md` standing-predicate list quotes both new texts exactly

### Task 5: Change-surface cap at plan and impl-review entry
Material risk: change: workflow gate
Reachability: plan writes the approved override bound at its gate into `state.json.gate_decisions` (`gate: change-surface-cap-override`, `evidence: bound=<n>`); impl-review reads it at its entry check before step 1
- [x] `runtime.js`: `SURFACE_CAP_FILES = 100` with a doc comment (4 × `SPLIT_THRESHOLD_FILES`; ASD sprints 001-013 max 87, Glings 002 657); `surface-check --files <path> [--bound <n>]` returns `{files, cap, breach}`
- [x] `t_plan.md` Overview: required `Change surface: <n> files` line; `sprint-lifecycle.md` "Plan file format": declaration, breach blocks acceptance until the user splits into sequential sprints (hard scope gate; remainder to `sprint.md` Out of scope plus decisions-log) or approves `change-surface cap override` with a bound; a plan without the line is grandfathered
- [x] `checkpoints.md` hard list and Gate inventory: `change-surface cap override`, distinct from review-cap override
- [x] `asd-phase-plan.md` step 4: replace the advisory split estimate (line 40) with the declaration and `surface-check`; keep the split part-count note
- [x] `asd-phase-impl-review.md` entry: measure iteration 1's `git diff --name-only <base>...HEAD <pathspec>` via `surface-check` against the cap or recorded bound; breach escalates override-or-abort instead of reviewing

### Task 6: state.json holds machine state only
Material risk: artifact: rule wording in artifact-layout.md and checkpoints.md
- [x] `artifact-layout.md`: one statement — `state.json` carries only keys `t_state.json` defines; prose goes to `decisions-log.md`; `gate_decisions[].reason`/`evidence` are short refs
- [x] `checkpoints.md` "Gate policy" (5) and "Approval recording" (22): record short refs in `gate_decisions`, the prose in the decisions log

### Task 7: Rotate decisions-log.md and test-plan.md
Material risk: change: workflow gate
Reachability: impl-test writes `test-plan.entry-NN.md` at its entry start; impl-review's Testing reviewer and `asd-phase-pr.md` read the live file plus segments at their test-plan read
- [x] `artifact-layout.md` (single home): decisions-log renamed at phase entry to `decisions-log.NNN.md` (next ordinal, only when the live file holds an entry), live file recreated from `t_decisions-log.md`; test-plan narrative sections (Risk→check, Removed, Added) of the previous Entry moved at impl-test entry into `test-plan.entry-NN.md`, live keeps Entry log, Suite run and Defects; current-fact readers read the live file, cross-span readers glob segments in order; absent segments = legacy single file
- [x] `t_decisions-log.md`, `t_test-plan.md`: header notes point to the rotation rule
- [x] Rotation trigger: `asd-sprint` Step 3 / Step 2B before delegating a phase skill; `asd-phase-impl-test.md` entry and `asd-tester.md` for test-plan
- [x] Cross-span readers follow segments by pointer: `checkpoints.md` criterion cost, `review-policy.md` interrupted-dispatch rebuild (live file suffices within a phase; say so once), `sprint-lifecycle.md` 91/93/232/239/243/290, `asd-phase-retro.md`, `asd-phase-pr.md`, `asd-reviewer-testing.md`

### Task 8: Mirrors, generated views and release manifest
Material risk: artifact: README and release-manifest mirrors
- [ ] README.md: External Review outcomes, `defect-stalemate` and `surface-check` runtime commands (line 297), rotation in folder map (313), cap and hard gate list (171, 223-225, 423)
- [ ] `node .asd/sync.js --apply` on every generated view of changed agents/skills/hooks; `--check` clean
- [ ] `.asd/release-manifest.json` `canon_hashes`/`managed_paths` current for changed canon

## Risks
- Iteration-1 review scope ~32 files exceeds `SPLIT_THRESHOLD_FILES` (25): expect 2 parts per internal reviewer; External Review runs 2 batches.
- Task 3 and Task 7 edit many shared rule docs; each binding is a pointer to one home (Documentation economy), never a restatement.
- AC-4 residual: other documentation ids (e.g. `Persistent actuality`) may still fail union check (c) on a code-only split scope; out of scope.
- Batching multiplies External Review quota per iteration; bounded by the cap at 4 batches.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2, 3, 6 |
| 3 | 4 |
| 4 | 5 |
| 5 | 7 |
| 6 | 8 |

- Task 1 changes the commit contract every later dispatch uses, so it runs alone first.
- Waves 3-5 are sequential only because Tasks 4, 5 and 7 share `runtime.js`, the review workflows, `sprint-lifecycle.md` and `checkpoints.md` with each other or with wave 2.
- Task 8 depends on every other Task.

## Out of scope
- F-1, F-2, F-3, F-5/F-8 and consumer-scope rows (`sprint.md` Out of scope).
- A migration script (DoD addition above).
