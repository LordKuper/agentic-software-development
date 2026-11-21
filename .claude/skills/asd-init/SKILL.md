---
# ASD generated. Edit .asd/skills/asd-init/SKILL.md. source_digest=sha256:0e83c183ff327ce70c983ee5d39970c29c2d093c1039d94071abdadb765a9ef8 content_digest=sha256:2bdf3e2c46edde3cfb72853df7a01d4ab6cc62814f66e2e70861290d7e4a0998 asd_version=14.9.0 schema=1
name: asd-init
description: "Initializes the ASD (Agentic Software Development) workflow in a project, or edits existing ASD settings in diff mode, or applies a settings change an active sprint declares (in its sprint.md at scope or its plan at impl). Auto-detects build commands and external tools, collects config via request user decision, generates .asd/project/config.yaml and seeds infrastructure-only persistent docs; concept, stack, and design system are owned by dedicated skills. Use when the user runs /asd-init or asks to set up, initialize, configure, or change ASD workflow settings."
allowed-tools: "Read Write Edit Glob Grep Bash AskUserQuestion"
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Init

## Purpose

Initialize the ASD workflow (fresh), edit its settings in diff mode (re-init), or apply a sprint-declared settings change (sprint-mediated).

## Preconditions

```json
{"requires": ["repo at project root", "infra present: .asd/rules/, .asd/templates/, .claude/"]}
```

## Modes

```json
{"fresh": "no .asd/project/config.yaml: full setup", "re-init": "config exists: diff editor", "sprint-mediated": "invoked by asd-phase-impl.md step 6 with an accepted plan's Settings change: pairs (sprint-lifecycle.md Plan file format), or by asd-phase-scope.md before step 3a's freeze with the drafted sprint.md's Settings change: pairs: applies those pairs only"}
```

## Steps

### Always first

Fresh and re-init only.

