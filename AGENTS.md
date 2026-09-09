<!-- asd:begin v=1 -->
### Core rules

Read `.asd/rules/core.md` before any workflow action (model, interaction protocol, invariants). Codex does not support `@file` imports (plain concatenation only, `project_doc_max_bytes` capped) — this is a "read the file" instruction for every agent/provider, not an automatic include.

### Project-specific rules

Read `.asd/project/custom-common-rules.md` — universal, every agent, every phase.

Phase-scoped rules (read per phase, not globally): `.asd/project/custom-design-rules.md` (design / design-review), `.asd/project/custom-coding-rules.md` (impl / impl-test / impl-review).

### Language policy

Read `.asd/rules/language-policy.md`.

### Slash commands / skills

Invocation form differs per provider — same skill either way:

| Skill | Claude Code | Codex |
|---|---|---|
| Initialize workflow or edit settings | `/asd-init` | `$asd-init` |
| Start new sprint or continue active one | `/asd-sprint` | `$asd-sprint` |

Codex also supports `/skills` (picker) and implicit invocation by matching the skill's description; see `.asd/rules/providers.md` for the full semantic-operation → host-convention map.

### Configuration

Workflow settings: `.asd/project/config.yaml`.

Deterministic routing, external readiness and coverage validation: `.asd/runtime.js`.

External Review wraps the other provider's CLI. `system.tools.codex_command` (Claude Code) and `system.tools.claude_command` (Codex) override PATH lookup; an unavailable resolved command is recorded as an explicit review skip.

### Folder structure

Authoritative path map: `.asd/rules/artifact-layout.md`.

When subsystem decomposition is enabled (`project.subsystem_decomposition`), persistent docs are organized per subsystem.

### Rule docs (`.asd/rules/`)

`core.md` "See also" indexes every rule doc with its scope — not restated here.

### Hard rules

- Never modify workflow infrastructure (`.asd/rules/`, `.asd/templates/`, generated agent/skill/hook trees). Only `/asd-init`/`$asd-init` edits settings.
- All project work flows through `/asd-sprint`/`$asd-sprint`. No ad-hoc edits to project code outside a sprint.
- One active sprint at a time. New sprint blocked until active one archived.
<!-- asd:end -->

## This repo (framework source) — deltas from the block above

The block above is synced from `.asd/templates/t_AGENTS.md` and applies here in full: this repo is also a project developed with ASD. Everything below states only what differs or what the block does not cover. On conflict, this section wins.

### What this repo is

This repo **IS the ASD (Agentic Software Development) framework** — its source, not a project that *uses* ASD. No application code: every file is workflow infrastructure (rules, templates, agent/skill defs, hooks). Work = authoring/editing that infrastructure.

`self_hosting: enabled`, so `/asd-sprint` develops ASD itself, dispatching normally through the eleven phases. `documents.*` is a lean profile (`audit: auto`, `prd`/`ux_spec`/`adr`/`c4` disabled) — no PRD/UX-spec/ADR churn for a framework whose spec already lives in `.asd/rules/`; `plan`/`impl`/`impl-test`/`impl-review`/`retro`/`pr` still run in full. `/asd-update` refuses to run here (it pulls framework files INTO a consumer; this repo IS the framework).

### Override: infrastructure is the work, not read-only

The block's "never modify workflow infrastructure" hard rule is **lifted** for exactly the canonical paths named in `.asd/rules/sprint-lifecycle.md` "Self-hosting" — editing them IS the work here. Unchanged: generated `.claude/`, `.codex/`, `.agents/skills/` (and any full-file target's ownership-marker comment) stay read-only always. Never hand-edit a generated file — edit its `.asd/` canonical source, then run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <generated-view-path...>` (pass generated view paths, never `.asd/` canon: `.claude/agents/<name>.md`, `.codex/agents/<name>.toml`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`) — the absolute form is self-locating, a bare relative path only resolves from the repo root. Canon changes ripple across the framework and across both provider views, so make them deliberately and check every mirror in "Cross-file consistency" below.

Root `AGENTS.md`'s managed block is generated from `t_AGENTS.md` exactly as in any consumer project; this repo's own prose lives below `<!-- asd:end -->`, where sync never reaches it.

### No build / lint; one test suite

Ships as Markdown, YAML, JSON, HTML, Node hook scripts. No package.json, compiler, or build step. `tests/run.js` is a real zero-dependency test runner covering both the Node sources (`.asd/sync.js`, `update.js`, `.asd/migrations/**`, hooks) and content contracts in rule docs, README, templates, skills and workflows (phase-chain mirrors, template section shapes, file sets). "Verification" of a change:

- `node tests/run.js` stays green for any canonical edit — Node source, rule doc, README, template, skill, workflow, hook.
- Hooks run clean: exit 0, never throw (designed to fail silently).
- Edited YAML/JSON parses; edited HTML templates keep structure.
- Cross-file consistency holds (below).

