---
responsibility:
  owns: project-vetted Codex CLI 0.169.x profile, review and custom-agent interfaces
  excludes: project config values, credentials, release behavior
  delegates_to: .asd/rules/external-review.md, .asd/rules/providers.md
---

# Codex CLI @ 0.169.1

## Canonical source

- [CLI command reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli), [advanced config](https://learn.chatgpt.com/docs/config-file/config-advanced), [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- Last verified 2026-11-22 against official docs and installed CLI help.

## API surface used in project

- `codex --version` and `codex login status` inspect the selected executable and its local auth state. With defaults, they use the current user's Codex home. Both are read-only probes. Login status is evidence for conventional OpenAI authentication.
- `codex exec --profile <name> --sandbox read-only --ephemeral -` runs one review with a prompt on stdin and a final answer on stdout. The working directory is the current directory unless set explicitly. The profile overlays the user's base Codex config. The command sends review inputs to the profile's inference provider and permits read-only shell operations. Ephemeral mode avoids saving a session transcript.
- A custom subagent's configured model and effort take precedence over spawn values. The provider and permissions come from the parent session. A verified quota fallback needs a different registered role configuration with equivalent instructions and permissions on Codex. Selecting another provider for the wrapped process uses the profile instead.

## Version-specific notes

- Profiles use `$CODEX_HOME/<name>.config.toml` with top-level keys. Project-local files cannot select the provider or set its authentication.
- The profile route uses a local provider definition and credential lookup. Validate route and availability separately. Review invocation and preflight use the same resolved command and profile.
- Codex 0.169.1 rejects `--profile` on `login status`. The local `debug prompt-input` command can exit successfully with a nonexistent profile name. Preflight must confirm the requested profile file exists before invoking a runtime command. A profile lookup cannot substitute for a model request.
