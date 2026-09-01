<!-- asd:begin v=1 -->
# AGENTS.md

Guidance for coding agents in this repo.

## What this repo is

This repo **IS the ASD (Agentic Software Development) framework** — its source, not a project that *uses* ASD. No application code: every file is workflow infrastructure (rules, templates, agent/skill defs, hooks). Work = authoring/editing that infrastructure.

This repo **self-hosts**: `.asd/project/config.yaml` sets `self_hosting: enabled`, so `/asd-sprint` develops ASD itself, dispatching normally through the ten phases. `documents.*` here is a lean profile (`audit: enabled`, `prd`/`ux_spec`/`adr`/`c4` disabled) — no PRD/UX-spec/ADR churn for a framework whose spec already lives in `.asd/rules/`; `plan`/`impl`/`impl-test`/`impl-review`/`pr` still run in full. In self-hosting mode, `impl`'s normal "infrastructure is read-only during sprint work" rule (`core.md`) lifts for exactly the canonical paths named in `.asd/rules/sprint-lifecycle.md` "Self-hosting" — generated `.claude/`, `.codex/`, `.agents/skills/` stay read-only always, resynced via `.asd/sync.js --apply` after every canon edit. `asd-init`/`sync.js` never replace this file's managed block from `t_AGENTS.md` while self-hosting (`providers.md` ownership table) — it stays self-sourced, hand-edited framework-dev prose like the rest of this document. `/asd-update` refuses to run here (it pulls framework files INTO a consumer; this repo IS the framework).

## No build / test / lint

Ships as Markdown, YAML, JSON, HTML, Node hook scripts. No package.json, compiler, or build step. `tests/run.js` is a real zero-dependency test runner, but it only covers `.asd/sync.js`/`update.js` (the sync engine) — it does not test rules/agents/skills/templates content. "Verification" of a change:

- `node tests/run.js` stays green for anything touching `.asd/sync.js` or `.asd/skills/asd-update/update.js`.
- Hooks run clean: exit 0, never throw (designed to fail silently).
- Edited YAML/JSON parses; edited HTML templates keep structure.
- Cross-file consistency holds (below).

## Architecture

ASD drives a consumer project through phases per sprint, for **both Claude Code and Codex** from one canonical source under `.asd/`. `.asd/sync.js` generates each provider's own view (`.claude/`, `.codex/`, `.agents/skills/`) and keeps them in sync (`--check`/`--apply`); see `.asd/rules/providers.md` for the canonical/provider path map and the semantic-operation → host-tool mapping.

