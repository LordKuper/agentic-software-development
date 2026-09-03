---
responsibility:
  owns: project-owner custom rules read during impl and impl-review phases
  excludes: universal rules, design-only rules
  delegates_to: custom-common-rules.md (all phases), custom-design-rules.md (design/design-review)
---

# Custom Coding Rules

Project rules applying only to code and tests. Read by `asd-dev`, `asd-test-engineer`, impl-review reviewers.

Framework repo specifics (`self_hosting: enabled`):
- No YAML parser dependency in `.asd/sync.js` or `.asd/skills/*/update.js` — stay zero-dependency Node (`fs`, `path`, `crypto` only); config field reads use minimal fail-closed line scanners, never a full YAML library.
- Any canonical `.asd/agents/`, `.asd/skills/`, `.asd/hooks/` edit MUST be followed by `node .asd/sync.js --apply <targets>` in the same task before marking it done.
- Never hand-edit `.claude/`, `.codex/`, or `.agents/skills/` — always edit the `.asd/` canonical source.

ASD never overwrites this file.
