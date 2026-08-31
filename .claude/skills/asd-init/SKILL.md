---
# ASD generated. Edit .asd/skills/asd-init/SKILL.md. source_digest=sha256:64eccc117a1c0ccea40305e32d2546a769e30acf4d9ec1699af0a50a7d271c35 content_digest=sha256:4ad28df35a00b561e27f1f69fb4a83f924257eae1e377af3924eac22f7e3718a asd_version=1.1.0 schema=1
name: asd-init
description: "Initializes the ASD (Agentic Software Development) workflow in a project, or edits existing ASD settings in diff mode. Auto-detects build commands and external tools, collects config via request user decision, generates .asd/project/config.yaml and seeds infrastructure-only design/ docs; concept, stack, and design system are owned by dedicated skills. Use when the user runs /asd-init or asks to set up, initialize, configure, or change ASD workflow settings."
allowed-tools: "Read Write Edit Glob Grep Bash AskUserQuestion"
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Init

## Preconditions
- Repo at project root
- Infra present: `.asd/rules/`, `.asd/templates/`, `.claude/`

## Modes
- **Fresh**: no `.asd/project/config.yaml` → full setup
- **Re-init**: config exists → diff editor

## Always first (both modes)

0. **Sync `AGENTS.md`/`CLAUDE.md` managed blocks** before any other step (see "AGENTS.md sync"). Runs unconditionally every invocation, fresh or re-init, regardless of subsequent user choices or aborts.

## Workflow (fresh)

1. Detect greenfield vs brownfield via repo search on source files
2. Request user input, batch: chat lang, docs lang, subsystem_decomposition, backward_compat, external_review
3. If decomposition enabled → request user decision: diagram_tool (`likec4` | `mermaid`)
4. Detect OS via command execution (silent; no confirm yet)
5. Detect external tools (silent; record results, do not prompt per-tool yet):
   - `likec4 --version` (only if diagram_tool=likec4)
   - designmd (always): check `node --version` and `npm --version`. Tooling invoked via `commands.yaml` (`designmd-*`); no `designmd` binary on PATH required.
   - the *other* provider's CLI, wrapped by External Review (only if external_review=enabled): probe `codex --version` when this init is running under Claude Code, `claude --version` when running under Codex (`.asd/rules/providers.md` § External review symmetry) — never probe the running host's own CLI
   Record paths and missing flags for the consolidated proposal
6. Pick review iteration defaults (low=1 medium=1 high=2 critical=10) — include in proposal, do not prompt yet
7. Pick git defaults (base_branch from `git symbolic-ref refs/remotes/origin/HEAD` or `main`; branch_pattern `sprint/<NNN>-<slug>`; gh_enabled from `gh --version`; auto_pr=false) — include in proposal
8. Auto-detect build commands from:
   - manifests: package.json scripts, Cargo.toml, pyproject.toml, go.mod, Makefile
   - code analysis: CI configs (.github/workflows, .gitlab-ci.yml, etc.), Dockerfile RUN lines, README command patterns
   Record into proposal; do not prompt per-command yet
8a. **Consolidated proposal & edit gate** — present every auto-detected/defaulted value in one structured block in `language.chat`:
    - OS, external tools (with missing flags + install hint), review iteration limits, git settings, detected build/test/lint/run commands
    Then request user decision: `accept-all` | `edit-section` | `abort`.
    - `edit-section` → request user decision on which section (os | tools | review | git | commands), collect new values, re-show proposal, loop until `accept-all`
    - Missing required tools (designmd always; likec4 if decomp+likec4; the wrapped external-review CLI if external_review) → must resolve here: install / override path / disable feature. Do NOT silently proceed with missing required tools.
    Only after `accept-all` proceed to write.
9. Write `.asd/project/config.yaml` from `t_config.yaml` with all approved fields (including `project.diagram_tool` when decomp enabled)
10. Ask user what custom rules to add (separately for common / design / coding scopes); write three files from templates: `.asd/project/custom-common-rules.md`, `custom-design-rules.md`, `custom-coding-rules.md`. Empty scope still writes template stub (header + intro), so agents always find the file.
11. Write `.asd/project/decisions-log.md` from `t_decisions-log.md`
12. Write `.asd/project/commands.yaml` (from `t_commands.yaml` + detected + OS-specific `custom.designmd-*`)
13. If decomp enabled:
    - **likec4 mode**: seed `c4/model/main.c4`, `c4/views.c4` from templates; run `likec4 build` → `c4/dist/`
    - **mermaid mode**: seed `c4/subsystems.yaml` from `t_subsystems.yaml`; render `c4/architecture.html` with initial mermaid context view