0. **Determine self-hosting mode** (`self_hosting` field in `.asd/project/config.yaml`; missing, unreadable, or duplicated key → `disabled`, fail closed).
0a. **Sync `AGENTS.md`/`CLAUDE.md` managed blocks** (see "AGENTS.md sync"). Runs every fresh or re-init invocation, regardless of subsequent user choices or aborts, in both self-hosting and consumer mode — the managed block always generates from `t_AGENTS.md`/`t_CLAUDE.md` (`providers.md` ownership table). Sprint-mediated mode skips it: `config.yaml` is its only write.
0b. **Require `gh`**: run `gh --version`, then `gh auth status`. Either fails → stop before any further step, naming the fix: install gh (https://cli.github.com), or run `gh auth login`. `pr` opens and merges every sprint PR through it (`git-strategy.md` "PR creation").

### Fresh

1. Detect greenfield vs brownfield via repo search on source files
2. Request user input, batch: chat/docs language, decomposition, compatibility, external review, self-hosting, `user_gates` (`strict` default or `adaptive`), `cleanup` (`enabled` default or `disabled`), `safety_valve` (`enabled` default or `disabled`), `upstream_issues` (`enabled` default or `disabled`; propose its default under self-hosting), Claude Design and document settings. `documents.audit` is `auto|always|off` (`auto` default). `documents.design_system` gates design-system work and tokens and `documents.ux_spec` gates UX-spec docs (`sprint-lifecycle.md` "Optional documents"). For self-hosting recommend audit `auto`, other documents disabled and `diagram_tool: none`. When external review is enabled under Codex, ask for `review.codex_profile` (default empty). Write the explicit empty value if no profile is selected.
3. If decomposition enabled → request user decision: diagram_tool (`none` | `likec4` | `mermaid`); disabled → `none`
4. Detect OS via command execution (silent; no confirm yet) — selects step 12's OS-specific commands, never written to config
5. Detect external tools (silent; record results, do not prompt per-tool yet):
   - `likec4 --version` (only if diagram_tool=likec4)
   - Node (only if `documents.design_system: enabled` — the design-system gate that needs it is skipped entirely otherwise): check `node --version` and `npm --version`. Tooling invoked via `commands.yaml` (`designmd-*`); no `designmd` binary on PATH required. When `documents.design_system: disabled`, skip detection and omit the `designmd-*` custom commands entirely.
   - External Review (if `review.external_review=enabled`): run `node .asd/runtime.js external-preflight --input <path>` with the host and proposed profile/command values per `external-review.md` "Detection and negative cache". Omit `cachePath` for the init probe.
   Record the resolved command and availability for the consolidated proposal
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
8a. **Consolidated proposal & edit gate** — present every auto-detected/defaulted value in one structured block in `language.chat`:
    - All project settings, including inactive fields and empty tool paths or profile names, plus OS, tool availability, detected commands and the gate-class gaps note
    Then request user decision: `accept-all` | `edit-section` | `abort`.
    - `edit-section` → request user decision on which settings section to edit, collect new values, rerun affected tool probes, re-show proposal, loop until `accept-all`
    - Missing required tools → must resolve here: Node (if `documents.design_system: enabled`) → install or `documents.design_system: disabled`; likec4 (if diagram_tool=likec4) → install or diagram_tool `mermaid`/`none`; an unavailable external-review route → resolve the reported status (CLI install/upgrade or command override, local auth on the default route, or named profile setup). The user can clear `review.codex_profile` to select the default route or disable external review. Do NOT silently proceed with missing required tools.
    Only after `accept-all` proceed to write.
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
2a. Run the Config check. Add every missing field to the pending diff with its prior effective default where known, else the template default. Use "Optional documents" in `sprint-lifecycle.md` for legacy document defaults, including inheriting `ux_spec` when `design_system` is absent from a present group. For a missing `project.claude_design` propose `enabled` to retain the prior host-capability selection. Show proposed values and require corrections for duplicate or invalid entries. Keep all valid existing values unless the user chooses an edit.
2b. Read `.asd/project/commands.yaml`. For each of `test_paths`, `test_durations` and `checks.context` still absent, run step 8's detection (fresh) and, found, add it to the pending change-set with the shown proposal: `checks.context` also seeds `.asd/project/context-ceilings.json` when that file is absent. Never rewrite a key already present. Then name the gate-class gaps (step 8; "Gate-class gaps")
3. Request user decision (multi-select) on which sections to edit, absent fields included
4. Per section: ask new value → add to pending change-set (do not write yet)
5. Validate the proposed complete config per "Config check". Show the consolidated diff of all pending edits → request user decision: `accept-all` | `edit-section` | `abort`; loop until accepted.
6. Apply diff; write config, and the accepted `commands.yaml` additions of step 2b. Writing config alone leaves `.claude/settings.json` as it was: after a changed `git.ai_attribution`, tell the user `/asd-sync` brings it current under either value, and under `disabled` the next `/asd-sprint` start's attribution check also inserts the owned `attribution` value into `.claude/settings.json` and records it
7. If `review.external_review=enabled`, probe the selected route from the final config exactly as fresh init does; report the selected command, profile when set, and the availability status. An unavailable probe leaves the setting intact but is surfaced as the explicit runtime availability-skip reason (`external-review.md` "Detection and negative cache").

### Sprint-mediated

Plan acceptance (scope invocation: the scope gate) is the approval of record: no config dump, no section prompt, no `accept-all`.

1. Read current `.asd/project/config.yaml`
2. Validate every pair against the working-tree `.asd/templates/t_config.yaml` before any write. An earlier-wave template edit counts. Each dotted key names a leaf, and each value fits its inline enumeration or template type. Any failing pair → `FAILED` naming it.
3. Set each declared `<key>=<value>` pair (dotted path); its line takes that key's inline comment from the template, when the template line has one; touch no other field. A pair whose value and comment already match is a no-op.
4. Validate the resulting complete config per "Config check" before writing it. If undeclared fields need repair, return `FAILED` with the paths and direct the user to standalone `/asd-init`.
5. Post the diff in `language.chat`: one `<key>: <old|absent> → <new>` line per pair
6. Re-init step 7 applies when a pair touches `review.external_review`, `review.codex_profile` or `system.tools`

## Rules

- never: dispatch an agent. Init runs solo; fresh and re-init have no sprint context, sprint-mediated reads none beyond its declared pairs.
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

Run `node .asd/runtime.js config-check` against the installed config. Validate proposed YAML by passing it on stdin with `--config -`. Proceed only on exit 0. Exit 1 reports `missing`, `duplicates` and `invalid` with dotted setting paths. Exit 2 reports a command, schema or read failure.

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
SKILL: asd-init | MODE: <fresh|re-init|sprint-mediated> | REPO: <greenfield|brownfield|n/a> | DECOMP: <enabled|disabled> | DIAGRAM: <none|likec4|mermaid|n/a> | TOOLS: likec4=<ok|missing|skip|n/a> node=<ok|missing|skip|n/a> external_review_wrapped_cli=<ok|missing|skip|n/a> | STATUS: <complete|aborted> | NEXT: <asd-concept|asd-stack|asd-design-system|asd-sprint|none>
```

Sprint-mediated: `REPO` and every `TOOLS` entry its step 6 did not probe are `n/a`; `DECOMP`/`DIAGRAM` are read from the written config. `NEXT`: the first step-15 suggestion, else `asd-sprint`; sprint-mediated `none`.

Followed by file-creation summary.

## References

- Templates in `.asd/templates/`
- `.asd/rules/core.md`, `.asd/rules/artifact-layout.md`, `.asd/rules/providers.md`
- Google Labs DESIGN.md spec: https://github.com/google-labs-code/design.md
