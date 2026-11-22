---
responsibility:
  owns: project-vetted RouterAI Responses interface and reference model alias
  excludes: billing, credentials, active local profile values
  delegates_to: .asd/rules/external-review.md
---

# RouterAI @ API v1

## Canonical source

- [Codex setup](https://routerai.ru/pages/vibe-coding-codex), [Opus alias](https://routerai.ru/models/~anthropic/claude-opus-latest), [model catalog](https://routerai.ru/api/v1/models).
- Last verified 2026-11-22. The public model catalog lists reasoning parameters for the rolling alias.

## API surface used in project

- The Codex profile's provider uses base URL `https://routerai.ru/api/v1` and `wire_api = "responses"`. The profile selects `~anthropic/claude-opus-latest` and `model_reasoning_effort = "medium"`. The input routes to the provider's current Opus alias. The remote inference request can consume RouterAI credits.
- The authenticated example obtains its bearer token from a local environment variable or credential helper. Store the profile name in project config. Keep credentials and provider definitions in user-local configuration.
- The alias currently points to Opus 5.5. Reverify the alias and a live synthetic review when credentials are available. The public catalog and local CLI probes cannot establish that a paid model request succeeds.
