---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Eleven tasks covering AC-1..AC-3 and AC-5..AC-14 of [sprint.md](./sprint.md). AC-4 carries no
task — it was closed at audit as already satisfied at HEAD (decisions-log, 2026-09-07).

Grouping follows the audit's risk mitigations rather than the AC numbering: AC-1 and AC-6 share
one file and one insertion point, so they are one task; AC-12's cross-file mirrors are a single
closing sweep rather than a fragment inside each task, because only the last writer can see the
final state.

Every task edits framework source in this self-hosting repo. `.asd/project/custom-coding-rules.md`
(Task 6) is the one target outside the `sprint-lifecycle.md` "Self-hosting" write allowlist and
outside the review surface; the one-off authorization is recorded in the decisions log and the
edit is verified by grep in Task 11.

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").

Sprint-specific additions: AC-13 is discharged in `impl-test`, not here — the new machine-checkable
behaviour is AC-1's manifest-partition union property, AC-6's re-dispatch record, AC-10's routing
input in both accepted shapes, and AC-11's state field with its absent-key fallback. The AC-4
unmatched-target error needs no new test (`tests/run.js` §11 asserts it twice already); append any
new section as `§19` without renumbering the existing collisions. AC-14 requires
`node .asd/sync.js --apply <file...>` after any render-source edit, with no generated file
hand-edited.

### Task 1: Split-dispatch contract and interrupted-dispatch outcome in review-policy.md
- [x] Add the split-dispatch contract to `.asd/rules/review-policy.md`: the objective trigger for an oversized read-only dispatch, how the reviewer's rubric partitions, the half-verdict shape, and how halves merge into the single `verdicts["iter-NN"]` string (AC-1)
- [x] State the split as two fresh dispatches over disjoint manifest partitions, each partition a complete digest-bearing manifest over its own subset — never a resume, so "No dispatched reviewer is ever reused or resumed" stands verbatim
- [x] State the union property: the two partitions' row sets must union to exactly the unpartitioned manifest's row set before verdicts merge
- [x] Define how two review files coexist under `reviews/<phase>/iter-NN/<reviewer>.md`, which is one path per reviewer today
- [x] Add the interrupted-dispatch outcome at the same insertion point (AC-6): the reviewer is re-dispatched fresh within the same iteration, reusing the invalid-coverage-ledger shape; the interrupted attempt is recorded so the loss is visible
- [x] State explicitly that an internal reviewer is never recorded as skipped and never satisfies DoD without a completed verdict; External Review's `APPROVE (skipped: ...)` stays exclusive to an unavailable provider
- [x] Verify `.asd/runtime.js` `validateCoverageLedger` / `rowsById` accept each partition as-is; if they do not, record what the workflow must pass instead — the contract must be implementable without loosening the ledger gate
- [x] Covers AC-1, AC-6. Material risk: this is a review-gate contract; a wrong statement here weakens the gate for every future sprint

### Task 2: Implement the split and re-dispatch contract in both review workflows
- [x] Implement the Task 1 contract in `.asd/workflows/asd-phase-design-review.md` steps 7-9 (dispatch, ledger gate, verdict record)
- [x] Implement it in `.asd/workflows/asd-phase-impl-review.md` steps 6-8
- [x] Record the interrupted-attempt trace in the same place each workflow records a verdict, without introducing a new state field
- [x] Keep both workflows' wording identical where the contract is identical; link to `review-policy.md` rather than restating the contract
- [x] Covers AC-1, AC-6. Material risk: workflow gate behaviour. Depends on Task 1

### Task 3: Check the external-review negative cache before manifest assembly
- [x] In `.asd/workflows/asd-phase-impl-review.md`, move the External Review scope-manifest build out of step 1 to a step after 1a's preflight (AC-8)
- [x] Update step 6's payload reference ("the step-1 scope manifest") to follow the manifest to its new step
- [x] Leave the internal-reviewer scope file list in step 1 — it is unrelated to external availability
- [x] Confirm `.asd/rules/external-review.md` "Detection and negative cache" already states the required order and needs no edit; state in one line if it does
- [x] Covers AC-8. No material risk: removes a contradiction between the workflow and the rule it implements; `asd-phase-design-review.md` already has the correct order

