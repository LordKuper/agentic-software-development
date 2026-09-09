---
responsibility:
  owns: project-owner custom rules read during impl and impl-review phases
  excludes: universal rules, design-only rules
  delegates_to: custom-common-rules.md (all phases), custom-design-rules.md (design/design-review)
---

# Custom Coding Rules

Project rules applying only to code and tests. Read by `asd-dev`, `asd-tester`, impl-review reviewers.

Staging: a dispatched agent stages only the paths it authored. The whole-tree commands — `git add -A`/`-u`, `git add --renormalize`, `git commit -a`, `git stash` — are banned for it outright; they belong to the orchestrator, the only role that can see whether a sibling dispatch is in flight. Full contract: `.asd/rules/git-strategy.md` "Commit before review".

Framework repo specifics (`self_hosting: enabled`):
- No YAML parser dependency in `.asd/sync.js` or `.asd/skills/*/update.js` — stay zero-dependency Node (`fs`, `path`, `crypto` only); config field reads use minimal fail-closed line scanners, never a full YAML library.
- Any canonical `.asd/agents/`, `.asd/skills/`, `.asd/hooks/` edit MUST be followed by `node .asd/sync.js --apply <generated-view-path...>` (generated view paths only, per `.asd/rules/providers.md` "Canonical path -> per-provider path") in the same task before marking it done.
- Never hand-edit *generated* `.claude/`, `.codex/`, or `.agents/skills/` files — always edit the `.asd/` canonical source. Hand-authored agent memory is the carve-out: `artifact-layout.md` "Agent memory".

ASD never overwrites this file.
