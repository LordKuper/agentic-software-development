---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Close every confirmed Codex-primary runtime gap from the accepted audit through the shared canonical framework, regenerate only the affected provider views, and preserve Claude behavior. Bootstrap commit `1a2c008` is recorded as completed baseline work, not final proof; implementation, impl-test, and impl-review must validate it with the rest of the sprint.

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").

### Task 1: Harden Codex delegate model resolution

Acceptance: AC-1, AC-3, AC-5, AC-6, AC-7.

Material risk for impl-test: a syntactically plausible model or model/effort pair may render successfully but still fail when a ChatGPT-backed Codex delegate starts.

- [x] In bootstrap commit `1a2c008`, change the `sol` mapping from `gpt-5.6` to `gpt-5.6-sol` in `.asd/release-manifest.json` and `.asd/rules/providers.md`, regenerate the affected `.codex/agents/*.toml` files, and update the existing sync fixture.
- [x] Harden the shared resolver in `.asd/sync.js` so empty, malformed, unsupported Codex mappings and invalid model/effort combinations fail with an actionable agent, family, model, and effort diagnostic.
- [x] Validate every `.asd/agents/*.md` Codex model, effort, and sandbox block through that resolver, including PM and all other `sol` roles plus the `terra` Dev and Tester roles; change canonical values only where validation proves a mismatch.
- [x] Regenerate affected `.codex/agents/*.toml` and fixtures from canon, confirm `.claude/agents/*.md` remains unchanged unless a shared canonical correction requires otherwise, and validate the bootstrap correction through the normal implementation/review flow.

### Task 2: Render provider-correct skill invocations

Acceptance: AC-2, AC-4, AC-5, AC-7, AC-8.

Material risk for impl-test: a broad text replacement can corrupt non-command prose or leave a Codex handoff stranded on Claude-only `/asd-*` syntax.

- [x] Implement the smallest centralized provider-rendering rule in `.asd/sync.js` that emits Codex `$asd-*` invocations for user-visible command and handoff text while retaining Claude `/asd-*` output from the same `.asd/skills/*/SKILL.md` canon.
- [x] Regenerate the affected Codex `.agents/skills/*/SKILL.md` views and confirm corresponding `.claude/skills/*/SKILL.md` views retain valid Claude invocation syntax.
- [x] Keep phase dispatch names and implicit skill descriptions provider-neutral; do not fork workflow logic by provider.

### Task 3: Align review workflow contracts

Acceptance: AC-2, AC-4, AC-6, AC-7.

Material risk for impl-test: inconsistent reviewer routing or iteration baselines can omit correctness coverage or review the wrong commit range.

- [x] Replace the host-specific `via Bash` instruction in `.asd/workflows/asd-phase-impl-review.md` with the canonical run-command operation from `.asd/rules/providers.md`.
- [x] Correct `.asd/workflows/asd-phase-design-review.md` so Correctness is dispatched for every non-empty draft set, with only its UI-conformance section conditional; align the workflow with `.asd/skills/asd-phase-design-review/SKILL.md`, `.asd/rules/review-policy.md`, and the reviewer contract without duplicating their SSoT.
- [x] Correct `.asd/templates/external-review/t_prompt-external-impl.md` so iteration 2+ uses the previous iteration HEAD recorded in `state.json`, matching `.asd/rules/external-review.md`, `.asd/agents/asd-external-review.md`, and the phase workflow.
- [x] Regenerate only provider views affected by any canonical agent or skill edit and preserve read-only reviewer constraints for both providers.

### Task 4: Recover archived-but-active sprints

Acceptance: AC-2, AC-4, AC-5, AC-6, AC-7.

Material risk for impl-test: scanning archived state can falsely revive completed sprints or choose ambiguously when repository state is inconsistent.

- [x] Update canonical `.asd/hooks/session-start.js` to detect the single archived sprint whose `state.json.phase` is not `done`, while continuing to ignore completed archived sprints and fail silently on malformed entries.
- [x] Preserve current active-folder precedence and the one-active-sprint invariant when normal and archived candidates conflict.
- [x] Regenerate `.claude/hooks/session-start.js` and `.codex/hooks/session-start.js` from canon and keep provider-specific command hints correct.

### Task 5: Make Codex-primary gates and External Review observable

Acceptance: AC-2, AC-4, AC-6, AC-8.

Material risk for impl-test: a missing Claude CLI or broken decision operation can silently reduce review coverage or strand a sprint at a hard gate.

- [x] Reconcile `.asd/skills/asd-init/SKILL.md`, `.asd/templates/t_config.yaml`, `.asd/rules/providers.md`, `.asd/rules/external-review.md`, and `.asd/agents/asd-external-review.md` so a Codex-primary run probes or honors the configured Claude CLI command and surfaces an explicit availability-skip reason when unavailable.
- [x] Verify the Codex semantic mappings used by all ten `.asd/workflows/asd-phase-*.md` files, correcting only confirmed gaps in delegation, run-command, file, wait, and user-decision operations.
- [x] Ensure the mapped Codex decision path can represent write-then-review `accept` gates for scope and plan, the audit approval gate, other discrete hard gates, and state-based resume without embedding host-tool names in canonical workflows.
- [x] Regenerate affected agent and skill views from canon, preserving the symmetric Codex-under-Claude External Review path.

### Task 6: Synchronize documentation and provider views

Acceptance: AC-2, AC-4, AC-5, AC-7, AC-8.

Material risk for impl-test: documentation or generated-view drift can conceal a correct canonical fix behind stale consumer-facing instructions or runtime files.

- [x] Remove the unavailable `plans/multi-provider-support.md` reference from `.asd/rules/providers.md` and keep all durable provider behavior in existing canonical rule homes.
- [x] Update `README.md` with verified ChatGPT-account Codex model compatibility, delegate-startup diagnostics and recovery, provider-correct skill invocations, External Review prerequisites, session recovery, semantic mappings, and generated layout only where final behavior changed.
- [x] Update root `AGENTS.md` and `.asd/templates/t_AGENTS.md` only for framework/consumer guidance that their existing responsibility requires; keep `CLAUDE.md` and generated ownership boundaries intact.
- [x] Review all `.asd/agents/*.md`, `.asd/skills/*/SKILL.md`, and `.asd/workflows/*.md` against the accepted phase-by-phase audit, applying only confirmed compatibility corrections and retaining one shared canonical workflow.
- [x] Regenerate every affected `.claude/`, `.codex/`, and `.agents/skills/` mirror through `.asd/sync.js`, leaving no stale or orphaned generated output for the final synchronization check.

## Dependencies

- Tasks 1 through 5 may proceed independently where their files do not overlap.
- Task 6 depends on Tasks 1 through 5 so documentation and generated views describe final behavior.

## Out of scope

- New workflow features, provider-specific workflow forks, external account entitlement changes, and hand edits to generated provider views.
