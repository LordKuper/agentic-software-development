---
responsibility:
  owns: project-vetted reference for one technology version (apis used, version specifics, project conventions)
  excludes: adr rationale, code, full stack overview, build commands
  delegates_to: stack.html (overview), commands.yaml (commands); decisions fold per sprint-lifecycle.md "Design-promote phase" fold rule into whichever persistent doc's owns matches
---

# agnix @ 0.61

## Canonical source
- Official docs: https://github.com/agent-sh/agnix ; npm package `agnix` (wrapper; its postinstall downloads the platform binary from the GitHub release `v0.61.0`)
- Last verified: 2026-11-18 (`npx --yes agnix@0.61.0 --help`, `agnix schema`, a strict run over this repo's generated views)

## API surface used in project
- `npx --yes agnix@0.61.0 --strict -c .agnix.toml <paths…>`: validates agent configuration files; default target: the current directory when no path is given, so the project always passes paths; mutation: none without `--fix`. `--strict` treats warnings as errors: exit 1 on any error or warning, 0 otherwise; info findings never change the exit code.
- `--format json`: `{version, files_checked, diagnostics: [{level, rule, file, line, column, message}], summary: {errors, warnings, info}}`.
- `-c <path>`: TOML config. `[rules] disabled_rules = ["<RULE-ID>", …]` turns single rules off.
- `agnix explain <RULE-ID>`: prints a rule's description.

## Version-specific notes
- A whole-repo run reads every Markdown file as a candidate instruction file and reports `@scope/name` text in prose as a missing import; the project never runs it without paths.
- First use of a version needs network (npm registry, then the GitHub release); later runs use the npm cache.

## Deprecations and breaking changes from prior version
- None relied on.

## Project conventions
- Run only under `self_hosting`, as a `commands.yaml` `checks` entry, over `.claude .codex .agents AGENTS.md CLAUDE.md` after the views are synced.
- The version is pinned in the command; a bump is a sprint change with a fresh run.
- Never `--fix`: generated views are fixed in their `.asd/` canon.
- `.agnix.toml` is repo-local and never shipped to a consumer; each `disabled_rules` entry carries a comment with its reason and the sprint that accepted it.
