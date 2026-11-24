<!-- asd:begin v=1 -->
### Required reading

- Every agent reads `.asd/rules/core.md`, `.asd/project/custom-common-rules.md` and `.asd/rules/language-policy.md` before any workflow action.
- Read `.asd/project/custom-design-rules.md` in design/design-review and `.asd/project/custom-coding-rules.md` in impl/impl-test/impl-review.

### Entry points

- Initialize or edit settings with `/asd-init` (Claude Code) or `$asd-init` (Codex).
- Start or resume a sprint with `/asd-sprint` (Claude Code) or `$asd-sprint` (Codex). All project work goes through a sprint. A new sprint waits for archival, except that its scope archives a merged sprint.

Host conventions and skill discovery are in `.asd/rules/providers.md`.

### Configuration

Settings are in `.asd/project/config.yaml`. For routing, paths and review, see `.asd/runtime.js`, `.asd/rules/artifact-layout.md` and `.asd/rules/external-review.md`.

### Hard rules

Keep workflow infrastructure read-only within the boundaries of `.asd/rules/core.md` "Invariants". Only user-invoked `asd-init`, declared scope/impl settings changes via `asd-init`, and limited `asd-update` release migrations may edit settings.
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
