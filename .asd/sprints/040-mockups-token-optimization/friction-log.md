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
| F-2 | impl-review | Claude Code passed local preflight and refused external review | reviews/impl/wave-1/iter-01/external.md |

## F-1 — Claude Code account hold blocked a memory-owner request

- **Phase**: impl
- **Surface**: provider tool — Claude Code, Combined reviewer memory owner
- **What happened**: Local login status reported signed in. The read-only owner invocation then returned an account-hold denial. The CLI also indicated that this project was untrusted.
- **Impact**: The accepted Combined memory-index reduction is blocked on the owner. Codex context measurements and canonical changes can proceed.
- **Resolution**: The exact Combined owner completed the planned index edit in Codex at d24d80a. All 44 links were preserved.
- **Refs**: decisions-log.md, audit.md

## F-2 — Claude Code passed local preflight and refused external review

- **Phase**: impl-review
- **Surface**: provider tool — Claude Code wrapped external review
- **What happened**: Local version and login probes returned ready. Both real review invocations returned an account-hold denial.
- **Impact**: External Review recorded an authentication availability skip and carried its complete unreviewed scope. Internal review continued.
- **Refs**: reviews/impl/wave-1/iter-01/external.md
