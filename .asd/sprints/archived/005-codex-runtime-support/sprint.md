---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 005-codex-runtime-support

## Goal
Establish reliable support for Codex as ASD's primary runtime when Codex is used with a ChatGPT account. Investigate the reproduced failure in which the PM delegate cannot start because its resolved pinned model is unsupported, audit the already committed `sol` to `gpt-5.6-sol` bootstrap fix rather than treating it as sufficient, and correct every confirmed Codex support gap across canonical definitions, generated provider views, model resolution, dispatch and tool mappings, all sprint phases, documentation, synchronization, and regression coverage while preserving Claude support.

## Acceptance
- AC-1: The audit reproduces or otherwise evidences the PM delegate startup failure, identifies its root cause, and verifies whether the committed `sol` to `gpt-5.6-sol` bootstrap change is correct and sufficient.
- AC-2: Every canonical ASD agent, skill, and phase workflow is audited for Codex-primary execution, and every confirmed incompatibility is fixed without introducing duplicate provider-specific workflow logic.
- AC-3: Codex model-family resolution selects explicit model identifiers supported for the ChatGPT-account runtime for every dispatched agent tier, including the PM, and rejects or clearly surfaces invalid mappings instead of failing opaquely at delegate startup.
- AC-4: Codex semantic tool and delegation mappings are consistent with the operations required by all ten sprint phases, and the audit records phase-by-phase evidence for scope, audit, design, design-review, design-promote, plan, impl, impl-test, impl-review, and pr behavior.
- AC-5: Generated Codex provider views are derived from canonical sources, contain the corrected runtime configuration, and pass the repository's synchronization check with no orphaned or stale generated output.
- AC-6: Executable regression coverage fails against the reproduced unsupported-model condition and passes with the final model-resolution, provider-generation, and dispatch behavior; the repository's applicable full test suite is green.
- AC-7: Claude configuration and generated provider views remain supported and unchanged except where a shared canonical correction is required, with regression evidence covering both providers.
- AC-8: README and every required framework mirror accurately document the verified Codex runtime support, model-family behavior, provider mappings, generated layout, and any user-visible compatibility or migration impact.

## Out of scope (optional)
- Adding unrelated ASD workflow features or changing external ChatGPT account entitlements and model availability.
- Hand-editing generated `.claude/`, `.codex/`, or `.agents/skills/` files instead of regenerating them from canonical sources.
