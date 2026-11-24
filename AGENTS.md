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

External Review uses the other provider's CLI by default. With Codex as the main harness, `review.codex_profile` selects a separate Codex profile. The selected CLI's `system.tools` command override applies to both the probe and the review (`.asd/rules/external-review.md`).

### Folder structure

Authoritative path map: `.asd/rules/artifact-layout.md`.

When subsystem decomposition is enabled (`project.subsystem_decomposition`), persistent docs are organized per subsystem.

### Rule docs (`.asd/rules/`)

`core.md` "See also" indexes every rule doc with its scope — not restated here.

### Hard rules

- Never modify workflow infrastructure (`.asd/rules/`, `.asd/templates/`, generated agent/skill/hook trees). Only `/asd-init`/`$asd-init` edits settings — run by the user, or by `scope`/`impl` for a sprint- or plan-declared settings change — or by a release migration `/asd-update`/`$asd-update` runs, limited to release-mandated key renames and removals, plus the value mappings, key insertions and shipped-comment rewrites that carry a renamed or removed key's or value's intent.
- All project work flows through `/asd-sprint`/`$asd-sprint`. No ad-hoc edits to project code outside a sprint.
- One active sprint at a time. New sprint blocked until active one archived, except a merged sprint, which the next sprint's scope archives.
<!-- asd:end -->

## This repo (framework source)

ASD develops its own workflow infrastructure here with `self_hosting: enabled`. This tail overrides the managed block where they conflict. `.asd/rules/sprint-lifecycle.md` "Self-hosting" defines the canonical write allowlist and sync timing. `asd-update` is consumer-only. The lean document profile lives in `.asd/project/config.yaml`; apply the lifecycle's "Optional documents" rules.

### Source and generated views

- Edit canonical sources. Generated `.claude/`, `.codex/`, `.agents/skills/` and full-file ownership markers stay read-only. Sync owns this file's managed block from `.asd/templates/t_AGENTS.md`; the tail is author-owned.
- The orchestrator syncs once per wave or fix round with `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <generated-view-path...>`. Dev agents never run `--apply`. See `providers.md` for the provider map, invocation conventions and role-scoped context.
- `.asd/skills/asd-phase-*/SKILL.md` are discovery shims. Orchestration and shared agent Rules live in `.asd/workflows/asd-phase-*.md`. Keep canonical agent, skill and workflow bodies provider-neutral. Use semantic operations and the dispatch placeholders in `core.md`. Codex loads project skills from `.agents/skills/`.

### Verification

- Per `.asd/project/commands.yaml`, build is `node .asd/sync.js --check` and lint is `git diff --cached --check`. Dev runs both before COMPLETED.
- The zero-dependency suite `node tests/run.js` must pass for all canonical edits. Pass `<area>…` for `tests/<area>.test.js` or `--filter <name>` to select tests. Shared helpers live in `tests/lib.js`. Hooks exit 0 and fail silently. Edited YAML/JSON must parse, and HTML templates must preserve their structure.

### Cross-file consistency

- Add or remove a rule doc in `core.md` "See also". Agree on `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL` in the agent, workflow and `review-policy.md`, using `design` or `impl` for the phase.
- Keep every phase-chain mirror in workflow order per `.asd/workflows/<name>.json` and `sprint-lifecycle.md` "Workflows". `tests/contract-workflows.test.js` and `tests/contract-templates.test.js` check machine-facing mirrors. Search and update affected prose too.
- Match phase dispatches to actual agents and their grants. An agent description (≤300 chars, generated variant suffixes exempt) reads `<what it does>; <phase/dispatch purpose>. Not: <x> → <agent>; …`. Keep delegation targets real.
- In `.asd/release-manifest.json`, list every update-managed canonical path in `managed_paths`. Keep `model_families` aligned with the `providers.md` table. New render-source agents or skills need `canon_hashes`; non-render canon uses `managed_paths` and `upstream_hashes`.

### Conventions

- Skill and agent definitions use fenced JSON frontmatter with `name`, specific `description` and provider config under `claude`/`codex`. Use model family aliases in canon. Generated task variants share the role body and grants.
- Place `t_*` templates in `.asd/templates/`. API contracts and other Complication Approval fold targets use the persistent doc that absorbs them. HTML artifacts share `t_html-shell.html`, with conditional sticky TOC and Mermaid script in a self-contained file.
- Write terse, imperative rules. `.asd/rules/code-style.md` also governs this framework's Node sources and tests.

### Hard rules (in addition to the block's)

- Check README.md on every workflow change. Update affected phase lists, agent roster, both providers' model tiers, config schema, folder map and commands in the same change. Any agent model-tier change updates the README table.
- Minimize runtime tokens per `artifact-layout.md` "Documentation economy". Only the cross-file contracts above and README's required mirrors may duplicate information.