### Task 4: Artifact writes use the file-write operation, never a shell heredoc
- [x] Add the statement to `.asd/rules/providers.md` near the "Semantic operations -> host convention" `write a file` and `run a command` rows (AC-2)
- [x] Scope the rule to writing an artifact to disk, and name `external-review.md`'s stdin-pipe invocation as out of scope in the same sentence — it never touches the filesystem and must not be caught
- [x] Cite `runtime.js` `buildInvocation` (`shell: false`, JSON via stdin) as the existing precedent rather than restating its behaviour
- [x] Covers AC-2. No material risk: additive statement over an existing table

### Task 5: Agent memory location and sprint-folder contents in artifact-layout.md
- [x] State in `.asd/rules/artifact-layout.md` that agent memory lives at the provider-view root and never inside a sprint tree (AC-3)
- [x] State that a sprint folder holds only the artifacts the path map names
- [x] Add the `.claude/agent-memory/` carve-out to the read-only-generated-view rule, phrased once here; link to it from where the read-only rule is stated rather than restating it in `asd-dev.md` or `asd-phase-impl.md`
- [x] Add `.codex/` and `.agents/skills/` to the paths tree, which lists neither today, so "provider-view root" points at a complete tree
- [x] Add `.claude/agent-memory/**` to the `sprint-lifecycle.md` "Self-hosting" dev write allowlist, which omits it while the directory is legitimately written and tracked
- [x] Covers AC-3. Material risk: three canonical files state `.claude/` is read-only always; an unreconciled carve-out creates a rule conflict

### Task 6: Correct the sync-step argument wording at every real occurrence
- [x] Fix the wording at `AGENTS.md:74`, `.asd/agents/asd-dev.md:66`, `.asd/workflows/asd-phase-impl.md:49`, `README.md:38/106/439`, `.asd/skills/asd-update/SKILL.md:37` (AC-5)
- [x] Fix `.asd/project/custom-coding-rules.md:14` under the one-off authorization recorded in the decisions log
- [x] Do not touch `.asd/templates/t_AGENTS.md` — it contains no sync wording; confirm by grep
- [x] Run `node .asd/sync.js --apply` for the `asd-dev` render source and confirm the six generated agent views regenerate (AC-14)
- [x] Covers AC-5, AC-14. No material risk to the change: a documentation-wording correction whose target behaviour is already verified

### Task 7: Bind the over-engineering and SSoT checklists at authoring time
- [x] Add a link-plus-applicability statement to `.asd/rules/code-style.md` — the `review-policy.md` over-engineering and structure/cohesion checklists bind at authoring time, mirroring `design-principles.md` §10's wording (AC-7)
- [x] Name them in `.asd/workflows/asd-phase-impl.md` step 6's dev instruction block, by link
- [x] Add the rule doc carrying the proactive-application statement to `asd-dev`'s `providers.md` "Role-scoped context" row, which does not load it today
- [x] Copy zero checklist items — the body stays in `review-policy.md`, its single home
- [x] Covers AC-7. Material risk: this is the SSoT trap the sprint exists to fix; a copied checklist is an automatic Documentation-reviewer FAIL

### Task 8: The orchestrator commits its own bookkeeping at phase exit
- [x] State in `.asd/rules/git-strategy.md` "Commit before review" that the main orchestrator commits its own bookkeeping — `state.json`, `decisions-log.md`, review files, `friction-log.md` — at phase exit (AC-9)
- [x] State the matching prohibition: a dispatched agent never commits orchestrator-owned files it did not author
- [x] Reference `sprint-lifecycle.md`'s "Impl-test commits its own output" as the existing per-phase precedent rather than duplicating it
- [x] Covers AC-9. No material risk: states what the workflow already does, removing the ambiguity agents resolved defensively

