---
responsibility:
  owns: project-vetted Claude Code 2.1 tool parameters for external review and delegated model choice
  excludes: project config values, credentials, Claude API routing
  delegates_to: .asd/rules/external-review.md, .asd/rules/providers.md
---

# Claude Code @ 2.1.326

## Canonical source

- [Environment variables](https://code.claude.com/docs/en/env-vars), [tool hook inputs](https://code.claude.com/docs/en/hooks), [subagents](https://code.claude.com/docs/en/sub-agents).
- Last verified 2026-11-22 against official docs and installed CLI version.

## API surface used in project

- The foreground Bash tool accepts a timeout in milliseconds. Pass `timeout: 600000` for an external review. Its default maximum is set by `BASH_MAX_TIMEOUT_MS`. The command executes in the existing workspace. Its possible writes are determined by the command and its sandbox. ASD waits for the tool result and reads the review from stdout.
- Custom subagents declare the role's model, tools and instructions. Resolve and verify the alternative model according to the host's actual agent caller before counting a quota retry as an alternate dispatch.
- `claude --version` and `claude auth status --json` inspect the current executable and local Claude authentication. They make no model request and do not change the working tree.
