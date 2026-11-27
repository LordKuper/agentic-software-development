# Research

## Requirements
- Raw scope: require connected applications to be disabled for ASD external Codex review.
- Problem: connected app tool definitions caused excessive input tokens and cost for RouterAI review.
- Actors: ASD orchestrator and external Codex reviewer.
- Functional requirements: disable apps on the named-profile external Codex subprocess launched from Codex; preserve primary session settings and Claude Code routes.
- Constraints: no global configuration change; retain required read-only review tools.
- Success: the named-profile Codex route enforces `features.apps=false` and tests verify the generated invocation.

## Findings
- A user test reduced reported input from 176,759 to 38,896 tokens when apps were disabled; results vary with available context.
- The named-profile route builds arguments in `.asd/runtime.js`; the Claude-host default Codex route uses `.asd/agents/asd-external-review.md`.
- Codex documents `features.apps` as the app integration feature: https://learn.chatgpt.com/docs/config-file/config-reference.

## Approaches
- **Per-invocation override**: enforce `features.apps=false` for the named-profile route. Pro: mandatory and limited to review. Con: changes the route contract.
- **User configuration**: require a global or profile setting. Pro: no framework code change. Con: not mandatory and can affect unrelated sessions.
- Recommended: per-invocation override.
- Chosen: per-invocation override, per user request for a mandatory ASD parameter.
