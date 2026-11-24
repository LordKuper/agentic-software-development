---
responsibility:
  owns: project-owner custom rules read during impl and impl-review phases
  excludes: universal rules, design-only rules
  delegates_to: custom-common-rules.md (all phases), custom-design-rules.md (design/design-review)
---

# Custom Coding Rules

Stage only the named paths you authored. Whole-tree restrictions: `.asd/rules/git-strategy.md` "Commit before review".

Framework repo specifics (`self_hosting: enabled`):
- No YAML parser dependency in `.asd/sync.js` or `.asd/skills/*/update.js` — stay zero-dependency Node (`fs`, `path`, `crypto` only); config field reads use minimal fail-closed line scanners, never a full YAML library.
- Edit canonical `.asd/` sources for generated views. The orchestrator alone syncs views once per wave or fix round (`.asd/rules/sprint-lifecycle.md` "Self-hosting"). Hand-authored memory follows `artifact-layout.md` "Agent memory".
- A Task adding an external command to a workflow step also widens the running skill's tool grant, passes the target repo explicitly, and cites only shipped `.asd/` paths from any step that runs in a consumer project.
- A `.asd/runtime.js` parser of a `language.docs` artifact checks its structure (column count, id column, machine tokens), never translated heading text.
- Before COMPLETED, a dev that edited a rule, workflow or agent file runs `node .asd/runtime.js context-check` and keeps every bundle under its ceiling in `.asd/project/context-ceilings.json`; raising a ceiling is a quality waiver (`code-style.md` §5).

ASD never overwrites this file.
