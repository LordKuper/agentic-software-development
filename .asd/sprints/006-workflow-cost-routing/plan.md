---
responsibility:
  owns: task breakdown, task status, sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, standing DoD
  delegates_to: sprint.md (acceptance criteria), reviews/ (review findings)
---

# Plan

## Overview
Implement accepted cost routing and gate policy in canonical ASD infrastructure, then regenerate both providers and validate migration/recovery. Batch rejected explicitly in decisions-log. No open stubs. Main orchestrator assumes PM work; creators still implement and independent reviewers still review. These changes qualify for the critical class under the new policy. Bootstrap uses installed Dev roles until generated variants are available; strong independent review is required before completion.

## Definition of Done
Standing DoD in sprint-lifecycle.md applies. Both provider views, README and ownership/permission contracts must agree. No closure/finalization/archive without explicit user approval. No price-saving claim beyond verified unit-price facts without measured billing evidence.

### Task 1: Transfer orchestration and introduce adaptive gates
Owner: asd-dev. AC-7, AC-14, AC-18..AC-23.
- [x] Replace PM dispatches with inline phase orchestration; preserve scope/plan/state/log/manual-step/git/release responsibilities and rollback behavior.
- [x] Centralize adaptive/strict policy and actor/revision/evidence recording; apply it to phase and standalone microgates.
- [x] Add mandatory closure approval before finalization/archive; keep technical DoD and confirmed merge blocking, including legacy archived-active recovery.
- [x] Update canonical rules/workflows/skills/templates affected by PM and gates; remove canonical PM after all responsibilities are transferred.
Risk: loss of authority boundaries, recovery or an overlooked hardcoded user pause.

### Task 2: Generate fixed task-class agent specifications
Owner: asd-dev. AC-10..AC-12, AC-14, AC-17.
- [x] Extend existing sync discovery/rendering for declared mechanical/standard/critical variants sharing the canonical role body and permissions.
- [x] Add only used variant combinations and validate identifiers/model metadata; preserve sources without variants.
- [x] Define selection/escalation and durable routing evidence in one rule home; wire dispatches without modifying shared generated files at runtime.
- [x] Add idempotent consumer migration for PM removal and generated roster changes using existing ownership/orphan mechanisms.
Risk: weakened permissions, agent-name collision, inconsistent check/apply or destruction of consumer customizations.

### Task 3: Make external availability checks cheap and bounded
Owner: asd-dev. AC-3..AC-6.
- [x] Add minimal deterministic local preflight and sanitized negative-cache handling before wrapper dispatch/diff assembly.
- [x] Separate wrapper tier from explicit nested review model/effort, verifying supported CLI flags and actual read-only enforcement.
- [x] Preserve unknown model access until a real request and transparent iteration skips without latches; recover after expiry or relevant identity change.
Risk: stale availability, secret leakage, permissive nested tools or accidental paid probe loops.

### Task 4: Validate compact review coverage at generation time
Owner: asd-dev. AC-1, AC-2.
- [x] Enable scoped_fan_out in this project while retaining all required reviewer agents.
- [x] Supply complete ordered file/rule/section manifests and accept compact machine-readable status mappings with explicit exceptions/findings.
- [x] Add deterministic completeness/identity/predicate validation and wire both review phases and reviewer output specifications to it.
Risk: a missing checklist item passing via matching totals or invalid n/a evidence.

### Task 5: Reduce audit, context and repeated-agent work
Owner: asd-dev. AC-8, AC-9, AC-13, AC-15.
- [x] Normalize auto/always/off audit configuration with legacy aliases and a frozen boolean/reason; default to audit on unknown or risky scope.
- [x] Make Architect the single audit owner; dispatch BA only for evidenced material product/domain ambiguity; align the audit template.
- [x] Reuse one live Tester within each phase, with disk recovery after loss and fresh reviewer dispatches.
- [x] Narrow mandatory rule/reference reads by role and phase while preserving every common/custom invariant and stable cache-friendly ordering.
Risk: context loss, audit skip on incomplete scope, or unintended reviewer context reuse.

### Task 6: Integrate provider views and release documentation
Owner: asd-dev. AC-16, AC-17 and mirrors of Tasks 1..5.
- [x] Reconcile README, AGENTS, provider tier table, config schema/templates, managed paths and migration version with the completed implementation.
- [x] Regenerate explicit changed provider targets and owned orphans through sync; recompute manifest hashes using existing tooling.
- [x] Run applicable build/lint/hook/parsing checks and record actual results before handing to impl-test.
Risk: stale generated skills or update manifests that strand consumer projects.

## Dependencies
Task 2 depends on Task 1's role transfer contract. Tasks 3 and 4 may proceed independently with disjoint files; coordinate shared review workflows. Task 5 depends on the gate/routing contracts from Tasks 1 and 2. Task 6 follows all implementation tasks. Test selection/authoring belongs to impl-test after production changes; full suite follows approved review per workflow.
