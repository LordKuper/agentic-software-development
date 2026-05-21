# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This repo **is the ASD (Agentic Software Development) framework itself** — its source. It is not a project that *uses* ASD. There is no application code: every file is workflow infrastructure (rules, templates, agent/skill definitions, hooks). Work here means authoring or editing that infrastructure.

Do not run `/asd-sprint` or `/asd-init` to "develop" this repo — those drive a *consumer* project. The SessionStart hook will report "No active sprint"; that is expected here.

## No build / test / lint

The framework ships as Markdown, YAML, JSON, HTML, and Node hook scripts. There is no package.json, compiler, or test runner. "Verification" of a change means:

- The hooks still run clean: all must exit 0 and never throw — they are designed to fail silently.
- Edited YAML/JSON parses; edited HTML templates keep their structure.
- Cross-file consistency holds (see below).

## Architecture

ASD drives a consumer project through numerous phases per sprint.

Three layers, all under `.asd/` and `.claude/`:

- **Rules** (`.asd/rules/*.md`) — the single source of truth for workflow behavior. `core.md` is the hub and links every other rule doc. Rules are read by *all* agents. Changing a rule changes behavior everywhere.
- **Skills** (`.claude/skills/*/SKILL.md`) — 14 skills. `asd-sprint` detects the active sprint from `state.json` and dispatches the matching `asd-phase-*` skill. Phase skills dispatch agents. `asd-init`, `asd-concept`, `asd-stack`, `asd-design-system` are user-facing setup skills.
- **Agents** (`.claude/agents/*.md`) — 15 agents: 7 creators (PM, BA, UX Designer, Architect, Backend/Frontend Dev, Test Engineer) and 8 reviewers (7 internal + External Review wrapping Codex CLI). Each agent file has YAML frontmatter declaring `model`, `tools`, and `description`.
- **Templates** (`.asd/templates/t_*`) — every artifact a consumer project produces has a `t_`-prefixed template here (e.g. `t_prd.html`, `t_plan.md`, `t_state.json`).

`t_CLAUDE.md` is the template for the **consumer project's** CLAUDE.md, generated/synced by `/asd-init`. It is NOT this file and the two must not be conflated — this file documents the framework repo; `t_CLAUDE.md` documents a project built with the framework.

The flow: `/asd-sprint` → phase skill → creator/reviewer agents → artifacts written into the consumer's `.asd/sprints/<NNN-slug>/` and `design/`. State recovery is via `state.json` per sprint.

## Cross-file consistency (the main hazard when editing)

These artifacts duplicate or reference each other. A change in one usually requires matching edits elsewhere — verify all of them:

- **README.md** mirrors phase list, agent roster + model tiers, config schema, folder map, and other concepts. Keep it synced with `.asd/rules/` and the actual agent/skill files.
- **`core.md` "See also"** lists every rule doc — add/remove a rule doc, update this list.
- **Reviewer verdict token**: reviewers emit a first-line `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL` where `<phase>` is `design` or `impl`. The aggregating phase skill, `review-policy.md`, and the agent file must agree on this format.
- **Phase chain** appears in `session-start.js` (`PHASE_CHAIN`), `sprint-lifecycle.md`, `core.md` glossary, and README — all must list the same nine phases.
- **Agent ↔ skill dispatch**: a phase skill names the agents it dispatches; those agent files must exist with matching capabilities. An agent's `description` enumerates what it does and does NOT handle (delegating to named other agents) — keep delegation targets real.
- **Template variables** `{{SPRINT}}`, `{{ITERATION}}`, `{{PHASE}}`, `{{agent:<name>}}` are resolved at dispatch; use only these in skill/agent prompts.

## Conventions when authoring

- Skill files follow the Agent Skills `SKILL.md` spec (frontmatter `name` + `description`; the description is the trigger and must be specific).
- Templates carry a `t_` prefix and live only in `.asd/templates/`.
- Rule docs are terse and imperative. `.asd/rules/code-style.md` governs code written *by consumer-project dev agents* — it does not govern this repo.
- HTML artifact templates share the shell in `t_html-shell.html` (sticky TOC sidebar); keep that structure when editing other `t_*.html`.

## Hard rules

- **Every workflow change must be checked against README.md.** After editing any rule, skill, agent, template, hook, or config schema, verify whether README.md needs updating (phase list, agent roster, model tiers, config schema, folder map, command list) and update it in the same change. A workflow change is not complete until README.md is confirmed accurate.
- A consumer project's agents treat `.asd/rules/`, `.asd/templates/`, `.claude/` as read-only infrastructure. Here, that infrastructure IS the work — but changes still ripple across the whole framework, so make them deliberately and check every mirrored location above.
