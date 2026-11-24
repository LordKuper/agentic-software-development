---
responsibility:
  owns: project-owner custom rules read by all agents in all phases
  excludes: phase-specific rules (design-only, coding-only)
  delegates_to: custom-design-rules.md (design/design-review), custom-coding-rules.md (impl/impl-review), .asd/rules/ (workflow rules)
---

# Custom Common Rules

Framework repo (`self_hosting: enabled`): "the project" means the ASD framework itself — no application users, no runtime deployment. Vocabulary: canonical source = `.asd/`; provider view = generated `.claude/`/`.codex/`/`.agents/skills/`; consumer = a project that installed ASD.

Write file content with the file-edit operation, never inside a quoted shell or `node -e` argument.

On Git Bash, run `git show <ref>:<path>` with `MSYS_NO_PATHCONV=1` set.

ASD never overwrites this file.
