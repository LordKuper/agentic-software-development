---
responsibility:
  owns: verified Codex App choice-widget behavior for ASD decisions
  excludes: agent routing, gate authority and CLI integration
  delegates_to: .asd/rules/providers.md, .asd/rules/checkpoints.md
---

# Codex App choice widget

## Canonical source

- [Codex App Server](https://learn.chatgpt.com/docs/app-server). Verified 2026-11-22 with a live Codex App decision.

## API surface used in project

- The active Codex App session exposed an asynchronous structured input tool. It targets the current user in the current chat and creates an interactive prompt. A later reply carries selected labels or free text. An enqueue acknowledgment does not contain a decision.

## Version-specific notes

- The exposed model tool depends on the host and mode. ASD uses the available choice interface rather than calling App Server directly.

## Project conventions

- Use localized options for structured decisions. Wait for the actual answer before mutating gate state. Where the tool is missing, use chat with the same options.
