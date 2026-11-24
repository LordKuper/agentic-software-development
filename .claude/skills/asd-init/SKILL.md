---
# ASD generated. Edit .asd/skills/asd-init/SKILL.md. source_digest=sha256:efa48f2364ef1632e6aa1b13ec321dbad1709bb2a7fdfb2bde6e6c27fe1bfb2d content_digest=sha256:10e688cd61c0ab5bfa07e850d775a115e2b17de6df8014e70b884991785b7b8a asd_version=14.11.0 schema=1
name: asd-init
description: "Initializes the ASD (Agentic Software Development) workflow in a project, or edits existing ASD settings in diff mode, or applies a settings change an active sprint declares (in its sprint.md at scope or its plan at impl). Auto-detects build commands and external tools, collects config via request user decision, generates .asd/project/config.yaml and seeds infrastructure-only persistent docs; concept, stack, and design system are owned by dedicated skills. Use when the user runs /asd-init or asks to set up, initialize, configure, or change ASD workflow settings."
allowed-tools: "Read Write Edit Glob Grep Bash AskUserQuestion"
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Init

## Purpose

Initialize ASD or edit its settings in the applicable mode.

## Preconditions

```json
{"requires": ["repo at project root", "infra present: .asd/rules/, .asd/templates/, .claude/"]}
```

## Modes

```json
{"fresh": "no .asd/project/config.yaml: full setup", "re-init": "config exists: diff editor", "sprint-mediated": "apply Settings change: pairs from asd-phase-impl.md step 6 or asd-phase-scope.md step 2b", "update-completion": "offer additions for missing paths when the user opts into asd-init from asd-update step 5"}
```

## Steps

### Always first

Fresh and re-init only.