### Task 9: Distinguish risk-to-the-change from risk-to-the-artifact in routing
- [x] Add a per-task material-risk declaration to `.asd/templates/t_plan.md`, which has no such field today — only a free-prose `## Risks (optional)` section (AC-10)
- [x] Document the field and the two risk kinds in `.asd/rules/sprint-lifecycle.md` "Plan file format"
- [x] Extend `.asd/runtime.js` `routeTask` to read the distinction, accepting both shapes: a bare string keeps today's any-entry-forces-critical semantics, and only an explicitly typed risk-to-artifact entry may route lower
- [x] Keep `priorTier`'s no-downgrade clamp intact and remove no existing risk class from `providers.md`'s critical list
- [x] Move `providers.md` "Task-class variants and routing" prose with the `routeTask` change
- [x] Add a `.asd/migrations/<version>.js` only if a persisted `state.json.task_routing` shape changes; state in one line if none is needed
- [x] Covers AC-10. Material risk: `routeTask` fails closed on an unrecognised input, so a stricter schema blocks every dispatch in a consumer still emitting the old shape; a looser `hasRisk` silently downgrades security and contract work

### Task 10: A phase states the artifacts it hands to the next
- [x] Add the derived-handoff field to `.asd/templates/t_state.json` (AC-11)
- [x] Document its writer, its consumers and its absent-key fallback in `.asd/rules/sprint-lifecycle.md` "State recovery", copying the `iteration_heads` paragraph shape verbatim
- [x] Make the field purely an optimisation — re-derivable, never a gate input — so a consumer mid-sprint without it degrades to today's behaviour
- [x] Have `asd-phase-impl-review.md` step 1's scope file list and `asd-phase-impl-test.md` step 3's re-entry delta read the field when present and write it on exit
- [x] Confirm `.asd/hooks/session-start.js` still exits 0 on a `state.json` lacking the field
- [x] Covers AC-11. Material risk: state-schema change against sprints in flight in consumer projects

### Task 11: Cross-file consistency sweep and out-of-surface verification
- [x] Add the `agent-memory/` line to `README.md`'s `.claude/` folder-map block, required by Task 5 (AC-12)
- [x] Check `core.md` "See also" — a no-op unless a task added a rule doc; if one did, mirror it there, in `t_AGENTS.md`'s rule-doc list, in `README.md` and in `managed_paths`
- [x] Re-check every README mirror named in `AGENTS.md` "Cross-file consistency" against what this sprint actually changed: phase list, agent roster and model tiers, config schema, folder map, command list
- [x] Run `node .asd/sync.js --apply <file...>` for every edited render source and confirm `canon_hashes` is current
- [x] Grep-verify Task 6's `.asd/project/custom-coding-rules.md` edit, which the review surface excludes
- [x] Covers AC-12, AC-14. No material risk to the change: verification only. Depends on every other task

## Risks

- Task 1 and Task 7 are the two places where this sprint can reproduce the defect it fixes: Task 1 by weakening the review gate it documents, Task 7 by duplicating a checklist that already has one home. Both are called out in their own task bodies.
- Task 9 and Task 10 are the only two changes a consumer project can observe as a break: a routing input shape and a state schema. `backward_compat: migration` is in force, so each needs either an accepted-both-shapes reading or a migration, and `max(migration version) <= asd_version` is a blocking check at `pr`.
- `tests/run.js` has pre-existing section-number collisions (`// 7.` and `// 15.` each appear twice). Left alone; new sections append as `§19`.

## Dependencies

- Task 2 depends on Task 1
- Task 11 depends on every other task
- Task 3 and Task 2 both edit `asd-phase-impl-review.md`; sequence them rather than running them concurrently

## Out of scope

- AC-4 code change: closed as already satisfied at HEAD; `sync.js`'s deliberate `orphan-unmarked` ok-result stays as contracted in `providers.md` "Orphan detection"
- `.asd/templates/t_AGENTS.md`: named by AC-5 but contains no sync wording
- Widening the self-hosting write allowlist to `.asd/project/**`: the Task 6 edit is authorized as a one-off instead
- Renumbering `tests/run.js` sections