### Architecture

ASD drives a consumer project through phases per sprint, for **both Claude Code and Codex** from one canonical source under `.asd/`. `.asd/sync.js` generates each provider's own view and keeps it in sync (`--check`/`--apply`). Path map, semantic-operation → host-tool mapping, orphan-detection contract and model-family table: `.asd/rules/providers.md`.

- **Rules** (`.asd/rules/*.md`) — SSoT for workflow behavior; `core.md` is the hub. Which rules a role loads: `providers.md` "Role-scoped context".
- **Skills** (`.asd/skills/<name>/SKILL.md`, canonical) — the 11 `asd-phase-*` skills are thin triggers delegating to `.asd/workflows/asd-phase-*.md`, which hold the orchestration so it is not duplicated per provider. Codex reads project skills only from `.agents/skills/`, never `.codex/`.
- **Agents** (`.asd/agents/*.md`, canonical) — 11: 5 creators (BA, UX, Architect, Dev, Tester), 5 reviewers (4 internal + External Review), 1 advisor. The main orchestrator is a role, not a spawned agent. Task variants are generated from declared tier metadata, sharing the canonical role body and permissions. `model` is a family alias resolved to a concrete ID only by `.asd/release-manifest.json`'s `model_families`; never put a concrete ID in canon.
- **Templates** (`.asd/templates/t_*`) — deliberate exceptions with no template: API contracts and other Complication-Approval fold targets (folded into whichever persistent doc absorbs them, per `sprint-lifecycle.md` "Design-promote phase").

Canonical bodies (agents, skills, workflows) are provider-neutral — no host-tool names, no `@`-imports (Codex doesn't support them, plain concatenation only) — written as semantic operations mapped per-provider in `providers.md`.

### Cross-file consistency (main editing hazard)

These artifacts mirror/reference each other. A change in one usually needs matching edits — verify all:

- **README.md** mirrors phase list, agent roster + model tiers (both Claude and Codex columns), config schema, folder map. Keep synced with `.asd/rules/` and actual agent/skill files.
- **`core.md` "See also"** lists every rule doc — add/remove a rule doc → update list.
- **Reviewer verdict token**: first-line `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL`, `<phase>` = `design` or `impl`. Aggregating phase workflow, `review-policy.md`, and agent file must agree.
- **Phase chain**: every chain assertion names the same eleven phases in the same order. `tests/run.js` §16 machine-checks the mirrors it reaches (`PHASE_CHAIN`, skill/workflow file set, workflow `NEXT:`, rule-doc chain lines, README table/flowchart/count words); for prose it cannot reach, grep the phase names and update every hit together.
- **Agent ↔ skill/workflow dispatch**: a phase workflow names agents it dispatches; those agent files must exist with matching capabilities. An agent's `description` lists what it does/does NOT handle (delegating to named agents) — keep delegation targets real.
- **Template variables** `{{SPRINT}}`, `{{ITERATION}}`, `{{PHASE}}`, `{{agent:<name>}}` resolve at dispatch; use only these in skill/agent/workflow bodies.
- **`.asd/release-manifest.json`**: `managed_paths` must list every canonical tree/file update.js should track; `model_families` mirrors `providers.md`'s table; a new canonical agent or skill (the render sources `computeCanonHashes` walks) needs a `canon_hashes` entry — non-render canon (e.g. `.asd/migrations/`) is tracked via `managed_paths` + `upstream_hashes` only, no `canon_hashes` entry.

### Conventions

- Skill/agent files use JSON frontmatter (not YAML) between `---` fences — `name`/`description` required, provider-specific config under `claude`/`codex` keys. Description is the trigger, must be specific.
- Templates carry `t_` prefix, live only in `.asd/templates/`.
- Rule docs terse, imperative. `.asd/rules/code-style.md` governs code written by consumer dev agents AND this repo's own Node code (`.asd/sync.js`, `update.js`, `.asd/migrations/**`, `tests/run.js`, hooks) — no exemption for framework code.
- HTML artifact templates share the `t_html-shell.html` shell (sticky TOC sidebar, conditionally trimmed below a section-count threshold; mermaid script likewise conditional on diagram presence — self-contained single file, no sibling stylesheet); keep that structure when editing other `t_*.html`.

### Hard rules (in addition to the block's)

- **Every workflow change checked against README.md.** After editing any rule/skill/agent/workflow/template/hook/config schema, update README.md if affected (phase list, agent roster, model tiers — both providers, config schema, folder map, command list) in the same change. Not complete until README.md confirmed accurate. Changing an agent's frontmatter `model`/`codex.model` tier requires updating the README model-tier table same change.
- **Every change must minimize runtime tokens** — `.asd/rules/artifact-layout.md` "Documentation economy" holds the exclusions, the three tests and the preserve-list. Repo-local addition: the cross-file syncs above are the only mirrors it permits.
