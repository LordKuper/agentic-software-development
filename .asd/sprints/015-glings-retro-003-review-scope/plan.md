---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

This sprint implements `sprint.md` AC-1..AC-13 on the canon described in `audit.md`, applying the user's answers to C-1..C-4. Choices the audit left open, settled in this plan:

- **Design-review Correctness gets every changed draft, not only UI drafts.** Its rubric gains one design-review entry for draft correctness: AC completeness against `sprint.md`, contract soundness and ADR decision soundness. This fills audit owner gap (a) without an empty dispatch and without a skip path.
- **Per-reviewer lists.** In impl-review, only Testing narrows: it gets the test files plus `test-plan.md` and its segments. Correctness, Efficiency and Documentation get the full scope list. In design-review, all three internal reviewers get the iteration's changed drafts (C-2: incremental everywhere). A reviewer's list defines its ledger rows and its finding locations; any other path stays readable as context.
- **Namespace/import-only edits get no compact row.** Only 100%-similarity renames qualify, because only they are machine-provable (audit AC-5).
- **Iteration patch files are committed** with the review files, one per manifest part. `-M` keeps R100 hunks header-only.
- **`c4` is skippable per sprint under AC-8. `audit` is not.** The skip is offered at the scope gate and at the audit exit, before the collapse test.
- **Version bump: 11.0.0.** No migration script is needed. `CHANGELOG.md` carries the no-migration note from `audit.md`.

Change surface: 25 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
Sprint-specific additions:
- `node .asd/sync.js --check` is clean.
- README.md is verified against every changed rule, agent, workflow and template.
- A grep for "clear" in the context-hygiene sense across canon and README returns no instruction to clear.

### Task 1: Dispatch ceiling and audit batching (AC-9, AC-11)
Material risk: change: workflow-gate dispatch contract
- [ ] `.asd/runtime.js`: add `DISPATCH_CEILING = 20` and `AUDIT_BATCH_THRESHOLD_FILES = 200` beside `SPLIT_THRESHOLD_FILES`/`SURFACE_CAP_FILES`, and export both
- [ ] `.asd/runtime.js`: add a pure wave-splitting helper (a list of dispatches → sequential waves of ≤ `DISPATCH_CEILING`), with a CLI entry if a workflow needs one
- [ ] `.asd/runtime.js`: `surfaceCheck` also returns the implied internal-review dispatch upper bound `dispatches` = internal reviewers × `ceil(bound / SPLIT_THRESHOLD_FILES)` + External Review
- [ ] `.asd/rules/sprint-lifecycle.md` "Orchestration and adaptive gates": add a single home for the ceiling rule. Concurrent dispatches in one phase step are at most `DISPATCH_CEILING`, and anything above it goes in sequential waves (review parts, impl task waves). Correlated interruption is judged per wave.
- [ ] `.asd/rules/sprint-lifecycle.md` "Plan file format" and `.asd/rules/checkpoints.md`: a change-surface cap-override request states the `dispatches` count it implies
- [ ] `.asd/workflows/asd-phase-impl.md` step 6 and `asd-phase-impl-review.md` step 7a: point to the ceiling rule. A task wave or part set above the ceiling runs in sub-waves.
- [ ] `.asd/workflows/asd-phase-audit.md` step 2: when `git ls-files` over the touched areas counts more than `AUDIT_BATCH_THRESHOLD_FILES`, the architect payload carries a batched-read plan (grep first, then targeted section reads)
- [ ] `.asd/agents/asd-architect.md`: raise `maxTurns` to 150 (trusted emission; the batched-read plan is the binding control)

