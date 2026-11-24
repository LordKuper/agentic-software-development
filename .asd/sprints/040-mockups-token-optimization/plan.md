---
responsibility:
  owns: task breakdown and verification
  delegates_to: sprint.md (criteria), audit.md (evidence)
---

# Plan

## Overview

Deliver the mockup and post-update config contracts, then apply accepted context reductions with consumers and validators kept in sync. The audit records the frozen baseline and all advisor dispositions.

## Definition of Done

Standing DoD applies (`sprint-lifecycle.md` "Plan file format"). Publish matched Codex before/after phase usage and report byte attribution separately.

### Task 1: Independent mockup setting and migration
Material risk: change: migration
Material risk: change: broad-reasoning
Reachability: scope writes effective mockup format in state.json after refinement; design, design-review and design-promote read it at their entry, with legacy state fallback.

AC-1. Own config and state templates, migration, mockup rules and lifecycle consumers in wave 1.

- [x] Add the `none` mode to `t_config.yaml`. Add the release migration and preserve explicit format or legacy boolean interpretation together with the old effective UX flag. Use `none` for projects whose old UX flag suppressed mockups. Preserve unrelated keys and handle idempotent retry.
- [x] Freeze the effective mockup format for a UI sprint. Update `t_state.json`, lifecycle, scope, audit, design, design-review, design-promote and the sprint entry skill so Standard handles mockup-only sprints and Lite promotes existing mockups independently. Preserve archived and in-flight legacy state.
- [x] Update `design-system.md`, `t_ux-spec.html`, `t_html-shell.html`, the mockup settings in `asd-init`, and the README contract. Keep UX references as links, provider verification and recovery, applicable review coverage and existing HTML consumers.

### Task 2: Config check after update and early skill cap
Material risk: change: broad-reasoning
Reachability: asd-update installs the schema and runs migrations; its completion step reads missing settings against that installed schema and offers accepted entries through asd-init.

AC-2, AC-6, AC-7. Own the update/entry skills and runtime cap after Task 1.

- [x] Move the completeness check and offer to the real `asd-update` completion path. Reuse `asd-init` resolution, preserve its ownership, report invalid/duplicate/missing paths, and keep dry-run/version lookup read-only. Cover normal and sprint-mediated update, partial outcomes, safe user decline and failure diagnostics.
- [x] Remove the sprint entry check, condense redundant NEXT prose without changing routing, and update the README. Shorten the accepted init/update duplication without changing config admission rules.
- [x] Reuse the standalone-skill file set and LF-normalized 62,351-byte bound for `context-check`. Expose one source for the bound and measurement for Task 6's contract adaptation.

### Task 3: Common rules and review protocol
Material risk: artifact: section and literal contract

AC-5, AC-7. Own `core.md`, `artifact-layout.md`, `review-policy.md`, `agent-protocol.md`, `checkpoints.md`, `git-strategy.md`, `code-style.md`, `language-policy.md`, `external-review.md`, `design-principles.md` and `ux-principles.md` under `.asd/rules/`.

- [x] Apply the individually approved path, shell, memory, ledger, review context, common rules and protocol changes. Preserve section lookups, tree grammar, JSON, signals, test-visible literals and privileges.
- [x] Apply the accepted concise changes for remaining named common rules. Verify current rule reachability before replacing local instructions with links.

### Task 4: Shorten discovery and role instructions
Material risk: artifact: provider discovery contract

AC-5, AC-7 and reviewer/Dev AC-1 handoff. Own canonical phase skills, named agent definitions and root AGENTS authoring sources.

- [x] Shorten all 12 phase descriptions while retaining discovery triggers, workflow links and tested role tokens.
- [x] Apply accepted reductions in Tester, External Review, Quality, Efficiency and Combined. Update Dev/Quality handoff to use the available standalone mockup rather than require a UX spec. Preserve role modes, tool grants, rubric headings, validation and exact verdicts.
- [x] Shorten repetitive author-owned AGENTS tail and its canonical managed-block template. Preserve required rule reads, repo-specific exceptions, command and mirror contracts and generated ownership. Let the orchestrator sync generated targets.

### Task 5: Phase context and workflow economy
Material risk: change: broad-reasoning
Reachability: phase context assembly resolves named rule sections at dispatch; every phase and role receives the narrowed sections it consumes before any work starts.

AC-5, AC-7. Own `sprint-lifecycle.md`, `providers.md`, `design-system.md` and the affected phase workflow bodies after Task 1.

- [x] Split recovery instructions by consumer, grant creator recovery to impl/impl-test and verdict recovery to design-review, impl-review and pr. Keep the phase table addressable, and narrow the plan-author checklist to plan while keeping task grammar reachable. Preserve exact recovery and parsed contract sections or coordinate with Task 6.
- [x] Split provider publication instructions into conditional grants without parent-section retransmission. Preserve actual authoring/recovery paths under AC-1 for both workflows.
- [x] Apply the named workflow reductions in audit.md, including both review phases, impl/test, plan, scope, design/promote, retro and PR. Keep the same sequence, output contracts, skip conditions, safety and compatibility. Compare context bundles before and after.

### Task 6: Verify behavior and context contracts
Material risk: none
Test-only: tests/**

AC-1, AC-2, AC-5, AC-6, AC-7. Adapt affected contract assertions after Tasks 1–5. Keep strict evidence coverage.

- [x] Exercise legacy migration matrix, idempotence and preservation of unrelated settings. Check four explicit modes, old frozen states and both workflows including mockup-only, none and non-UI paths.
- [x] Verify the check moved to actual update completion in both modes, without running on previews or sprint entry, and the early cap uses the same bound and file set as the existing contract. Cover exact cap, overflow and phase-shim exclusion.
- [x] Validate affected references, generated views, reviewer formats and role/phase grants. Keep or strengthen existing behavior checks.

Orchestrator-only verification after Task 6: rerun the matched Codex probes, report per-phase differences and distinguish estimated per-file bytes from measured consumption. The accepted local custom-rule changes must be applied within owner authority and the Combined memory index by its owner within its allowed write policy.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 3, Task 4 |
| 2 | Task 2, Task 5 |
| 3 | Task 6 |

- Tasks 2 and 5 consume Task 1's independent setting and compatibility rule. Task 5 also depends on the compact common protocol and reviewer rules from Tasks 3–4. Task 6 follows the contract changes.
- Sync the affected generated views after each wave before treating sync-check as final. Contract tests follow production changes as declared Test-only.

## Decision coverage

| Decision | Covered by |
|---|---|
| Preserve legacy effective behavior and select one independent mockup mode | AC-1 / Task 1 |
| Check completeness at the end of update | AC-2 / Task 2 |
| Codex only, baseline before changes, prioritize by recurring context | AC-3 / audit; AC-5 / matched verification |
| Accept Russian per-file advisor recommendations under standing authority | AC-7 / Tasks 2–6 |
| Enforce the existing aggregate standalone-skill limit early | AC-6 / Tasks 2 and 6 |
