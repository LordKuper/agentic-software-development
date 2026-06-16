# CLAUDE.md

Guidance for Claude Code in this repo.

## What this repo is

This repo **IS the ASD (Agentic Software Development) framework** — its source, not a project that *uses* ASD. No application code: every file is workflow infrastructure (rules, templates, agent/skill defs, hooks). Work = authoring/editing that infrastructure.

Don't run `/asd-sprint` or `/asd-init` to "develop" this repo — those drive a *consumer* project. SessionStart hook reporting "No active sprint" is expected here.

## No build / test / lint

Ships as Markdown, YAML, JSON, HTML, Node hook scripts. No package.json, compiler, or test runner. "Verification" of a change:

- Hooks run clean: exit 0, never throw (designed to fail silently).
- Edited YAML/JSON parses; edited HTML templates keep structure.
- Cross-file consistency holds (below).

## Architecture

ASD drives a consumer project through phases per sprint. Three layers under `.asd/` and `.claude/`:

- **Rules** (`.asd/rules/*.md`) — SSoT for workflow behavior. `core.md` is the hub, links every other rule doc. Read by *all* agents; changing a rule changes behavior everywhere.
- **Skills** (`.claude/skills/*/SKILL.md`) — 15. `asd-sprint` detects active sprint from `state.json`, dispatches matching `asd-phase-*` skill; phase skills dispatch agents. `asd-init`, `asd-concept`, `asd-stack`, `asd-design-system` = user-facing setup; `asd-update` (bundles `update.js`) pulls latest framework files into a consumer per `.asd/update-manifest.json`.
- **Agents** (`.claude/agents/*.md`) — 15: 7 creators (PM, BA, UX Designer, Architect, Backend/Frontend Dev, Test Engineer), 8 reviewers (7 internal + External Review wrapping Codex CLI). Each has YAML frontmatter: `model`, `tools`, `description`.
- **Templates** (`.asd/templates/t_*`) — every consumer artifact has a `t_`-prefixed template (e.g. `t_prd.html`, `t_plan.md`, `t_state.json`).

`t_CLAUDE.md` = template for the **consumer's** CLAUDE.md (generated/synced by `/asd-init`). NOT this file — don't conflate: this documents the framework repo; `t_CLAUDE.md` documents a project built with it.

Flow: `/asd-sprint` → phase skill → creator/reviewer agents → artifacts into consumer's `.asd/sprints/<NNN-slug>/` and `design/`. State recovery via per-sprint `state.json`.

## Cross-file consistency (main editing hazard)

These artifacts mirror/reference each other. A change in one usually needs matching edits — verify all:

- **README.md** mirrors phase list, agent roster + model tiers, config schema, folder map. Keep synced with `.asd/rules/` and actual agent/skill files.
- **`core.md` "See also"** lists every rule doc — add/remove a rule doc → update list.
- **Reviewer verdict token**: first-line `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL`, `<phase>` = `design` or `impl`. Aggregating phase skill, `review-policy.md`, and agent file must agree.
- **Phase chain**: in `session-start.js` (`PHASE_CHAIN`), `sprint-lifecycle.md`, `core.md` glossary, README — all list the same nine phases.
- **Agent ↔ skill dispatch**: a phase skill names agents it dispatches; those agent files must exist with matching capabilities. An agent's `description` lists what it does/does NOT handle (delegating to named agents) — keep delegation targets real.
- **Template variables** `{{SPRINT}}`, `{{ITERATION}}`, `{{PHASE}}`, `{{agent:<name>}}` resolve at dispatch; use only these in skill/agent prompts.

## Conventions

- Skill files follow Agent Skills `SKILL.md` spec (frontmatter `name` + `description`; description is the trigger, must be specific).
- Templates carry `t_` prefix, live only in `.asd/templates/`.
- Rule docs terse, imperative. `.asd/rules/code-style.md` governs code written *by consumer dev agents* — not this repo.
- HTML artifact templates share the `t_html-shell.html` shell (sticky TOC sidebar); keep that structure when editing other `t_*.html`.

## Hard rules

- **Every workflow change checked against README.md.** After editing any rule/skill/agent/template/hook/config schema, update README.md if affected (phase list, agent roster, model tiers, config schema, folder map, command list) in the same change. Not complete until README.md confirmed accurate. Changing an agent's frontmatter `model:` tier requires updating the README model-tier table same change.
- Consumer agents treat `.asd/rules/`, `.asd/templates/`, `.claude/` as read-only infrastructure. Here it IS the work — but changes ripple across the framework, so make them deliberately and check every mirror above.
- **Every change must minimize runtime tokens.** Compress prose (caveman OK), drop filler/hedging, dedup to SSoT (restated facts → link to canonical home). Preserve: technical terms, exact tokens (verdict strings, phase names, placeholders), code/YAML/JSON structure. Allowed mirrors: the cross-file syncs above.