0. **Determine self-hosting mode** (`self_hosting` field in `.asd/project/config.yaml`; missing, unreadable, or duplicated key → `disabled`, fail closed).
0a. **Sync `AGENTS.md`/`CLAUDE.md` managed blocks** per "AGENTS.md sync" before user choices or aborts.
0b. **Require `gh`**: run `gh --version`, then `gh auth status`. Either fails → stop before any further step, naming the fix: install gh (https://cli.github.com), or run `gh auth login`. `pr` opens and merges every sprint PR through it (`git-strategy.md` "PR creation").

### Fresh

1. Detect greenfield vs brownfield via repo search on source files
2. Batch input on chat/docs language, decomposition, compatibility, external review, self-hosting, `user_gates`, `cleanup`, `safety_valve`, `upstream_issues`, `project.mockup_format` and `documents.*`, with options and defaults from `t_config.yaml`. Under self-hosting propose the default for `upstream_issues`, audit `auto`, other documents disabled, `mockup_format: none` and `diagram_tool: none`. For enabled External Review under Codex ask for `review.codex_profile`, defaulting explicitly to `""`.
3. If decomposition enabled → request user decision: diagram_tool (`none` | `likec4` | `mermaid`); disabled → `none`
4. Detect OS via command execution (silent; no confirm yet) — selects step 12's OS-specific commands, never written to config
5. Detect external tools (silent; record results, do not prompt per-tool yet):
   - `likec4 --version` (only if diagram_tool=likec4)
   - `node --version` and `npm --version` only with `documents.design_system: enabled`. Use `commands.yaml` `designmd-*` entries without requiring a `designmd` binary on PATH. Omit those entries when disabled.
   - With `review.external_review=enabled`, run `node .asd/runtime.js external-preflight --input <path>` with the host and proposed profile/command per `external-review.md` "Detection and negative cache". Omit `cachePath`. Include the resolved command and availability in the proposal.
6. Pick review iteration defaults (low=1 medium=1 high=2 critical=10) — include in proposal, do not prompt yet
7. Pick git defaults (base_branch from `git symbolic-ref refs/remotes/origin/HEAD` or `main`; branch_pattern `sprint/<NNN>-<slug>`; `ai_attribution` `enabled`, or `disabled` to keep Claude/Codex attribution out of commits and PRs) — include in proposal; the `git` section edit changes any of them
8. Auto-detect build commands from:
   - manifests: package.json scripts, Cargo.toml, pyproject.toml, go.mod, Makefile
   - code analysis: CI configs (.github/workflows, .gitlab-ci.yml, etc.), Dockerfile RUN lines, README command patterns
   - native affected/changed-test selector (`test_affected` — `sprint-lifecycle.md` "Impacted
     test set"): keyed on the detected test *runner*, never on a command string. package.json
     `devDependencies`/test script naming `jest` → `jest --changedSince=<BASE_REF>`; naming `vitest`
     → `vitest run --changed <BASE_REF>`; pyproject.toml/requirements.txt naming a picked/testmon-
     style pytest plugin → that plugin's ref-based invocation. No runner match, or a matched runner
     with no such flag (e.g. a bare pytest, `dotnet test --filter`'s name-filter, Go package
     selection) → omit the field entirely; never guess a flag for an undetected/unsupported runner —
     the search-derived impacted set is the safe fallback
   - smoke command (`smoke`): a package.json script, Makefile target or `scripts/` file named `smoke`
     (or `smoke:*`/`smoke-test`) → that script's invocation. None → omit the key; never guess one
   - test layout (`test_paths`): the test directories and filename patterns found by repo search
     (`tests/`, `__tests__/`, `*.test.*`, `*_test.go`, `test_*.py`, …) → comma-separated globs.
     None found → omit; the runtime's default list applies
   - duration-reporting test form (`test_durations`): `test` plus the detected runner's flag, its
     targets and options kept — pytest `--durations=10`, jest `--verbose`, go `-v`, node's runner
     as is. No match, a wrapper `test` the flag would not reach, or unsure → omit; never guess
   - gate classes with no command (`## Reference` "Gate-class gaps"): lint or format, type check —
     name each class in which detection found no script, config or tool
   Record into proposal; do not prompt per-command yet
8a. **Consolidated proposal & edit gate** — show all settings (inactive and empty values included), OS, tool availability, detected commands and gate-class gaps in one structured `language.chat` block. Request `accept-all` | `edit-section` | `abort`. For `edit-section`, select a section, collect values, rerun affected probes and repeat. Before `accept-all`, resolve required tools: install Node or disable design-system, install LikeC4 or change the diagram tool, and resolve an unavailable External Review route per `external-review.md`. The user can clear `review.codex_profile` for the default route or disable External Review. Write only after acceptance.
9. Validate the complete proposed YAML per "Config check", then write every leaf from `t_config.yaml` with its approved value.
10. Request free-form user input: custom rules to add (separately for common / design / coding scopes); write three files from templates: `.asd/project/custom-common-rules.md`, `custom-design-rules.md`, `custom-coding-rules.md`. Empty scope still writes template stub (header + intro), so agents always find the file.
11. Write `.asd/project/stubs.md` from `t_stubs.md` (empty registry — downstream phases expect the file to exist)
12. Write `.asd/project/commands.yaml` (from `t_commands.yaml` + detected + OS-specific `custom.designmd-*` only when `documents.design_system: enabled`); `test_affected`, `smoke`, `test_paths` and `test_durations` written only when detected, omitted (not written empty/guessed) otherwise — a `.asd/project/commands.yaml` from an older ASD version without the field keeps working unchanged since the impacted set falls back to the search-derived definition. Seed the context ceilings and add the check: `node .asd/runtime.js context-check --seed` (writes `.asd/project/context-ceilings.json`), then `checks.context: "node .asd/runtime.js context-check"`
13. If decomp enabled: write an empty registry `docs/architecture/subsystems.md` from `t_subsystems.md` (no rows, no diagram) when absent — the main orchestrator fills it (`artifact-layout.md` "Subsystem registry"). Only if `diagram_tool` is not `none`:
    - **likec4 mode**: seed `c4/model/main.c4`, `c4/views.c4` from templates. Seed `commands.yaml` with a `c4-build: "likec4 build docs/architecture/c4 --output docs/architecture/c4/dist"` build-to-view command — `dist/` itself is gitignored, not built here
    - **mermaid mode**: seed nothing more — the diagram lives in `subsystems.md`; no `c4/`, no `c4-build`
14. If decomp and likec4 mode: **seed `.gitignore`** for C4 build output — append (never clobber existing entries; create the file if absent) `docs/architecture/c4/dist/` if not already present
15. **Post-init artefact checks** — suggest dedicated skill for each missing required artefact (do NOT auto-dispatch). Order: concept → stack → design-system:
    - `docs/product/concept.html` absent → suggest `/asd-concept`
    - `docs/architecture/stack.html` absent → suggest `/asd-stack`
    - `docs/ux/DESIGN.md` OR `docs/ux/design-system.html` OR `docs/ux/accessibility.html` absent → suggest `/asd-design-system`
16. Brownfield: request user decision: start a sprint with audit-only scope | skip
17. **Run sync** — invoke the sync engine (`.asd/sync.js --check`) to confirm the bundled provider-view trees (`.claude/agents`, `.claude/skills`, `.claude/hooks`, `.agents/skills`, `.codex/agents`, `.codex/hooks`) are `current` against the shipped canon. Report any `stale`/`modified-foreign` finding to the user — do not silently apply.
18. **Codex trust warning** — unconditional (every project gets a generated `.codex/hooks.json`, regardless of which provider is primary or whether external review is enabled): warn the user that Codex requires explicitly trusting this project's `.codex/hooks.json` before its hooks run (Codex refuses untrusted project-level hooks by design). Point to Codex's own trust-approval step; do not attempt to bypass it.
19. Print summary + Return

### Re-init

1. Read current `.asd/project/config.yaml`
2. **Dump full current config to chat** in `language.chat` before any edit prompt. Render every field as structured block. Do NOT skip or summarise — full values verbatim.
2a. Run "Config check" and propose "Missing settings". Require repair of invalid or duplicate entries. Keep valid values unless the user edits them.
2b. Read `.asd/project/commands.yaml`. For each of `test_paths`, `test_durations` and `checks.context` still absent, run step 8's detection (fresh) and, found, add it to the pending change-set with the shown proposal: `checks.context` also seeds `.asd/project/context-ceilings.json` when that file is absent. Never rewrite a key already present. Then name the gate-class gaps (step 8; "Gate-class gaps")
3. Request user decision (multi-select) on which sections to edit, absent fields included
4. Collect and queue new values by section. Offer the four mockup formats independently of `ux_spec`, preselecting the effective value per `sprint-lifecycle.md` "Optional documents". Write the selection as `project.mockup_format` and remove the legacy key if present.
5. Validate the proposed complete config per "Config check". Show the consolidated diff of all pending edits → request user decision: `accept-all` | `edit-section` | `abort`; loop until accepted.
6. Apply diff; write config, and the accepted `commands.yaml` additions of step 2b. Writing config alone leaves `.claude/settings.json` as it was: after a changed `git.ai_attribution`, tell the user `/asd-sync` brings it current under either value, and under `disabled` the next `/asd-sprint` start's attribution check also inserts the owned `attribution` value into `.claude/settings.json` and records it
7. With `review.external_review=enabled`, apply fresh step 5's probe to the final config. Report command, profile if set, and status. Keep the setting if unavailable and report its runtime skip reason.

### Sprint-mediated

Plan acceptance (scope invocation: the scope gate) is the approval of record: no config dump, no section prompt, no `accept-all`.

1. Read current `.asd/project/config.yaml`
2. Validate every pair against the working-tree `.asd/templates/t_config.yaml` before any write. An earlier-wave template edit counts. Each dotted key names a leaf, and each value fits its inline enumeration or template type. Any failing pair → `FAILED` naming it.
3. Set each declared `<key>=<value>` pair (dotted path); its line takes that key's inline comment from the template, when the template line has one; touch no other field. A pair whose value and comment already match is a no-op.
4. Validate the resulting complete config per "Config check" before writing it. If undeclared fields need repair, return `FAILED` with the paths and direct the user to standalone `/asd-init`.
5. Post the diff in `language.chat`: one `<key>: <old|absent> → <new>` line per pair
6. Re-init step 7 applies when a pair touches `review.external_review`, `review.codex_profile` or `system.tools`

### Update completion

1. Read the installed config and template. Use "Config check" to confirm which passed paths are still missing. If none remain, stop. Otherwise apply "Missing settings" to those paths and show only the proposed additions.
2. Validate the proposed complete YAML per "Config check". If existing entries still need repair, report their paths and direct the user to standalone `/asd-init`. For a valid proposal request `accept-all` | `edit-missing-values` | `abort`; repeat this step for edits.
3. On acceptance, insert exactly the approved missing leaves and any needed parent mappings. If the config or template changed during approval, re-check and obtain approval for the current proposal. Configuration is this mode's only write.

## Rules

- never: dispatch an agent. Only sprint-mediated mode reads sprint input, limited to declared pairs.
- never: produce concept, stack or design system; owned by `/asd-concept`, `/asd-stack`, `/asd-design-system` respectively.

## Delegates

```json
{"agents": [], "skills": []}
```

## Outputs

```json
[".asd/project/config.yaml", "AGENTS.md, CLAUDE.md managed blocks (step 0a)", ".asd/project/custom-common-rules.md, custom-design-rules.md, custom-coding-rules.md, stubs.md", ".asd/project/commands.yaml, .asd/project/context-ceilings.json (step 12)", "docs/architecture/subsystems.md, empty (decomp only)", "docs/architecture/c4/ likec4 seed (decomp + likec4 only)", ".gitignore likec4 build-output entry (step 14)"]
```

## Reference

### Config check

Run `node .asd/runtime.js config-check` on installed config, or add `--config -` and pipe proposed YAML. Accept exit 0 only. Exit 1 lists `missing`, `duplicates` and `invalid` dotted paths. Exit 2 reports command, schema or read failure.

Validate both mockup keys when present. `project.mockup_format` accepts the four template values. A valid legacy-only config remains accepted. Resolve its effective value per `sprint-lifecycle.md` "Optional documents".

### Missing settings

Propose prior effective values for missing document and mockup fields per `sprint-lifecycle.md` "Optional documents". For other missing leaves propose installed template defaults. Offer only values allowed by the template and "Config check".

### AGENTS.md sync

Idempotent, ownership-class **managed block** (`.asd/rules/providers.md` ownership table). Uses the sync engine's managed-block functions (`.asd/sync.js`: `findManagedBlock`, `statusManagedBlock`, `applyManagedBlock`) — do not hand-roll marker parsing.

- `AGENTS.md` at repo root: managed-block body = verbatim contents of `.asd/templates/t_AGENTS.md`. Block delimited by `<!-- asd:begin v=1 -->` / `<!-- asd:end -->`.
- `CLAUDE.md` at repo root: managed-block body = verbatim contents of `.asd/templates/t_CLAUDE.md` (thin — just an `@AGENTS.md` import). Same block markers, same mechanism.

Algorithm (per file, both files every run):

1. Compute status via `statusManagedBlock(targetPath, relKey, templateBody, syncState)` → `missing | modified-foreign | current | stale`.
2. `missing` → `applyManagedBlock` creates the file (or appends the block to an existing foreign file, preserving all its other content byte-for-byte).
3. `stale` → `applyManagedBlock` replaces only the block body, in place, leaving everything outside the markers untouched.
4. `current` → no-op.
5. `modified-foreign` (block exists but `.asd/sync-state.json` holds no matching record, or its recorded digest doesn't match — someone hand-edited inside the block) → STOP, request user decision: `overwrite` (accept sync's version) | `keep-local` (record current content as the new baseline) | `abort`. Never silently overwrite a hand-edit.

Rules:
- Never touch content outside the block markers.
- Record the applied block's digest in `.asd/sync-state.json` after every write (this is what lets step 1 detect a later hand-edit).

### Gate-class gaps

Per deterministic gate class detection found no command for (lint or format; type check), tell the user in `language.chat`: the class is absent, and a sprint whose scope adopts the gates does it, per dev-quality-gates `docs/adopt.md` (https://github.com/mokevnin/dev-quality-gates/blob/main/docs/adopt.md). Init installs nothing and writes no command for the class.

### OS-specific commands written to .asd/project/commands.yaml

Four custom commands emitted only when `documents.design_system: enabled` (else omitted entirely — no design-system gate to serve them). Linter always invoked via `designmd-lint`; `designmd-install` is session-scoped prerequisite on Windows, a no-save install that never changes `package.json` (no-op elsewhere).

**Windows** (run from project root):
- `designmd-install: "npm install --no-save @google/design.md"`
- `designmd-lint: "node_modules\\.bin\\design.md.cmd lint docs\\ux\\DESIGN.md"`
- `designmd-diff: "node_modules\\.bin\\design.md.cmd diff"` (path args supplied at call time)
- `designmd-export: "node_modules\\.bin\\design.md.cmd export --format json-tailwind docs\\ux\\DESIGN.md"`

**Linux/macOS**:
- `designmd-install: ""` (no-op; `npx` fetches on demand)
- `designmd-lint: "npx @google/design.md lint docs/ux/DESIGN.md"`
- `designmd-diff: "npx @google/design.md diff"`
- `designmd-export: "npx @google/design.md export --format json-tailwind docs/ux/DESIGN.md"`

## Return

```
SKILL: asd-init | MODE: <fresh|re-init|sprint-mediated|update-completion> | REPO: <greenfield|brownfield|n/a> | DECOMP: <enabled|disabled> | DIAGRAM: <none|likec4|mermaid|n/a> | TOOLS: likec4=<ok|missing|skip|n/a> node=<ok|missing|skip|n/a> external_review_wrapped_cli=<ok|missing|skip|n/a> | STATUS: <complete|aborted> | NEXT: <asd-concept|asd-stack|asd-design-system|asd-sprint|none>
```

Sprint-mediated and update completion: `REPO` and unprobed `TOOLS` are `n/a`, `NEXT: none`. Read `DECOMP`/`DIAGRAM` from config. Other modes take the first step-15 suggestion, else `asd-sprint`.

Followed by file-creation summary.

## References

- Templates in `.asd/templates/`
- `.asd/rules/core.md`, `.asd/rules/artifact-layout.md`, `.asd/rules/providers.md`
- Google Labs DESIGN.md spec: https://github.com/google-labs-code/design.md