### Task 2: Per-reviewer scope, compact rename rows, materialized diff in runtime (AC-2, AC-4, AC-5)
Material risk: change: coverage-ledger contract
Reachability: impl-review writes the per-reviewer manifest and `.diff` paths at step 6; the reviewer reads both from its payload at dispatch, and `validate-ledger` reads the same manifest at step 7
- [ ] `emit-manifest` builds each reviewer's file list from one selector keyed by phase and reviewer (the AC-3 table). Add the `isTest` classifier: path segment `test|tests|__tests__|spec|specs`, or a basename matching `*.test.*`, `*.spec.*`, `test_*`, `*_test.*` or `*Test(s).*`. In impl-review, Testing gets the test files plus `--test-plan <path...>`, appended explicitly. Everyone else gets the full list.
- [ ] Add a cross-reviewer invariant check: the union of the internal reviewers' lists equals the scope list, or emission fails
- [ ] `emit-manifest --base <sha> --head <sha>` (impl-review): run `git diff --raw -M100%` and grant `NA_PREDICATES.pureRename` on `n_a.files[<path>]` to every R100 path. No caller can supply this classification. `validate-ledger` stays unchanged.
- [ ] With `--base/--head`, write one patch per manifest or part (`<reviewer>[.part-N].diff`, `git diff -M <range> -- <that part's files>`) beside the manifest, and print its path
- [ ] Split union check (a) is keyed to that reviewer's list. New manifest fields stay optional to `validate-ledger`, so a manifest emitted before the upgrade still validates.
- [ ] Constants and predicates are cited by symbol wherever canon quotes them (citer sweep)

### Task 3: Context hygiene, free-form scope, cleanup prompt, scope-point document skip (AC-1, AC-7, AC-8, AC-10)
Material risk: change: orchestrator behaviour rule wording
- [ ] `.asd/rules/core.md` "Context hygiene": drop every clear instruction (rules 1, 2 and 7). At a phase boundary the orchestrator continues the chain itself, and context compacts automatically, host-driven, with no user involvement. Keep rule 3's preserve list as the content a compaction must keep. Reword rule 4 per C-4: write the gate answer to disk before any further work. Keep rules 5 and 6 and the "State recovery" path.
- [ ] `.asd/rules/core.md` "Request user decision": never used for free-form input
- [ ] `.asd/skills/asd-sprint/SKILL.md` step 2A.3 and its Operations list: collect scope as a plain chat message, and use the decision prompt only for confirm, start and abort
- [ ] `.asd/workflows/asd-phase-scope.md`:
  - step 1: raw scope arrives as a plain chat message.
  - step 2: before the scope gate, ask about cleanup and quality criteria (legacy removal, warning budget, doc consolidation), unless the raw scope already covers them.
  - step 3a: at the scope gate the user may skip an enabled optional document for this sprint (narrow-only, hard), frozen as `false` plus one decisions-log line. The rule itself lives in Task 4.

### Task 4: Per-sprint document skip rule and audit-exit point (AC-8)
Material risk: change: frozen-state gate semantics
Reachability: scope/audit write `state.json.documents.<doc>=false` at the skip gate; design/design-review/design-promote and the collapse test read the frozen value at phase entry
- [ ] `.asd/rules/sprint-lifecycle.md` "Optional documents": add a narrow-only exception to "never recomputed". The user may flip an enabled `prd`, `ux_spec`, `adr` or `c4` to `false` for this sprint only, at the scope gate or the audit exit, and only before any draft of that document exists. The decisions-log line says `skipped this sprint by user`, as distinct from config-disabled. `audit` is excluded.
- [ ] `.asd/rules/checkpoints.md`: add the gate to the hard list and to the inventory
- [ ] `.asd/workflows/asd-phase-audit.md` step 5: offer the skip before the collapse test. A skip that empties the design set collapses as usual.

### Task 5: Orchestrator route for BA/UX doc rename and delete (AC-6)
Material risk: change: promote-phase git ownership
- [ ] `.asd/workflows/asd-phase-design-promote.md` step 4: when a BA or UX creator proposes renaming or deleting one of its persistent docs, the user approves. Deletion goes through the existing hard deletion gate; a rename follows gate policy. The main orchestrator then runs `git mv`/`git rm` inline, and the creator updates content and inbound links. The BA/UX tool policy is unchanged.

