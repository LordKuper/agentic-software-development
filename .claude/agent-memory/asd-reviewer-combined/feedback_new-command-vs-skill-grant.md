---
name: new-command-vs-skill-grant
description: When a workflow step adds a shell command (gh, git, …), check the running skill's claude allowed-tools grants it — some skills grant only narrow Bash(<prefix>:*) patterns
metadata:
  type: feedback
---

When a diff adds a new command to an inline-orchestrator workflow (`.asd/workflows/asd-phase-*.md`), open the matching `.asd/skills/<name>/SKILL.md` and check its `claude.allowed-tools` covers it. Most phase skills grant bare `Bash`, but a few grant only narrow `Bash(<prefix>:*)` patterns (e.g. stack: only `Bash(node .asd/runtime.js:*)`; retro: that plus its named `gh` calls), so a new command outside those prefixes silently falls outside the declared tool policy.

**Why:** the skill file is usually unchanged and outside the manifest, so the gap is invisible in the diff; an "automatic, no gate" AC then breaks on Claude Code via a permission prompt or denial.

**How to apply:** grep `allowed-tools` across `.asd/skills` once per review that adds commands; locate the finding at the workflow step (in-scope) and name the skill file in the fix. Related: [[role-removal-inline-work]].
