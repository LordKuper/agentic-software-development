---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference

[Accepted scope](sprint.md), [research and model selections](research.md), [scope decisions](decisions-log.001.md), [retrospective 037](../archived/037-quality-gates-ci-cost-ideas/retrospective.html).

## Touched areas

- Configuration and routing: `.asd/templates/t_config.yaml`, `.asd/project/config.yaml`, `.asd/skills/asd-{sprint,init,update}/`, README and config checks.
- Design and promotion: `.asd/rules/design-system.md`, scope, design and design-promote workflows, and mockup handoff documentation.
- External review and models: `.asd/rules/{providers,external-review,review-policy}.md`, review workflows, canonical agents, release manifest, generator and provider views.
- Planning and verification: plan, impl and impl-test workflows, `.asd/rules/sprint-lifecycle.md`, test-plan templates, tester contract and test areas.
- Runtime and release verification: review persistence and snapshots, timing, pre-commit checking, hash ledgers, and CLI and contract tests.

## Existing docs found

- [README](../../../README.md) documents config, phase flow, agent roles, external review and runtime commands. It mirrors contracts in [providers](../../rules/providers.md), [external review](../../rules/external-review.md), [review policy](../../rules/review-policy.md), [sprint lifecycle](../../rules/sprint-lifecycle.md) and [design system](../../rules/design-system.md).
- [Git](../../../docs/architecture/tech-reference/git-2.56.md), [GitHub CLI](../../../docs/architecture/tech-reference/gh-2.90.md) and [agnix](../../../docs/architecture/tech-reference/agnix-0.61.md) are the repo's persistent tech references. They cover current repository and verifier commands. Codex profiles and the Claude Code Bash timeout have no persistent reference here.
- Primary sources: [Codex profiles and custom providers](https://learn.chatgpt.com/docs/config-file/config-advanced), [Codex custom-agent model precedence](https://learn.chatgpt.com/docs/agent-configuration/subagents), [RouterAI's Codex instructions](https://routerai.ru/pages/vibe-coding-codex) and [Claude Code foreground timeout settings](https://code.claude.com/docs/en/env-vars).

## Existing implementation found

- `asd-init` already enumerates absent fields from the shipped template, supports typed sprint-mediated settings, and detects external tooling. `asd-sprint` currently permits absent fields to be interpreted by individual readers. This repo omits `cleanup`, `upstream_issues`, `safety_valve` and `documents.design_system`.
- Both workflows already share the dual Claude Design/local HTML mockup rule. Lite scope authors mockups, and design-promote copies them. No durable deferred publish state exists.
- `externalPreflight` bounds executable/auth probes, isolates command arguments on Windows and caches by resolved identity. `asd-external-review` builds the prompt, starts the read-only CLI, normalizes findings and detects stalemates. Both review phases already share the preflight and result contract.
- Codex 0.169.1 exposes `exec --profile` and `--sandbox read-only`. Claude Code 2.1.326 is installed. The Codex renderer resolves model family aliases and accepts `medium`, `high` and `xhigh`. Current Codex roles and the separately wrapped model are recorded in research. The public RouterAI catalog advertises reasoning for the requested alias. The process has no RouterAI key; the authenticated smoke run remains conditional under AC-5.
- `emitManifestCommand` joins scoped, carried-over and full-range paths. `emitExternalScope` receives one list for both manifest and patch. Scope pathspecs currently live in workflow prose. `persistReview` already validates the report, rejects duplicate output and applies the external floor. Coverage-ledger comparison currently requires string findings IDs.
- `draftSnapshot` stores files below an iteration directory's `snapshot/`. Existing tests cover first iteration, an unchanged pair, changed files, and a missing previous snapshot. The caller accepts an already-nested snapshot path, and an empty generated patch becomes a null diff.
- Shared Git commands and checks already have tests. `sync.js --apply` detects invalid targets and exits 1 without writing the ledgers. The check path does not assess stale hash ledgers. `commitCheck` validates the message and scans staged memory changes; explicit paths can pass despite no staged change. `persistReview` has no memory scan. The staged scanner has tests for added lines and valid placeholders.
- The zero-dependency runner accepts named areas. Impl-test currently uses one first entry and step 8 can widen its run to full for shared infrastructure. The test-plan close validator checks live and rotated segments and can reject Added tests, Entry log or Suite run. The workflow gives specific refusal repairs but no general typed routing for the latter two. Table parsing already has an escaped-pipe-aware helper. Relevant checks live in `tests/runtime-{review,routing,timing,tools}.test.js`, `tests/sync-{cli,render}.test.js` and the contract suites.

## Gaps

| Criteria | Gap at HEAD and deliverability |
| --- | --- |
| AC-1–AC-2 | Share the shipped template's leaf presence and completion contract across fresh init, re-init, mediated checks and every sprint entry. Prior config choices and valid empty strings need preservation. The framework checkout needs its own agreed explicit values before the gate lands. |
| AC-3, AC-15 | Mockup selection currently tests host capability alone. Add one explicit project choice and one durable lite publish retry handoff. Existing local HTML and UX-spec publication approval cover both paths. Retry belongs before mockup promotion and must survive session restart. |
| AC-4–AC-5 | The wrapper's selection and auth probe are keyed to the opposite CLI today. A named Codex profile needs a separate process, bounded local preflight and cache identity. Its provider auth may differ from primary Codex login; a local-ready result cannot prove RouterAI model access. The documented example carries model and effort in the local profile. |
| AC-6–AC-7 | Update five Codex delegate settings and add the Astra family for the advisor. Existing render and mirror checks cover generated output. The wrapper needs a check that exercises findings through normalization, not only Markdown format, and runner reporting needs a controlled failing command. |
| AC-8–AC-9 | The plan has a Test-only Tasks carve-out but no compile-only scheduling for changed call sites. Suite reuse already compares trees and short HEAD values; the tester needs to attach a matching committed revision after fixing tests. |
| AC-10–AC-11 | The close validator reads historical test-plan segments with the current required columns. Future column changes need a migration or explicit compatibility path. Plan already reads tech references, but has no infrastructure CLI and registry-tag requirement. The repo has no deployment Tasks of its own. |
| AC-12 | No quota fallback contract exists. Claude Code and Codex have different model selection semantics. Codex custom-agent model fields take precedence over spawn defaults, so a Codex fallback must select a genuinely available compatible role/model route and verify the resolved model. A blanket spawn-model override will not satisfy the criterion. |
| AC-13–AC-14 | The test-plan template omits the escape rule despite an existing parsing helper. Plan decisions have no focused checklist for alert-key lifecycle and time semantics. Both can extend the relevant authoring contract. |
| AC-16 | Initial plan acceptance checks references, and agents may refuse missing references. The review-fix chain does not ensure references for the fix path before dispatch. |
| AC-17 | `parseFlagArgs` currently retains the last repeated `--attrs`; a test asserts the warning and last-value rule. The accepted criterion deliberately replaces the repeated-flag contract. Semicolon input remains supported. |
| AC-18 | `emitExternalScope` trusts the supplied list. The published external review exclusions are the source of truth for a manifest and patch filter. Test direct and carried-over lists, consumer and self-hosting modes. |
| AC-19–AC-20 | Numeric coverage ledger finding IDs fail before matching. Normalize before duplicate/bijection checks. Add guards at both previous snapshot entry points and at requested snapshot patch output; the first-iteration no-patch path stays valid. |
| AC-21 | The common rule requires at least ten minutes and foreground execution. Claude Code documents the 600000 ms default maximum for foreground Bash. The wrapper's host-specific invocation still needs the explicit parameter and PID-polling rule. |
| AC-22, AC-29–AC-30 | Area-addressable tests already exist. The workflow needs per-area completion for a large first entry, a rule that reserves full verification for truly shared changes, and a proven prose-only route that checks contract-test consumers before omitting a tester dispatch. Keep test-plan consolidation and a final full-suite backstop. |
| AC-23–AC-25 | Audit scope scans code and docs but does not require searching tests for a reported gap. Hash ledger computations exist in sync apply only. Commit check needs staged/unstaged path evidence, including both sides of renames. |
| AC-26–AC-28 | Review-fix dispatch payloads currently carry findings without a critical mechanism family. Impl-test workflows need to pair each close refusal with its repair owner and document. Review persistence must check applicable memory changes before either output write, with correct attribution to the reviewer. |

External dependency gaps: the provider profile is user-local. Use a deterministic fixture for route and report checks. A synthetic authenticated RouterAI smoke can run when credentials for the selected profile are available.

Migration gaps: existing incomplete project config must be completed through init while preserving effective choices. Keep legacy test-plan segments readable through a covered migration or compatibility rule when changing required columns.

## Risks

- Review data boundaries: filtering after the patch is written can still send excluded content. Derive list and patch from the same validated file set.
- Locked config rollout: inserting validation before migrating the framework checkout can block an active sprint. Land the schema and its approved explicit config values before enabling the entry gate on this branch.
- Model fidelity: test that a quota retry resolves to a different usable model while keeping the role and permissions. Compare raw Opus findings with the wrapper report to detect dropped material findings.
- Test coordination: area and prose shortcuts can weaken coverage or report a false green. Preserve area evidence and use the terminal full suite for integrated verification.
- Git and ledger safety: check before writing or changing refs. An invalid review or stale check must leave related artifacts intact.
- Baseline at scope commit plus the audit log rotation: `node tests/run.js` 311/311, `agnix 0.61.0 --strict` 0 errors and 0 warnings, context ceilings green. Existing tests establish defaults and seams. The accepted behavior changes require targeted regression checks.