- **Rules** (`.asd/rules/*.md`) — SSoT for workflow behavior. `core.md` is the hub, links every other rule doc. Read by *all* agents on both providers; changing a rule changes behavior everywhere.
- **Skills** (`.asd/skills/<name>/SKILL.md`, canonical) — 17. JSON frontmatter (`name`, `description`, optional `claude`/`codex` blocks). `asd-sprint` detects active sprint from `state.json`, dispatches matching `asd-phase-*` skill. The 10 `asd-phase-*` skills are thin triggers delegating to `.asd/workflows/asd-phase-*.md` (the actual orchestration, extracted so it isn't duplicated per provider). `asd-init`, `asd-concept`, `asd-stack`, `asd-design-system` = user-facing setup; `asd-update` (bundles `update.js`) pulls latest framework files into a consumer per `.asd/release-manifest.json`'s `managed_paths`; `asd-sync` reconciles a consumer's generated provider views against canon. Generated to `.claude/skills/<name>/SKILL.md` (Claude) and `.agents/skills/<name>/SKILL.md` (Codex — NOT `.codex/`, Codex only reads project skills from `.agents/skills/`).
- **Agents** (`.asd/agents/*.md`, canonical) — 15: 7 creators (PM, BA, UX Designer, Architect, Backend/Frontend Dev, Test Engineer), 8 reviewers (7 internal + External Review, each wrapping the *other* provider's CLI). JSON frontmatter: `name`, `description`, `claude: {model, effort, tools, ...}`, `codex: {model, model_reasoning_effort, sandbox_mode}` — `model` is a family alias (fable/opus/sonnet/haiku for claude; sol/terra/luna for codex), resolved to a real id via `.asd/release-manifest.json`'s `model_families` table. Reviewers are read-only on both providers (no `Write`/`Edit`/`Bash` in `tools`; `sandbox_mode: "read-only"`) — a reviewer returns its verdict as final text, the dispatching phase workflow writes the review file. Generated to `.claude/agents/*.md` (Claude) and `.codex/agents/*.toml` (Codex).
- **Templates** (`.asd/templates/t_*`) — every consumer artifact has a `t_`-prefixed template (e.g. `t_prd.html`, `t_plan.md`, `t_state.json`, `t_AGENTS.md`).

`t_AGENTS.md` (+ thin `t_CLAUDE.md`, just a `@AGENTS.md` import) = templates for the **consumer's** `AGENTS.md`/`CLAUDE.md` (generated/synced by `/asd-init`). NOT this file — don't conflate: this documents the framework repo; `t_AGENTS.md` documents a project built with it. Canonical bodies (agents, skills, workflows) are provider-neutral — no host-tool names, no `@`-imports (Codex doesn't support them, plain concatenation only) — written as semantic operations mapped per-provider in `providers.md`.

Flow: `/asd-sprint`(Claude)/`$asd-sprint`(Codex) → phase skill → workflow → creator/reviewer agents → artifacts into consumer's `.asd/sprints/<NNN-slug>/` and `docs/`. State recovery via per-sprint `state.json`.

## Cross-file consistency (main editing hazard)

These artifacts mirror/reference each other. A change in one usually needs matching edits — verify all:

- **README.md** mirrors phase list, agent roster + model tiers (both Claude and Codex columns), config schema, folder map. Keep synced with `.asd/rules/` and actual agent/skill files.
- **`core.md` "See also"** lists every rule doc — add/remove a rule doc → update list.
- **Reviewer verdict token**: first-line `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL`, `<phase>` = `design` or `impl`. Aggregating phase workflow, `review-policy.md`, and agent file must agree.
- **Phase chain**: in `session-start.js` (`PHASE_CHAIN`), `sprint-lifecycle.md`, `core.md` glossary, README — all list the same ten phases.
- **Agent ↔ skill/workflow dispatch**: a phase workflow names agents it dispatches; those agent files must exist with matching capabilities. An agent's `description` lists what it does/does NOT handle (delegating to named agents) — keep delegation targets real.
- **Template variables** `{{SPRINT}}`, `{{ITERATION}}`, `{{PHASE}}`, `{{agent:<name>}}` resolve at dispatch; use only these in skill/agent/workflow bodies.
- **`.asd/release-manifest.json`**: `managed_paths` must list every canonical tree/file update.js should track; `model_families` mirrors `providers.md`'s table; a new canonical source needs a `canon_hashes` entry.

## Conventions

- Skill/agent files use JSON frontmatter (not YAML) between `---` fences — `name`/`description` required, provider-specific config under `claude`/`codex` keys. Description is the trigger, must be specific.
- Templates carry `t_` prefix, live only in `.asd/templates/`.
- Rule docs terse, imperative. `.asd/rules/code-style.md` governs code written *by consumer dev agents* — not this repo.
- HTML artifact templates share the `t_html-shell.html` shell (sticky TOC sidebar); keep that structure when editing other `t_*.html`.
- Never hand-edit a generated file (`.claude/`, `.codex/`, `.agents/skills/`, or a full-file target's ownership-marker comment) — edit its `.asd/` canonical source and run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <file...>` (self-locating — a bare relative path only resolves from the repo root).

## Hard rules

- **Every workflow change checked against README.md.** After editing any rule/skill/agent/workflow/template/hook/config schema, update README.md if affected (phase list, agent roster, model tiers — both providers, config schema, folder map, command list) in the same change. Not complete until README.md confirmed accurate. Changing an agent's frontmatter `model`/`codex.model` tier requires updating the README model-tier table same change.
- Consumer agents treat `.asd/rules/`, `.asd/templates/`, `.claude/`, `.codex/`, `.agents/skills/` as read-only infrastructure. Here it IS the work — but changes ripple across the framework (and across both provider views), so make them deliberately, run `node .asd/sync.js --apply <file...>` after editing canon, and check every mirror above.
- **Every change must minimize runtime tokens.** Compress prose (caveman OK), drop filler/hedging, dedup to SSoT (restated facts → link to canonical home). Preserve: technical terms, exact tokens (verdict strings, phase names, placeholders), code/YAML/JSON structure. Allowed mirrors: the cross-file syncs above.
<!-- asd:end -->
