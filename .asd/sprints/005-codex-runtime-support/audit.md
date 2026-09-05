---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference

[sprint.md](./sprint.md)

Framework-internal audit with `documents.prd: false` and `documents.adr: false`; no design draft is created. This repository has no `docs/` tree because its persistent specification lives in `.asd/rules/`.

## Touched areas

- `README.md`: Codex-with-ChatGPT-account prerequisites, primary-runtime setup, model-family behavior, recovery guidance, and provider-correct commands.
- `.asd/rules/providers.md`, `.asd/release-manifest.json`, `.asd/sync.js`: model IDs, semantic-operation mappings, validation, provider rendering, ownership hashes, and drift detection.
- `.asd/agents/*.md`, `.codex/agents/*.toml`, `.claude/agents/*.md`: all 12 roles, model/effort resolution, sandbox permissions, and delegation compatibility.
- `.asd/skills/*/SKILL.md`, `.asd/workflows/*.md`, `.agents/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md`: routing and runtime behavior across all ten phases.
- `.asd/rules/review-policy.md`, `.asd/rules/external-review.md`, `.asd/templates/external-review/**`, `.asd/templates/t_config.yaml`: provider-neutral review rules and External Review symmetry.
- `.asd/hooks/**`, `.codex/hooks/**`, `.claude/hooks/**`: session-start discovery, active-sprint recovery, and provider-specific skill references.
- `.asd/skills/asd-init/**`, `.asd/skills/asd-sync/**`, `.asd/skills/asd-update/**`, `.asd/migrations/**`: installation, reconciliation, upgrade behavior, and migration needs.
- `AGENTS.md`, `.asd/templates/t_AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`: shared guidance, mirror obligations, and consumer-visible release notes.
- `tests/run.js`, `tests/fixtures/**`, `.github/workflows/sync-check.yml`: generator, parity, model, hook, and drift coverage.
- `plans/multi-provider-support.md`: stale gitignored historical plan still referenced by a canonical rule.

## Existing docs found

- [`README.md`](../../../README.md): presents Claude Code and Codex as equal primary runtimes and documents provider paths and command forms. It does not state ChatGPT-account model constraints or unsupported-model recovery, and several prose examples still use Claude-only `/asd-*` forms.
- [`.asd/rules/providers.md`](../../rules/providers.md): owns provider mappings and now mirrors `sol -> gpt-5.6-sol`; it still links to the unavailable, stale `plans/multi-provider-support.md` and leaves some Codex operations generic.
- [`.asd/rules/review-policy.md`](../../rules/review-policy.md): says External Review is exempt because "Codex self-scopes", which is provider-specific and false when Codex is primary and the wrapped reviewer is Claude CLI.
- [`.asd/rules/external-review.md`](../../rules/external-review.md): correctly defines symmetric wrapping: Codex CLI under Claude Code and Claude CLI under Codex. It does not document primary-runtime ChatGPT-account compatibility.
- [`AGENTS.md`](../../../AGENTS.md) and [`.asd/templates/t_AGENTS.md`](../../templates/t_AGENTS.md): correctly identify canonical/generated paths and family aliases, but do not cover concrete Codex account compatibility or delegate-startup failures.
- [`CHANGELOG.md`](../../../CHANGELOG.md): has no entry for the consumer-visible `gpt-5.6` to `gpt-5.6-sol` correction.
- `.asd/project/decisions-log.md`: records successful `codex exec` use with `gpt-5.6-sol` only as External Review; that is not evidence that primary-runtime delegates start.
- `plans/multi-provider-support.md`: unavailable to consumers and contradictory; it still says implementation has not begun, retains `sol -> gpt-5.6`, and names retired roles and options.

## Existing implementation found

