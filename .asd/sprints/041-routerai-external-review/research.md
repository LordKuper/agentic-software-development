---
responsibility:
  owns: staged-design research for sprint scope
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md, design/ docs, plan.md
---

# Research

## Requirements
- Raw scope: Consider open GitHub issues; support `~anthropic/claude-opus-latest` through RouterAI for external review when Codex is the main provider; add a research agent and transfer research and solution-design operations to it.
- Problem: External review needs an additional provider route; research and solution-design operations need a dedicated agent; open GitHub issues need scope intake.
- Actors: ASD orchestrator, research agent, external reviewer, project owner.
- Functional requirements: Make RouterAI an optional external-review route using Codex CLI with provider selection, preserving existing routes; use the requested model alias; delegate research and solution-design operations to a research agent; consider the open issues.
- Constraints: Keep API credentials outside the repository; maintain existing provider behavior when RouterAI is not selected.
- Success criteria: The selectable route and research-agent responsibilities are specified and implemented; issue dispositions are explicitly established during intake.

## Findings
- RouterAI documents Codex CLI integration using its Responses endpoint, a `routerai` model provider and local authentication. Source: https://routerai.ru/pages/vibe-coding-codex
- RouterAI lists `~anthropic/claude-opus-latest` as an alias for its current Opus model. Source: https://routerai.ru/models/anthropic/claude-opus-5.5
- Anthropic recommends explicit success criteria, source verification and bounded subagent responsibilities for research and delegation. Source: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables
- Current ASD routes Codex external review to Claude CLI or a named Codex profile; scope research is inline and its approach selection is a user gate. Sources: .asd/rules/external-review.md; .asd/rules/sprint-lifecycle.md; .asd/workflows/asd-phase-scope.md.

## Approaches
- **Codex CLI provider route with a research agent**: Invoke a separate Codex CLI with the RouterAI provider and requested model selected; delegate research and solution-design work to a dedicated agent while the orchestrator retains user gates. Pros: reuses the existing Codex external-review route and isolates the main session. Cons: requires compatible Codex, local provider configuration and a RouterAI key; exact override behavior needs verification.
- **Direct API route with a research agent**: Add a separate RouterAI API reviewer while delegating research and solution design to a dedicated agent. Pros: avoids CLI dependency. Cons: requires a separate tool-execution and review protocol and is contrary to the user's specified CLI route.
- Recommended: Codex CLI provider route with a research agent.
- Chosen: Codex CLI provider route with a research agent — user explicitly specified Codex CLI with a provider-switching parameter, correcting the earlier Claude CLI proposal.
