---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 011-explicit-design-skip

## Goal

Add a project setting that explicitly skips the `design`, `design-review` and `design-promote` phases without loading their skills or workflows, and enable it for this repo.

Today the three phases are skipped only implicitly: when every `documents.*` design document is disabled, `asd-phase-design` is still dispatched, loads its workflow (~10.7 KB) and performs one collapsed no-op write. This repo has paid that cost in all ten sprints so far. The implicit document-driven skip stays — it covers the partial case where only some documents are disabled — and the new setting is an explicit, cheaper route for projects that never run the design block.

## Acceptance

- AC-1: A config field declares the explicit design-block skip. Absent or disabled means current behaviour, unchanged. It is declared with its values in `t_config.yaml` and offered by `/asd-init` (including diff mode).
- AC-2: The effective value is frozen into `state.json` at `scope`, like `documents.*` and `user_gates`. Phases read the frozen value, never live config; a `state.json` without the field means disabled.
- AC-3: With the frozen value enabled, the sprint advances from `audit` straight to `plan`. No `asd-phase-design`, `asd-phase-design-review` or `asd-phase-design-promote` skill or workflow is loaded or dispatched. One write sets `phase="design-promote"`, appends all three names to `skipped_phases` and appends one decisions-log line naming the setting as the reason. The precondition chain lets `plan` accept this skip.
- AC-4: The document-driven skip is unchanged: per-document skip and the all-disabled collapse behave exactly as today when the setting is disabled. When the setting is enabled while some `documents.*` design documents are enabled, the setting wins, and `scope` records one decisions-log line naming the enabled documents that will not be produced.
- AC-5: Resume and the session-start hook report the correct next phase for a sprint under the setting — `plan` after `audit`, never `design`.
- AC-6: This repo's `.asd/project/config.yaml` enables the setting, written through `/asd-init` diff mode, never a hand-edit.
- AC-7: Every mirror agrees — `sprint-lifecycle.md` "Optional documents" and no-op rules, `checkpoints.md` precondition chain, `asd-sprint`, README config schema — and `tests/run.js` covers the new routing and the frozen-field fallback. `node tests/run.js` green, `node .asd/sync.js --check` clean.

## Out of scope

- Skipping any other phase: `audit` already has `documents.audit`; `plan`, `impl`, `impl-test`, `impl-review`, `retro`, `pr` stay never-skippable.
- Removing or reshaping the document-driven skip.
- Retroactive change to sprint 011 itself: its state was frozen before the setting existed, so it still takes the implicit collapse.
