---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 020-multi-workflow-lite

## Goal
Support several sprint workflows. A workflow defines the sprint lifecycle: its phases, their order and the transitions between them. The current lifecycle stays as the `standard` workflow, with its behaviour unchanged. A new lightweight `lite` workflow is added. It does not write documentation up front: the persistent docs enabled in settings are written or updated only after the implementation is accepted, and they are not reviewed. It also runs a reduced impl-review.

## Acceptance
- AC-1: Each workflow is declared in its own declarative definition file under `.asd/`. The file holds the workflow's ordered phases, its transitions (the `impl ⇄ impl-test → impl-review` cycle and its routing included) and its per-phase differences. Rule docs, `.asd/runtime.js`, the session-start hook and `tests/run.js` take the phase chain from these files. No hard-coded `PHASE_CHAIN` remains as a second source.
- AC-2: The `standard` definition reproduces today's lifecycle exactly: the same eleven phases in the same order, with the same routing, no-op/collapse rules, gates and review roster. A sprint that runs on `standard` behaves as it does today.
- AC-3: The `lite` chain is `scope → audit → plan → impl ⇄ impl-test → impl-review → design-promote → retro → pr`. It has no `design` or `design-review` phase and produces no design drafts. `plan` works from `sprint.md` plus `audit.md` (when audit ran) and needs no promoted docs.
- AC-4: In `lite`, impl-review dispatches exactly two reviewers. The first is one internal reviewer. In a single pass it always applies the Correctness and Efficiency rubrics (AC-N conformance, bugs, security, performance, simplicity) and gives an overall quality assessment of every change. When the scope contains a changed documentation file, it also applies the Documentation rubric to it. The second is External Review, unchanged (when enabled). Waves, iteration counters, severity floors, latches, the terminal full suite and the fix routing work as they do in `standard`.
- AC-5: In `lite`, `design-promote` runs after impl-review DoD. Each persistent doc that the sprint's frozen `documents.*` enables is written or updated by its domain creator from the accepted implementation. There is no draft and no design review. When no document is enabled, the phase is a no-op.
- AC-6: When a new sprint starts, the user is always asked explicitly which workflow to use (`standard` or `lite`) through a request user decision. The config holds no default. The choice is frozen into `state.json` and never changes mid-sprint. Resume, `NEXT:` routing, the precondition chain, the rollback-reset table and the resume menu's re-run options all follow the frozen workflow. A `state.json` without the field reads as `standard`, so a sprint already in flight is unaffected.
- AC-7: The cross-file mirrors are kept consistent:
  - README (workflows, per-workflow phase list, reviewer roster, folder map), `core.md` glossary, `checkpoints.md` precondition chain and `sprint-lifecycle.md`;
  - `.asd/release-manifest.json` entries for new canonical files, plus the synced provider views;
  - the `asd_version` bump and `CHANGELOG.md`.

  `node tests/run.js` is green, and its phase-chain consistency check covers both workflows.
- AC-8 (retro `016-remove-terra-family#P-1`): A low-severity impl-review finding that lies only in test files or `test-plan.md` is fixed in place by the impl-review `asd-tester` dispatch. It does not route through a full `impl` review-fix → `impl-test` → `impl-review` cycle.
- AC-9 (retro `017-review-waves#P-3`): The orchestrator persists each reviewer's returned text with one `.asd/runtime.js` command, which writes the verdict token, the findings and the ledger. The orchestrator never re-authors a review file by hand.

## Out of scope (optional)
- Workflows authored by consumers, or any workflow other than `standard` and `lite`.
- A config default for the workflow. It is chosen per sprint at start only.
- Switching workflow in the middle of a sprint.
- This sprint itself runs on the current (`standard`) lifecycle.
