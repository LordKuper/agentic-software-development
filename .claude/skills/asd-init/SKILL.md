---
name: asd-init
description: "Initializes the ASD (Agentic Software Development) workflow in a project, or edits existing ASD settings in diff mode. Detects greenfield vs brownfield, asks the user for languages (chat and docs), subsystem decomposition mode, diagram tool (LikeC4 vs Mermaid), backward compatibility policy, operating system, external tool availability (LikeC4 CLI, design.md CLI, Codex CLI), git strategy, and review iteration limits. Auto-detects build/test/lint/run commands from manifests and code analysis. Generates .asd/config.yaml, .asd/project/custom-rules.md, .asd/project/decisions-log.md, and seeds design/ persistent docs (concept.html, stack.html, commands.yaml with OS-specific design.md lint command, DESIGN.md, design-system.html, accessibility.html, and either LikeC4 model or Mermaid subsystem registry). Use when the user runs /asd-init or asks to set up, initialize, configure, or change ASD workflow settings."
metadata:
  asd-role: init
  version: "0.1"
allowed-tools: "Read Write Edit Glob Grep Bash WebFetch AskUserQuestion"
---

# ASD Init

## Preconditions
- Repo at project root
- Infra present: `.asd/rules/`, `.asd/templates/`, `.claude/`, `CLAUDE.md`

## Modes
- **Fresh**: no `.asd/config.yaml` → full setup
- **Re-init**: config exists → diff editor

## Workflow (fresh)

1. Detect greenfield vs brownfield via Glob on source files
2. AskUserQuestion batch: chat lang, docs lang, subsystem_decomposition, backward_compat, external_review
3. If decomposition enabled → AskUserQuestion: diagram_tool (`likec4` | `mermaid`)
4. Detect OS via Bash; confirm with user
5. Detect external tools:
   - `likec4 --version` (only if diagram_tool=likec4)
   - designmd (always):
     - **Windows**: only `designmd` alias works (`.md` file association blocks `npx @google/design.md`); if missing → ask user to install alias
     - **Linux/macOS**: try `designmd --version`; fall back to `npx @google/design.md --version`
   - `codex --version` (only if external_review=enabled)
   Record paths; offer override if missing
6. Ask review iteration limits (defaults: low=1 medium=1 high=2 critical=10)
7. Ask git settings (base_branch, branch_pattern, gh_enabled, auto_pr)
8. Auto-detect build commands from:
   - manifests: package.json scripts, Cargo.toml, pyproject.toml, go.mod, Makefile
   - code analysis: CI configs (.github/workflows, .gitlab-ci.yml, etc.), Dockerfile RUN lines, README command patterns
   Confirm with user
9. Write `.asd/config.yaml` from `t_config.yaml` with all filled fields (including `project.diagram_tool` when decomp enabled)
10. Ask user what custom rules to add; write `.asd/project/custom-rules.md`
11. Write `.asd/project/decisions-log.md` from `t_decisions-log.md`
12. Seed minimal `design/` persistent (concept and stack handled by dedicated skills, NOT seeded here):
    - `architecture/commands.yaml` (from `t_commands.yaml` + detected + OS-specific `custom.lint-design`)
    - `ux/accessibility.html` (from `t_accessibility.html`, ask key inputs)
    - `ux/DESIGN.md` (fetch Google Labs spec via WebFetch, write minimal seed per spec)
    - `ux/design-system.html` (render from DESIGN.md seed via `t_design-system.html`)
13. If decomp enabled:
    - **likec4 mode**: seed `c4/model/main.c4`, `c4/views.c4` from templates; run `likec4 build` → `c4/dist/`
    - **mermaid mode**: seed `c4/subsystems.yaml` from `t_subsystems.yaml`; render `c4/architecture.html` with initial mermaid context view
14. Append decisions-log entry ("ASD initialized for project; decomposition=X, diagram_tool=Y, OS=Z")
15. **Post-init artefact checks** — suggest dedicated skill for each missing required artefact (do NOT auto-dispatch):
    - `design/product/concept.html` absent → suggest `/asd-concept`
    - `design/architecture/stack.html` absent → suggest `/asd-stack` (when that skill exists)
16. Brownfield: prompt user to start sprint with audit-only scope (optional)
17. Print summary + return contract

## Workflow (re-init)

1. Read current `.asd/config.yaml`
2. Show settings to user
3. AskUserQuestion which sections to edit: language | review | git | tools | concept | custom-rules | diagram-tool | subsystem-decomposition
4. Per section: ask new value → show diff → confirm
5. Apply diff; write config
6. Append decisions-log entry per change

## OS-specific commands written to commands.yaml

`custom.lint-design`:
- Windows: `designmd lint design\ux\DESIGN.md`
- Linux/macOS (alias): `designmd lint design/ux/DESIGN.md`
- Linux/macOS (npx fallback): `npx @google/design.md lint design/ux/DESIGN.md`

`custom.diff-design`: `<designmd-cmd> diff` (path args at call time)
`custom.export-design`: `<designmd-cmd> export --format json-tailwind design/ux/DESIGN.md`

## Artefacts produced

- `.asd/config.yaml`
- `.asd/project/custom-rules.md`, `decisions-log.md`
- `design/architecture/commands.yaml`
- `design/ux/DESIGN.md`, `design-system.html`, `accessibility.html`
- `design/architecture/c4/` content per `diagram_tool` (decomp only)

Concept and stack are NOT produced here; they are owned by `/asd-concept` and `/asd-stack` respectively.

## Agents dispatched

None. Init runs solo; no sprint context yet.

## Return contract (single line)

```
INIT: <fresh|re-init> | MODE: <greenfield|brownfield> | DECOMP: <enabled|disabled> | DIAGRAM: <likec4|mermaid|n/a> | TOOLS: likec4=<ok|missing|skip|n/a> designmd=<ok|missing|skip> codex=<ok|missing|skip>
```

Followed by file-creation summary.

## References

- Templates in `.asd/templates/`
- `.asd/rules/core.md`, `.asd/rules/artifact-layout.md`
- Google Labs DESIGN.md spec: https://github.com/google-labs-code/design.md
