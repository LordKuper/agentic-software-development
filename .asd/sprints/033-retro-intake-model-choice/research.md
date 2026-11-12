---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

<!-- Stages, conceptual boundary, no-web-research Findings line: .asd/rules/sprint-lifecycle.md "Staged solution design" — not restated here. -->

## Requirements
Raw scope and stage (a) answers; stage (c) refines the answers.
- Raw scope: triage open issues and retro findings; review the article https://claude.dev/blog/which-claude-model-should-you-build-with/ and apply its relevant recommendations to ASD.
- Problem: ASD's model choices — agent family and effort tiers, task routing (`route-task` mechanical/standard), the orchestrator's own model — were set without checking current vendor guidance; any optimization the article supports is in scope.
- Actors: ASD maintainer; consumer projects receiving tier changes via `/asd-update`; the orchestrator and dispatched agents running on the chosen models.
- Functional requirements: compare every article recommendation with ASD's current model selection; apply the relevant ones to canon (agent frontmatter, routing rules, `model_families`, README tier table).
- Constraints: Claude side only — Codex families and columns untouched; changing an existing agent's tier is allowed; `backward_compat: migration`.
- Success criteria: token savings without noticeable quality loss; every article recommendation is either reflected in canon or explicitly rejected with a reason.

## Findings
Source for every finding: https://claude.dev/blog/which-claude-model-should-you-build-with/ (Anthropic playbook, 2026-11-09; vendor figures, unverified). Current ASD tier per agent in brackets.
- F1 Default start: Opus 5.5 at `medium`; Fable 5.2 for hardest work, leading many subagents, long unattended runs. [orchestrator = user's session model, ASD never sets it; README gives no guidance]
- F2 Adjust effort before changing models; past `high` one level can cost as much as a bigger model. Opus `medium` ≈ −2.5 pts vs `high` at ~70% cost; `xhigh` +1.4 pts at 2.5× cost. Claude Code defaults: Sonnet `medium`, Fable `medium`, Opus `medium`. [every Claude agent at `high` except external-review wrapper `medium`]
- F3 Small models where "a mistake is cheap to spot" (find files, run tests, read logs); code edits and judgment on the main model. [asd-dev-mechanical haiku — aligned; asd-tester sonnet/high also runs suites and reads logs]
- F4 Sonnet 5.5: well-scoped, spec-driven work, repeated agent tasks incl. review; a clear spec does not make a migration or perf optimization Sonnet-easy. [asd-dev standard sonnet; route-task escalates risky tasks only to `standard` = sonnet, no tier above]
- F5 Escalation ladder when a model falls short: self-verify with test/build → raise effort one level → next model up at lower effort. Cheap-first retry (Opus `low`, failures re-run `high`) passed ~97% at $0.17 vs 95.3% at $0.29 all-`high`. [route-task: failed check → `standard`; no effort step]
- F6 Keep the expensive model's context lean; cheaper subagents do verbose reading. Built-in Explore runs on the session model; define own Explore on haiku. [orchestrator scans code/docs inline at audit, plan, cleanup]
- F7 Simple routing rule → let code pick the model. [route-task — aligned]
- F8 Advisor pattern: cheaper executor consults stronger advisor; none of four measured pairings clearly beat executor alone. [asd-advisor fable/high, consulted rarely — aligned, low volume]
- F9 Orchestrator-worker for bulk work beyond one context: Opus lead + Sonnet workers ≈ ⅓ cheaper at equal score; skip for dependent chains or work fitting one context. [impl waves — aligned]
- F10 Measure on own work: sample real tasks, record `usage` cost, compare score vs spend before cutover. [timing ledger records model and time, no token usage]
- F11 `haiku` alias resolves to Haiku 5.5 only on the Anthropic API (Claude Code ≥ 2.1.293); Bedrock/Vertex/Foundry still Haiku 4.5; `ANTHROPIC_DEFAULT_HAIKU_MODEL` pins it. [`model_families` rolling aliases; no note]
- F12 Not applicable to ASD (API-level): prices, cache-write cost on model switch (dispatches start fresh anyway), forced tool use 400, thinking-block carry-over, Haiku 4.5 sampling params, fast mode, safety-classifier fallback, `opusplan` (puts edits on Sonnet — article advises against as default).

## Approaches
- **A — effort-first tuning**: lower effort where the article's data says it is cheap (external-review wrapper → haiku; tester, dev standard → keep `high`; reviewers `high` → `medium`), add the escalation ladder's effort step to routing, README orchestrator-model guidance and haiku-alias note; pros: small canon diff, no new agent, biggest volume (reviewers ×iterations) gets cheaper; cons: reviewers are the quality gate, `medium` risks missed findings.
- **B — task-class split**: A's routing/README parts plus a haiku `asd-tester` variant for pure suite runs/log reading, a haiku read-only scout agent for orchestrator scans (F6), and an Opus tier above `standard` for migration/broad-reasoning risks (F4); reviewers stay `high`; pros: follows F3/F4/F6 closely, keeps the gate strong; cons: new agent + variant + routing tier = larger diff, more mirrors (README, manifest, providers), Opus tier raises cost on risky tasks.
- **C — measure first**: add token `usage` capture to the timing ledger (F10), change no tiers this sprint, decide from data next sprint; pros: evidence-based; cons: no savings now, ledger only sees what hosts expose.
- Recommended: B without the scout agent (B′) — tester run variant, external-review wrapper → haiku, Opus escalation tier, effort step in the ladder, README guidance; reviewers keep `high` — savings land on high-volume mechanical work while the review gate and code edits keep their strength; scout conflicts with the "orchestrator performs all sprint work itself" model and costs a new agent.
- Chosen: {{approach}} — {{user answer, stage (c)}}
