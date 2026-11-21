---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD
  delegates_to: reviews/ (findings), implementation dispatch inputs (persistent requirements)
---

# Plan

## Overview

Implement the approved [scope](sprint.md) and [model selections](research.md#model-selection) against the [audit](audit.md).

The external review route belongs in `.asd/rules/external-review.md` under Enablement and Detection and negative cache. Claude Design selection and the lite retry belong in `.asd/rules/design-system.md` under Design System Authoring. Test scheduling and reuse stay in `.asd/rules/sprint-lifecycle.md` under Impacted test set and Plan file format. Tech references cover [Codex 0.169](../../../docs/architecture/tech-reference/codex-0.169.md), [Claude Code 2.1](../../../docs/architecture/tech-reference/claude-code-2.1.md), [RouterAI v1](../../../docs/architecture/tech-reference/routerai-v1.md), [Git](../../../docs/architecture/tech-reference/git-2.56.md) and [GitHub CLI](../../../docs/architecture/tech-reference/gh-2.90.md).

## Definition of Done

Standing DoD applies per [Plan file format](../../rules/sprint-lifecycle.md#plan-file-format).

Verify both provider views and consumer/self-hosting compatibility. Check the review route on a synthetic report with a material and a minor finding. Confirm the model timeout, provider selection, missing-config diagnostic, interrupted mockup retry and area-test re-entry. Record the outcome of the authenticated RouterAI smoke run when credentials are available.

### Task 1: Guard named commit paths
Material risk: change: public contract

- [x] AC-25. Update `.asd/runtime.js` `commit-check` and `.asd/rules/git-strategy.md` to reject any named tracked or new path with unstaged edits or no staged change. Count the old and new paths of a staged rename and stage the candidate paths before validation. Preserve the no-path form for already staged content.
- [x] Check callers in creator agents, cleanup, orchestrator commit rules and tests. Assign README wording to Task 13 and update affected existing tests in Task 14.

### Task 2: Apply model selections and quota routing
Material risk: change: broad-reasoning
Reachability: implementation writes the canonical model assignments and compatible fallback metadata; later dispatches and timing resolve the same emitted agent model from the release manifest.

- [x] AC-6. Apply the five selected Codex assignments to the canonical agent metadata and add `astra` to the release-manifest model families. Use `.asd/sync.js` rendering and `.asd/rules/providers.md` as the provider mapping. Keep the role instructions and supported effort validation.
- [x] AC-12. Place quota recovery in the shared dispatch protocol in `.asd/rules/agent-protocol.md` and the host mapping in `providers.md`. For host-confirmed quota errors, retry once with a different available model that can serve the same role. Preserve role instructions, read/write paths, provider policy and existing failure handling when no eligible alternate is available. Record original and actual model and quota reason in the decisions log and dispatch timing.
- [x] On Codex, resolve a compatible named role configuration with the alternate model. Use generated same-role variants where a named primary role needs a fallback that does not already exist. Use Astra/medium when a Sol developer, tester or reviewer needs a fallback. Give Luna-based roles Sol/medium and give the Astra advisor Sol/high. On Claude Code, use the host-supported override when verified: Haiku to Sonnet, Sonnet to Opus, Opus to Sonnet when adequate for the role, and Fable to Opus. Keep the fallback rules centralized and cover every delegation that consumes the shared dispatch protocol. Wrapped CLI quota failures retain the selected profile and existing external-review failure contract.
- [x] Incorporate the Codex wrapper/model distinction and opt-in profile exception in `providers.md`. Task 7 owns the external-review route and canonical wrapper behavior. The orchestrator regenerates the provider views after this wave.

### Task 3: Share the complete config contract
Material risk: change: public contract
Reachability: init writes explicit YAML values with template-defined keys; the sprint entry reads the same schema before any phase runs.

- [ ] AC-1–AC-2. Use `.asd/templates/t_config.yaml` as the single inventory. Add `project.claude_design` with enabled/disabled values and `review.codex_profile` with an explicit empty string for the default route. Make a read-only config check in `.asd/runtime.js` report every missing, duplicated or invalid setting by path and keep legitimate explicit empty strings.
- [ ] Update `.asd/skills/asd-init/SKILL.md` so fresh and diff modes write all fields. Carry forward valid effective values and expose proposed additions for confirmation. Keep sprint-mediated changes restricted to the approved pairs and verify the resulting config. Document the post-update path for incomplete installs in the update skill without changing consumer values during the release update.
- [ ] Check field and omission references in `t_config.yaml`, init, update, the project config and README. Task 4 completes this project's config and Task 5 enables the sprint entry gate.

### Task 4: Complete the framework project's config
Material risk: change: migration
Reachability: impl applies the explicit settings via asd-init before Task 5 activates the sprint entry check; subsequent entries read a complete project config.
Settings change: cleanup=enabled, upstream_issues=enabled, safety_valve=enabled, documents.design_system=disabled, project.claude_design=disabled, review.codex_profile=""

- [ ] AC-2. Apply only the declared pairs through sprint-mediated init. The four existing omissions retain their effective behavior. The project currently disables UX docs and uses the existing external CLI route. Confirm every schema field is explicit before proceeding.

### Task 5: Require complete config at sprint entry
Material risk: change: workflow gate
Reachability: init writes a complete project config; asd-sprint verifies it on each entry before starting or resuming any phase.

- [ ] AC-1. Call the shared check from `.asd/skills/asd-sprint/SKILL.md` on every invocation, including attempts to resume or finish a merged sprint. Report missing or malformed config and the exact remediation in the current host's init invocation form. A failed check leaves sprint state and Git refs untouched.

### Task 6: Select mockup authoring and retry publication
Material risk: change: workflow gate
Reachability: lite scope records the local mockup and deferred intent on a qualifying host failure; design-promote reads the marker and original source before copying mockups.

- [ ] AC-3, AC-15. Make `project.claude_design` drive the existing artifact and local HTML paths in `.asd/rules/design-system.md` and scope/design/design-promote workflows. Keep capability and UX-spec preconditions and the publication gate.
- [ ] In lite scope, retain the draft and record deferred publication when the canvas host is unreachable. The record identifies the local source and desired publication. Design-promote retries before copying or rewriting links, recognizes already completed publication by its recorded result and retains evidence if retry fails. Use existing draft and decision artifacts for re-entry.

### Task 7: Run named Codex external review profiles
Material risk: change: authentication
Reachability: init and each review phase resolve the same review route; the phase passes it to the wrapper, which invokes the selected subprocess and returns its findings.

- [ ] AC-4, AC-5, AC-7, AC-21. Extend the resolver/preflight in `.asd/runtime.js`, the init probes, the external-review agent and both review workflows. Under a Codex main harness, a selected profile runs a read-only on-demand Codex process. Keep its model and effort in that profile. Reject invalid profile identifiers; preserve conventional routes with an explicit empty selection. Fingerprint the same selected profile and non-secret local identity used for the command. Keep preflight bounded and local, and retain existing interruption, skip and retry outcomes.
- [ ] Update `.asd/rules/external-review.md`, external prompts as needed, and `.asd/templates/t_AGENTS.md` and `t_CLAUDE.md` wherever they describe reviewer selection. Require at least 600000 ms for the Claude Code Bash tool and foreground results without PID polling. Check canonical agent invocation instructions and external-review memory for obsolete polling instructions.
- [ ] Provide the local RouterAI profile example with `~anthropic/claude-opus-latest` at `medium` and environment-backed credentials. Task 13 owns its README presentation. Preserve material findings and verdict normalization in the wrapper used by both host routes.

### Task 8: Enforce review scope and persistence checks
Material risk: change: security
Reachability: review orchestration supplies file lists, prior snapshot roots and reviewer identity; runtime uses these before writing its manifests, patches or persisted reviews.

- [ ] AC-18. Enforce external impl-review consumer exclusions in `.asd/runtime.js` before producing both `files[]` and the diff, including carried-over and full-range inputs. Preserve self-hosting canonical paths and align skipped-review scope calculation with the same selector.
- [ ] AC-19. Normalize numeric coverage IDs and their references to strings before duplicate and identity checks. AC-20. Use one guard for previous iteration root paths. Reject already-nested `snapshot/` arguments and an empty diff for a nonempty requested changed-file list. Preserve the legitimate first-iteration no-diff case.
- [ ] AC-28. Apply the existing memory-token matcher before persisting reviewer-owned changed files. Bound the scan to additions made by that reviewer and the current dispatch. Keep other users' and reviewers' edits outside the gate, and prevent both output writes on a hit. Keep the existing reviewer repair flow.

### Task 9: Merge timing attributes
Material risk: change: public contract

- [ ] AC-17. Update `.asd/runtime.js` so timing combines repeated `--attrs` and comma- or semicolon-separated pairs. Preserve ordering and the last value when the same key repeats. Treat separators as pair boundaries, preserve unrelated flags and the existing warning contract for other repeated flags.

### Task 10: Tighten planning and review-fix briefs
Material risk: change: workflow gate
Reachability: plan records verified tech references and compile dependencies; impl uses them before the relevant Task or review-fix dispatch.

- [ ] AC-8, AC-11, AC-14, AC-16, AC-23 and AC-26. Update the dedicated phase workflows for audit, plan and impl and `.asd/templates/t_plan.md` where their authoring rules live. Add test searches before reporting audit gaps, compile-only caller scheduling, reference checks for deploy tools/registry tags and review-fix dependencies, alert-key behavior checks, and the critical mechanism's sibling sites in fix briefs.
- [ ] Preserve test-only ownership and plan wave constraints when a contract change needs compile-only test adaptations. Verify registry references through the selected registry's canonical interface when a Task actually deploys an image. Record missing reference repairs before dispatching the related fix.

### Task 11: Preserve test-plan revisions and route close refusals
Material risk: change: public contract
Reachability: the review-fix tester records the verified committed tree, and impl-test reads it for reuse or routes the close validator's evidence to the tester responsible for repair.

- [ ] AC-9, AC-10, AC-13 and AC-27. Update `.asd/agents/asd-tester.md`, `.asd/workflows/asd-phase-impl-test.md`, `.asd/templates/t_test-plan.md` and the close-related section of `.asd/runtime.js`. Require committed revision evidence for reuse, declare the rule for introducing new required columns, and use escaped pipes consistently across live and rotated records.
- [ ] Route runtime validation refusals from both close sites using the offending file and cause. Give the repair tester access only to the named plan records. Clear structural and Suite run refusals before retrying, preserving atomicity and the green/run evidence.

### Task 12: Scope area runs and prose-only review fixes
Material risk: change: broad-reasoning
Reachability: first impl-test writes per-area progress; resumed impl-test reads it before choosing the next area, and impl-review reads the consolidated suite evidence.

- [ ] AC-22, AC-29 and AC-30. Update impl-test and its tester instructions for an area-by-area first entry only when large scope gives independent areas. Keep one writer per plan at a time and retain completed area evidence across a stalled dispatch. Preserve cross-area and terminal suite coverage. Make the shared-infrastructure widening test depend on actual affected paths, keeping framework-wide changes covered.
- [ ] Implement the prose-only review-fix route with an explicit content-contract search. When an edit has no parsed content or executable effect, the orchestrator runs applicable named contract areas, records `none` and closes the entry. Uncertain cases take the regular tester route.
- [ ] Own the consolidated `.asd/rules/sprint-lifecycle.md` changes for this sprint, including timing attrs, quota, plan and test contracts. Use the existing named test runner and append area results without a required column in pre-existing records.

### Task 13: Check release hashes and reconcile mirrors
Material risk: change: public contract
Reachability: sync apply writes the release hash ledgers for canonical inputs; check reads and compares them without a write, and PR verification consumes the result.

- [ ] AC-24. Reuse the two ledger computations in `.asd/sync.js`, report stale entries through the check result, and keep apply's invalid-target exit and path evidence. Treat absent pre-ledger fields according to the supported old release shape. Verify fresh and stale cases and effect-free checks. Activate the stronger check after the earlier waves that edit shared framework canon.
- [ ] Update README for AC-1–AC-6, AC-8–AC-30 wherever corresponding contracts already appear. Cross-check model roster, schema, dispatcher settings, mockup selection, external review commands and the listed runtimes. Locate and update read-only rules or other mirrors in prior owning Tasks where a changed contract is still stated.

### Task 14: Adapt impacted verification contracts
Material risk: change: public contract
Test-only: tests/**

- [ ] Adapt only the existing tests whose assertions change under AC-1–AC-30, including repeated timing flags, approved model rendering, generated roles, workflow/README mirrors, and stricter named commit checks. Add focused coverage for missing keys, cross-provider routing, external scope and finding preservation, snapshot refusal, memory checks, and interrupted or failed test-area records where the existing tests cannot detect the regression.
- [ ] Use a local fixture for the profile route and keep any live provider request outside the test suite.

Orchestrator action after each wave touching canonical render inputs: run scoped provider sync and commit the generated views and ledgers with their canonical source evidence. For the stronger hash check, refresh release hashes before final build verification when changed canonical content causes the expected stale report.

Orchestrator action during implementation verification: record the external wrapper's synthetic-report smoke and a failing named-suite smoke. Run a synthetic RouterAI review through the documented local profile when credentials are available.

## Risks

- The quota fallback must use a genuinely different available model. Keep the retry bounded and the role's permission set unchanged.
- The framework branch must have a complete config before it enforces completeness. The example external profile stays local, so this repo can continue to use its current route.
- Do not consider area progress or prose fast paths green without relevant validation evidence. Full-suite verification remains the final integration check.

## Dependencies

| Wave | Tasks |
| --- | --- |
| 1 | Task 1 |
| 2 | Task 2 |
| 3 | Task 3 |
| 4 | Task 4 |
| 5 | Task 5, Task 6 |
| 6 | Task 7 |
| 7 | Task 8 |
| 8 | Task 9, Task 10 |
| 9 | Task 11 |
| 10 | Task 12 |
| 11 | Task 13 |
| 12 | Task 14 |

- Tasks 5–7 depend on the new template keys and validated framework config in Tasks 3–4. Task 8 shares the route defined by Task 7. Task 12 builds on test-plan preparation from Task 11. Task 13 reconciles the combined changes and Task 14 follows the production tasks.

## Decision coverage

| Decision | Covered by |
| --- | --- |
| Inventory model use and record the agreed Sol/xhigh, Sol/medium, Luna/medium, Astra/medium and Luna/high Codex assignments | AC-6, Task 2 |
| Select a named review profile with RouterAI Opus Latest at medium as the example | AC-4–AC-5, Task 7 |
| Require explicit settings on every sprint invocation and complete the config through init | AC-1–AC-2, Tasks 3–5 |
| Make Claude Design an explicit project choice | AC-3, Task 6 |
