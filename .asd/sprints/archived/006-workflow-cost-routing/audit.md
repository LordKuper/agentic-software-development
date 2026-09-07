---
responsibility:
  owns: brownfield findings for sprint scope
  excludes: requirements, decisions, implementation, task breakdown
  delegates_to: sprint.md (requirements), plan.md (tasks)
---

# Audit

## Scope reference
[Accepted scope](./sprint.md), AC-1..AC-23. Baseline main `00f0ebed70330d6e474dad3c9567339964a82621`, ASD 4.0.1. Audit enabled; design documents disabled. The delegated Architect exhausted its usage allowance without returning findings; the main orchestrator performed this source audit. No independent audit verdict is claimed.

## Touched areas
- `.asd/agents/`, `.asd/workflows/`, `.asd/skills/`: PM removal, audit ownership, task-class selection, gate dispatch, Tester reuse and scoped inputs.
- `.asd/rules/`, `.asd/templates/`: policy, durable evidence, coverage format, configuration and recovery contracts.
- `.asd/sync.js`, `.asd/migrations/`, `.asd/skills/asd-update/update.js`: agent-variant generation and consumer migration.
- `.asd/hooks/session-start.js`: recovery visibility for pending closure and exceptional states.
- `.asd/project/config.yaml`, README, AGENTS, release manifest and generated views: selected profile and required mirrors.
- `tests/run.js`: generator, migration and new deterministic helper regression coverage.

## Existing docs found
- `core.md`: broad mandatory QODDA, Complication Approval and context rules. Narrowing phase gates alone leaves per-section and local-choice pauses intact.
- `checkpoints.md`: all existing user pauses are hard; acceptance and approval recording assume a human actor. No sprint-closure row exists.
- `sprint-lifecycle.md:81-90,224-227,262-264`: PM role table, pre-merge archive, post-merge terminal write and two-writer state contract require coordinated replacement.
- `providers.md`: aliases, one-source/one-agent mapping, read-only roles and explicit orphan-target removal. README mirrors both providers' tiers.
- `review-policy.md:93-107`: full file/rule/section ledger is generated before disk-only compression. Enforcement describes rule blanks but does not enumerate an independently supplied complete rule-ID set. Compact output must preserve completeness, not just totals.
- `external-review.md`: repeated wrapper-side executable probe, iteration-scoped availability skip and incremental diff. No persistent availability cache.
- `t_audit.md`: BA/Architect section ownership is embedded in the template, not just the dispatch workflow.
- Standalone concept/stack/design-system skills also carry approval microgates; route them through the same policy.

## Existing implementation found
- `sync.js:1192-1210,1272-1290`: discovery emits two provider targets per canonical agent filename; rendering reads one canonical frontmatter/body. Variants need discovery and rendering changes together so check/apply/orphan handling agree.
- `sync.js:392-420,911-970`: ownership markers and hash ledgers already support source identity and generated-content identity. Preserve this machinery; variant metadata belongs to the same canonical role source.
- `sync.js:1036-1051,1368`: orphan discovery and explicit-target apply already exist. Do not add a second general orphan sweeper.
- `update.js:178-262,379-422`: managed-path deletion, ordered migrations and reached-version reporting exist. Reuse the migration contract and the previous roster migration pattern in `.asd/migrations/4.0.0.js`; protect consumer-modified files.
- `session-start.js:27-39,67-93`: phase chain and active detection include archived-but-not-done sprints. Closure gating must preserve recovery for existing pre-merge archives.
- `.asd/project/commands.yaml`: build=sync check, lint=diff check, test=Node runner. No package manager or build framework is required.
- `.asd/project/stubs.md`: no open stubs to assign or waive.
- Current project config has no `scoped_fan_out` entry; the documented absent-field fallback is disabled.

## Gaps
1. PM owns more than dispatch: manual-step necessity checks, rollback resets, write allowlists, state/log writes, release sequencing and archive recovery. Transfer these to existing phase workflows and lifecycle rules before removing the canonical agent. No substitute PM shim.
2. User-gate decisions need actor, artifact revision, reason and evidence, with a pending closure distinguishable from PR publication/merge. Preserve technical checks and explicit scope authority. Removed categorical gates must not reappear through the local/reversible-only eligibility wording or blanket complication rules.
3. One canonical role currently yields one named specification. Add validated per-role variant metadata and expand only declared combinations; permissions/body are inherited, not overridable by tier. Unknown class or model must fail closed. Preserve normal custom agents without variants.
4. Define risk routing once, with commands for zero-judgment work, explicit eligibility, escalation and resumable selection evidence. Keep the user's main model and independent reviewer selection intact. Do not assume runtime model overrides beat custom-agent settings.
5. Compact coverage requires a dispatcher-owned ordered manifest of expected files, rules and sections. Reviewer output can encode statuses by index; deterministic validation must reject wrong identity, missing/duplicate/unknown IDs, invalid statuses/predicates and missing finding references. Valid counts alone do not prove review completeness; successful validation cannot prove review quality.
6. Preflight must precede wrapper dispatch and diff construction. Local executable/auth checks establish readiness only; first real review establishes actual model access. Cache only sanitized failure categories with bounded expiry and command/model/auth-state identity. Authentication checks must not persist credentials or claim quota health.
7. External wrapper frontmatter and body currently assert Claude `--allowedTools` establishes a read-only tool set. Correct the actual subprocess invocation using verified CLI tool restriction; explicitly select the nested model/effort independently of the cheaper wrapper. Recheck available CLI help before implementing flags.
8. Audit policy needs `auto|always|off` normalization with legacy `enabled|disabled`, an effective boolean frozen at scope, and reevaluation when scope expands. Architect owns both audit domains; BA is conditional on evidenced domain ambiguity.
9. Mandatory rule lists load broad lifecycle/artifact rules for many roles. Retain a small common invariant set and condition the remaining reads by role/phase; shortening lists without tracing ownership can remove safeguards.
10. Batch has no transport or recovery implementation in this repository. Official OpenAI and Anthropic docs, checked 2026-09-06, describe 50% lower API prices and asynchronous processing up to 24 hours. User explicitly rejected Batch after feasibility discussion; no implementation is needed. Sources: https://developers.openai.com/api/docs/guides/batch ; https://platform.claude.com/docs/en/build-with-claude/batch-processing .

## Risks
- **Silent authority transfer loss**: removing PM text by substitution can leave invalid self-delegation and obsolete write permissions. Inspect each dispatch site and use the old PM contract as a transfer checklist.
- **Migration deletes customization**: remove only framework-owned PM files through existing ownership checks; surface conflicts instead of overwriting consumer content.
- **Premature closure**: existing PR open archives immediately. Place explicit closure approval before finalization/archive, bind it to completion evidence, and retain confirmed-merge requirements for `done`.
- **Cheap work becomes expensive retries**: strong initial routing for workflow/security/migration changes, one bounded correction before escalation, no same-task downgrade loop; experimental outputs still get strong review.
- **False confidence from compact coverage**: validate against independent input manifests and reject malformed evidence; reviewers remain responsible for actual inspection.
- **Permanent external skip**: bounded negative-cache expiry and identity invalidation; availability skips never latch APPROVE.
- **Context reduction removes obligations**: trace every removed mandatory read to an applicable remaining source; keep custom common rules and trust boundaries.
- **Unavailable agent capacity**: audit delegation returned a usage-limit error. No agent review or implementation result may be inferred from that failed invocation.

No documentation migration into `docs/` is needed: this framework's authoritative specification remains in its canonical rules. No new technology or subsystem is proposed.