### Task 6: Reviewer responsibility table and scope contract in canon (AC-2, AC-3, AC-4, AC-5, C-1..C-3)
Material risk: change: reviewer roster and payload contract
Reachability: review-policy's AC-3 table is the selector Task 2 implements; both review workflows and every reviewer agent read the same table
- [ ] `.asd/rules/review-policy.md`:
  - Add one responsibility table: reviewer × phase → what it judges and which files it receives. It covers Correctness, Efficiency, Testing, Documentation and External Review in design-review and impl-review. Testability in design-review is stated as unowned by design. C-1 split: Correctness owns the AC→code trace, Testing owns the AC→check coverage.
  - "Clean-context review iteration": the payload's single scope source is the reviewer's own manifest file list plus, in impl-review, its `.diff` path. Never tell a reviewer to run git. "Unlisted" means out of the ledger and not a finding location; any other path may still be read as context. The Change-surface exception is kept.
  - C-2: incremental on iteration 2+ in both phases.
  - C-3: "the wrapped CLI self-scopes".
  - "Coverage ledger": add the `pureRename` compact row class.
  - "Union property": per-reviewer lists plus the cross-reviewer union invariant.
- [ ] `.asd/workflows/asd-phase-impl-review.md` steps 1, 6 and 7a: per-reviewer `emit-manifest` with `--base/--head` (and `--test-plan` for Testing); the payload carries the manifest and `.diff` paths and no diff text
- [ ] `.asd/workflows/asd-phase-design-review.md` step 7: per-reviewer manifest over the iteration's changed drafts (iteration 1 = all in-scope drafts)
- [ ] `.asd/agents/asd-reviewer-{correctness,efficiency,testing,documentation}.md`:
  - description and "Does NOT handle" match the table.
  - Inputs read the manifest list plus the `.diff`, and no git (correctness L44, efficiency L41, testing L34, documentation L40).
  - Correctness gains a design-review "Draft correctness" rubric entry.
  - Testing's "Stub-resolution verification" moves to Documentation.
- [ ] `.asd/agents/asd-external-review.md` and `.asd/rules/external-review.md`: a table row reference only. Its `files[]` contract is unchanged.
- [ ] `.asd/templates/t_review.md`: when the text mentions scope, it matches the per-reviewer list

### Task 7: Release, README, sync (AC-12, AC-13)
Material risk: artifact: release manifest and README mirrors
- [ ] `README.md`:
  - reviewer roster and scope column (L213-219)
  - diff-scoped gating (L223)
  - runtime.js folder-map line (L297)
  - reviewer phase note (L402)
  - context and scope wording
  - the architect `maxTurns` mention, if any
- [ ] `CHANGELOG.md` 11.0.0 entry:
  - per-reviewer scope and patch files, `pureRename` rows
  - dispatch ceiling, per-sprint document skip, free-form scope, cleanup prompt, context hygiene
  - no-migration note: "finish or re-emit an in-flight review iteration after upgrade"
- [ ] `.asd/release-manifest.json` `asd_version` 11.0.0
- [ ] Run `node .asd/sync.js --apply` on every changed generated view, then `--check`, which must be clean. Recompute `canon_hashes`.

## Risks
- `isTest` is a heuristic. A missed test file has no Testing owner, and Correctness's full list is the backstop.
- Host auto-compaction can still fire mid-gate. Recording the gate answer first (C-4) keeps it recoverable.
- `maxTurns` is not enforced on either host. The batched-read plan is the real control.
- Many cross-file mirrors change in this sprint. Task 7 runs last, and `tests/run.js` plus `sync.js --check` gate it.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2, 3, 5 |
| 3 | 4, 6 |
| 4 | 7 |

- Task 1 changes the dispatch contract (the ceiling on impl waves), so it runs alone in wave 1.
- Task 2 edits `.asd/runtime.js` after Task 1 does. Task 6 documents Task 2's CLI.
- Task 4 follows Task 3 (both touch the AC-8 skip; the scope workflow is in Task 3, the rule in Task 4) and Task 1 (both touch `sprint-lifecycle.md` and `checkpoints.md`).
- Task 7 mirrors everything, so it runs last.