14. Append decisions-log entry ("ASD initialized for project; decomposition=X, diagram_tool=Y, OS=Z")
15. **Post-init artefact checks** — suggest dedicated skill for each missing required artefact (do NOT auto-dispatch). Order: concept → stack → design-system:
    - `design/product/concept.html` absent → suggest `/asd-concept`
    - `design/architecture/stack.html` absent → suggest `/asd-stack`
    - `design/ux/DESIGN.md` OR `design/ux/design-system.html` OR `design/ux/accessibility.html` absent → suggest `/asd-design-system`
16. Brownfield: prompt user to start sprint with audit-only scope (optional)
17. **Run sync** — invoke the sync engine (`.asd/sync.js --check`) to confirm the bundled provider-view trees (`.claude/agents`, `.claude/skills`, `.claude/hooks`, `.agents/skills`, `.codex/agents`, `.codex/hooks`) are `current` against the shipped canon. Report any `stale`/`modified-foreign` finding to the user — do not silently apply.
18. **Codex trust warning** — unconditional (every project gets a generated `.codex/hooks.json`, regardless of which provider is primary or whether external review is enabled): warn the user that Codex requires explicitly trusting this project's `.codex/hooks.json` before its hooks run (Codex refuses untrusted project-level hooks by design). Point to Codex's own trust-approval step; do not attempt to bypass it.
19. Print summary + return contract

## Workflow (re-init)

1. Read current `.asd/project/config.yaml`
2. **Dump full current config to chat** in `language.chat` before any edit prompt. Render every field as structured block. User MUST see complete current state before being asked what to change. Do NOT skip or summarise — full values verbatim.
3. Request user decision on which sections to edit
4. Per section: ask new value → add to pending change-set (do not write yet)
5. Show consolidated diff of all pending edits → request user decision: `accept-all` | `edit-section` | `abort`; loop until accepted
6. Apply diff; write config
7. Append decisions-log entry per change

## AGENTS.md sync

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

## OS-specific commands written to .asd/project/commands.yaml

Four custom commands always emitted. Linter always invoked via `designmd-lint`; `designmd-install` is session-scoped prerequisite on Windows (no-op elsewhere).

**Windows** (run from project root):
- `designmd-install: "npm install @google/design.md"`
- `designmd-lint: "node_modules\\.bin\\design.md.cmd lint design\\ux\\DESIGN.md"`
- `designmd-diff: "node_modules\\.bin\\design.md.cmd diff"` (path args supplied at call time)
- `designmd-export: "node_modules\\.bin\\design.md.cmd export --format json-tailwind design\\ux\\DESIGN.md"`

**Linux/macOS**:
- `designmd-install: ""` (no-op; `npx` fetches on demand)
- `designmd-lint: "npx @google/design.md lint design/ux/DESIGN.md"`
- `designmd-diff: "npx @google/design.md diff"`
- `designmd-export: "npx @google/design.md export --format json-tailwind design/ux/DESIGN.md"`

## Artefacts produced

- `.asd/project/config.yaml`
- `AGENTS.md`, `CLAUDE.md` (created or managed block synced from `t_AGENTS.md`/`t_CLAUDE.md`)
- `.asd/project/custom-common-rules.md`, `custom-design-rules.md`, `custom-coding-rules.md`, `decisions-log.md`
- `.asd/project/commands.yaml`
- `design/architecture/c4/` content per `diagram_tool` (decomp only)

Concept, stack, design system NOT produced here; owned by `/asd-concept`, `/asd-stack`, `/asd-design-system` respectively.

## Agents dispatched

None. Init runs solo; no sprint context yet.

## Return contract (single line)

```
INIT: <fresh|re-init> | MODE: <greenfield|brownfield> | DECOMP: <enabled|disabled> | DIAGRAM: <likec4|mermaid|n/a> | TOOLS: likec4=<ok|missing|skip|n/a> designmd=<ok|missing|skip> external_review_wrapped_cli=<ok|missing|skip|n/a>
```

Followed by file-creation summary.

## References

- Templates in `.asd/templates/`
- `.asd/rules/core.md`, `.asd/rules/artifact-layout.md`, `.asd/rules/providers.md`
- Google Labs DESIGN.md spec: https://github.com/google-labs-code/design.md