- The failure is reproduced: the generated PM requested `gpt-5.6`, which a ChatGPT-backed Codex delegate rejected. Bootstrap commit `1a2c008` maps `sol` to `gpt-5.6-sol`, regenerates ten Codex roles, and is validated by successful PM, BA, and Architect launches in this sprint. The [OpenAI model catalog](https://developers.openai.com/api/docs/models/gpt) lists the concrete Codex family IDs; the failure is specific to the stricter delegate registry rather than general API naming.
- Ten roles resolve to `gpt-5.6-sol`; Dev and Tester resolve to `gpt-5.6-terra`. All use high reasoning effort. Creators use `workspace-write`; reviewers, Advisor, and External Review are read-only. `luna` exists but is unused.
- `.asd/sync.js --check` reports every generated agent, skill, hook, and root provider file current. Codex intentionally uses `.codex/agents`, `.codex/hooks`, and `.agents/skills`; Claude views remain generated from the same canon.
- Every phase has a canonical route: Scope through PM; Audit through parallel BA/Architect and PM gate; Design through enabled creators or deterministic collapse; Design Review through reviewers; Design Promote through PM and domain creators; Plan through PM; Impl through Dev; Impl Test through Tester; Impl Review through four internal reviewers, optional External Review, and the full-suite Tester gate; PR through PM.
- State writers and hard gates are defined centrally; `accept` gates, explicit decisions, frozen-document no-ops, review loops, and recovery state have provider-neutral contracts.
- External Review substitutions are symmetric and carry read-only constraints for both wrapped CLIs. Existing tests cover substitution and command-tail safety.
- Init, sync, and update cover canonical installation, generated-view reconciliation, managed paths, migrations, and post-update checks. The model-map correction itself needs no data migration because provider views are derived.
- CI and tests verify every sync item is current instead of relying only on process exit status.

## Gaps

1. **Concrete model validation is too weak.** `resolveModelFamily` rejects unknown aliases but accepts empty, malformed, API-only, or account-unsupported mapped values and does not validate model/effort combinations.
2. **The bootstrap regression check is insufficient.** The fixture proves rendering but can be updated alongside another bad value. No test validates every canonical Codex agent's resolved model, effort, and sandbox or guards the ChatGPT-compatible family IDs.
3. **Generated Codex skills retain Claude invocation syntax.** Canonical setup and handoff prose emits `/asd-*`; the Codex transform does not provide `$asd-*` forms, although the session-start hook already does.
4. **Canonical workflow prose names a host tool.** `.asd/workflows/asd-phase-impl-review.md` says to obtain a diff "via Bash" instead of using the semantic run-command operation.
5. **Archived active sprints are invisible to the session-start hook.** It scans only `.asd/sprints/*`, while PR-open mode moves a not-yet-done sprint under `archived/`. No regression test covers this recovery path.
6. **Design-review dispatch contracts conflict.** The skill and repository guidance require Correctness for every non-empty draft set with only its UI subsection conditional; the workflow skips the entire reviewer when no UX/design-system draft exists.
7. **External Review iteration instructions are stale.** A prompt template describes later iterations as current diff plus last commit, while the role, workflow, and policy require delta from the previous iteration's recorded HEAD.
8. **Codex-primary External Review dependency is unverified.** Config records Codex CLI availability for Claude-primary review, but not Claude CLI availability required when Codex is primary. Missing CLI degrades to a skip.
9. **Codex user-decision behavior lacks executable coverage.** Scope/Audit/Plan acceptance, hard-gate choices, and resume-after-decision remain prose-only despite being state-sensitive runtime boundaries.

No new library, framework, runtime, or external service is selected, so no tech-reference or migration script is required. Claude CLI availability is the only unresolved runtime dependency.

## Risks

- **High:** another plausible but unsupported Codex model mapping can pass sync and fixtures, then fail only at delegation.
- **High:** slash-command handoffs can strand Codex users despite installed skills.
- **Medium:** an archived-but-active sprint can be reported as absent, preventing merge completion.
- **Medium:** missing Claude CLI silently reduces Codex-primary review coverage unless the availability skip is surfaced clearly.
- **Medium:** contradictory design-review routing can omit non-UI correctness review.
- **Medium:** stale incremental-diff instructions can duplicate or miss External Review findings.
- **Low:** literal host-tool prose and untested decision mapping rely on model inference.
- **Low:** Claude regression risk remains low if fixes stay provider-neutral or Codex-render-specific and both generated views are checked.
