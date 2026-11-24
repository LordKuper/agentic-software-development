---
responsibility:
  owns: workflow friction in sprint 040
  delegates_to: retrospective.html (analysis)
---

# Friction log — sprint 040-mockups-token-optimization

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Claude Code account hold blocked a memory-owner request | — |

## F-1 — Claude Code account hold blocked a memory-owner request

- **Phase**: impl
- **Surface**: provider tool — Claude Code, Combined reviewer memory owner
- **What happened**: Local login status reported signed in. The read-only owner invocation then returned an account-hold denial. The CLI also indicated that this project was untrusted.
- **Impact**: The accepted Combined memory-index reduction is blocked on the owner. Codex context measurements and canonical changes can proceed.
- **Refs**: decisions-log.md, audit.md
