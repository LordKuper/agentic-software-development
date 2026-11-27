---
responsibility:
  owns: brownfield findings for sprint scope
  excludes: requirements, decisions, plan, code
  delegates_to: plan.md
---

# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/runtime.js`, `.asd/sync.js`, `.asd/agents/`, `.asd/rules/`, `.asd/workflows/`, `.asd/templates/`, `.asd/release-manifest.json`: external review routing, researcher role, user decisions, timing and recovery.
- `tests/`: behavioral and content contracts for routing, agents, timing, migrations, update and workflows.
- `README.md`, `docs/architecture/tech-reference/`, `.asd/project/custom-coding-rules.md`: public framework documentation, vetted CLI and RouterAI interfaces, local suite environment.

## Existing docs found
- `README.md`: provider, agent roster, configuration and phase mirrors that must match canon.
- `.asd/rules/external-review.md`: current CLI routes, per-platform invocation, availability, fingerprint, output and review-scope contracts.
- `.asd/rules/providers.md`, `.asd/rules/agent-protocol.md`: role rendering, host tools, dispatch and fallback semantics.
- `.asd/rules/sprint-lifecycle.md`, `.asd/rules/checkpoints.md`, `.asd/rules/core.md`: staged research, orchestrator authority, phase routing, timing and user-decision gates.
- `.asd/rules/code-style.md`, `.asd/rules/git-strategy.md`, `.asd/rules/artifact-layout.md`: testing, commit, documentation and evidence contracts.
- `.asd/workflows/asd-phase-scope.md`, `asd-phase-design.md`, `asd-phase-plan.md`: research and solution-design call sites.
- `.asd/workflows/asd-phase-impl.md`, `asd-phase-impl-test.md`, `asd-phase-impl-review.md`: execution, test environment, suite and review timing handoffs.
- `docs/architecture/tech-reference/routerai-v1.md` and `codex-0.169.md`: Responses endpoint, rolling alias, local credentials and isolated Codex profile invocation. RouterAI's published [Codex setup](https://routerai.ru/pages/vibe-coding-codex) confirms provider configuration and model selection; live model access remains unverified.
- `docs/architecture/tech-reference/codex-app-questions.md`: host-dependent choice tools and asynchronous responses.
- `.asd/project/custom-coding-rules.md`: project-owned testing constraints; Dev's self-hosting allowlist does not include this file.

## Existing implementation found
- AC-1–2: `.asd/runtime.js` `codexProfileRoute` pins profile provider, model and effort in a separate Codex process; `externalPreflight` identifies profile state and fingerprints. `tests/runtime-routing.test.js` exercises profile routing and negative-cache identities. RouterAI-specific behavior and an authenticated end-to-end review are not established by those fixtures.
- AC-3–4: `.asd/rules/sprint-lifecycle.md` and scope/design/plan workflows assign research to the orchestrator; agent roster and provider generation currently have no researcher. `tests/contract-agents.test.js`, `contract-workflows.test.js` and `sync-render.test.js` enforce roster and rendering contracts.
- AC-5: `runtime.js` passes raw frontmatter to `parseCanonicalFrontmatter`, whereas other call sites use normalized input; `tests/sync-render.test.js` covers normalized rendering, not external preflight with CRLF.
- AC-6–7: `providers.md` selects the host choice widget and falls back to chat; scope workflow asks before issue triage writes. Numbered fallback and unconditional label-only handling are not specified. `tests/contract-workflows.test.js` checks related workflow contracts.
- AC-8,14: `external-review.md` defines bounded retries and generic auth failure; runtime emits platform but does not explicitly carry wrapper host. `tests/runtime-routing.test.js` covers preflight/failure cases.
- AC-9,15: `tests/lib.js` supplies isolated Git configuration; recent terminal runs nevertheless suffered environment loss. The same-process repository-discovery and read-only-child checks need explicit integration with the runner and must avoid broad Git configuration changes.
- AC-10–11: `runtime.js` `openParent` can return a missing parent; `timingAppend` and `contextByteTotals` implement timing and context aggregation. `tests/runtime-timing.test.js` exercises current parent and summary behavior.
- AC-12,16: `sprint-lifecycle.md` specifies task briefs and cross-phase reachability but lacks the stated migration fixture and provider-artifact recovery requirements. `tests/migrations.test.js` includes executable fixtures.
- AC-13: workflow contracts and update cases are in `tests/contract-workflows.test.js`, `contract-rules.test.js` and update-related tests. Redundancy requires case-by-case evidence; a line-count reduction is not proof of equivalent coverage.

## Gaps
- Specify and verify the requested RouterAI invocation and configuration path against the existing named-profile route, preserving prior routes and keeping secrets out of args, state, logs and repository.
- Define researcher tool access, model tiers, dispatch payloads, output ownership, phase integration, failure recovery, generated views and release manifest entries for both hosts.
- Normalize canonical metadata at the external preflight boundary and add an executable CRLF regression.
- Extend user-question fallback, issue-label authority and all affected mirrors without weakening separate issue dispositions.
- Implement account-hold classification, host identity, timing-parent validation and completion accounting without violating existing availability, timing or review contracts.
- Provide the Git environment checks, migration-brief and recovery trace requirements, and evidence-based test-suite pruning.
- External dependencies: installed compatible Codex CLI, locally configured RouterAI provider and credentials for a live paid request. Local preflight alone cannot prove model access.
- Migration: if configuration or persisted contracts change, preserve legacy defaults and provide release migration where required by `backward_compat: migration`.

## Risks
- A rolling provider alias, API compatibility or unavailable credentials can prevent live review; distinguish local configuration tests from an authenticated review.
- Provider routing and failure identity can leak secrets or use the wrong model; test subprocess arguments and non-secret cache identity.
- Delegation can accidentally transfer user authority or leave phase call sites inline; retain gates in the orchestrator and inventory consumers.
- Timing validation can reject legitimate legacy ledgers; define compatibility and verify real cases.
- Test pruning can weaken contracts; retain proof for every removed behavior and executable update cases.
- AC-9's retrospective home is project-owned and outside Dev's initial-mode allowlist. Plan a deliverable canonical/runtime or explicitly orchestrator-owned route; do not assign an unauthorized project-file edit to a Dev.
