# ASD — Agentic Software Development

A multi-agent workflow for Claude Code that drives software projects end-to-end through fixed-shape sprints: from concept and tech-stack definition, through design and review, all the way to a green PR.

ASD is **stack-agnostic** — it works on any language, framework, or runtime. The workflow itself never touches your application code directly; it dispatches 15 specialized agents (PM, BA, UX Designer, Architect, devs, reviewers) coordinated by 13 skills.

---

## Why use it

- **Repeatable structure.** Every sprint follows the same 9 phases — no improvisation, no forgotten steps.
- **Documentation that stays alive.** Persistent design docs (concept, stack, ADRs, UX) update on every sprint instead of rotting.
- **Reviews that converge.** Iteration severity floor stops reviewers from nitpicking the same low-severity issue forever.
- **Brownfield-friendly.** The audit phase reads any existing docs and code (in any format and location) and reverse-engineers them into the workflow's structure.
- **One source of truth.** SSoT iron rule is enforced by a dedicated Documentation reviewer.
- **Subsystem-aware.** Optional LikeC4 (or Mermaid) registry organises persistent docs per subsystem.

---

## Requirements

- **Claude Code** — desktop or CLI
- **Node.js** — used by the SessionStart/Stop hooks and by the optional Google Labs `designmd` and `LikeC4` CLIs
- **Git** — required (sprint = branch)
- **gh CLI** — optional, only if you want ASD to open PRs for you

Optional external tools auto-detected by `/asd-init`:

- **LikeC4 CLI** — for C4 architecture model rendering (subsystem-decomposition mode `likec4`)
- **`@google/design.md`** — for DESIGN.md token lint and Tailwind/DTCG export
- **Codex CLI** — for parallel external code review

---

## Install

Clone ASD into the root of your project (NOT into a subdirectory):

```bash
cd /path/to/your-project
git clone https://github.com/<owner>/agentic-software-development.git .asd-tmp
cp -R .asd-tmp/.asd .asd-tmp/.claude .asd-tmp/CLAUDE.md .
rm -rf .asd-tmp
```

Or, if your project is empty:

```bash
git clone https://github.com/<owner>/agentic-software-development.git my-project
cd my-project
```

After cloning, open the project in Claude Code. The SessionStart hook will print `[ASD] No active sprint. Run /asd-sprint to begin, or /asd-init to set up the workflow.`

---

## Quick start

```text
/asd-init       # interactive setup: language, decomposition mode, OS, tools, git
/asd-concept    # define the project concept (vision, users, value)
/asd-stack      # define the tech stack (architect proposes from concept)
/asd-sprint     # start your first sprint
```

`/asd-sprint` then walks you through the nine sprint phases automatically, pausing for your approval at every checkpoint.

---

## Workflow overview

Each sprint runs through nine mandatory phases in order:

```
scope → audit → design → design-review → design-promote → plan → impl → impl-review → pr
```

| Phase | What happens |
|---|---|
| **scope** | PM refines your raw idea into a coherent sprint goal; creates the sprint branch and folder |
| **audit** | BA + Architect scan existing docs and code; identify gaps, risks, stubs to resolve |
| **design** | BA writes PRD, UX Designer writes UX-spec and UI mockups, Architect writes ADRs and C4 schema |
| **design-review** | 3 internal reviewers (Documentation, UI, Simplification) plus External Review iterate to APPROVE |
| **design-promote** | Approved sprint drafts get decomposed per subsystem and promoted to persistent `design/` |
| **plan** | PM decomposes work into Tasks with checkbox subtasks, traces each to PRD acceptance criteria |
| **impl** | Devs (Backend, Frontend, Test Engineer) implement Tasks, run lint/test, commit per Conventional Commits |
| **impl-review** | 7 internal reviewers (Quality, Implementation, Testing, UI, Simplification, Documentation, Performance) plus External Review |
| **pr** | DoD verification + sprint archive + `gh pr create` (or push + summary if gh disabled) |

You can resume an interrupted sprint at any time: `/asd-sprint` reads `state.json`, detects the current phase, and dispatches the matching phase skill.

---

## Slash commands

User-facing commands available at any time:

| Command | Purpose |
|---|---|
| `/asd-init` | Initialize the workflow, or edit settings later in diff mode |
| `/asd-concept` | Form or edit `design/product/concept.html` (4 entry variants: no-idea / vague / clear / brownfield) |
| `/asd-stack` | Form or edit `design/architecture/stack.html` (architect proposes from concept; same 4 variants) |
| `/asd-sprint` | Start a new sprint or resume the active one |

Phase skills (`asd-phase-*`) are dispatched internally by `/asd-sprint`. You usually do not invoke them directly, but you can use them to re-run a specific phase of the active sprint.

---

## Agents

Fifteen specialized agents live in `.claude/agents/`. Each declares its `model` preference (opus / sonnet / haiku); Claude Code falls back to the default model if the requested tier is unavailable.

### Creators (7)

| Agent | Model | Role |
|---|---|---|
| `asd-pm` | opus | Sprint orchestrator: state, phase routing, decisions-log, PR ops |
| `asd-ba` | opus | Business analyst: PRD, audit on the docs side, acceptance criteria |
| `asd-ux-designer` | opus | UX flows, UI mockups, DESIGN.md tokens, design-system.html |
| `asd-architect` | opus | ADRs, C4 model, stack, API contracts, tech-reference docs |
| `asd-backend-dev` | sonnet | Server/CLI/library code plus unit tests |
| `asd-frontend-dev` | sonnet | UI code plus unit tests (consumes DESIGN.md tokens) |
| `asd-test-engineer` | haiku | Integration/e2e tests, edge-case coverage, manual verification specs |

### Reviewers (7 internal + 1 external)

| Agent | Model | Phase(s) | Scope |
|---|---|---|---|
| `asd-reviewer-quality` | opus | impl-review | Bugs, security, best-practice, contract drift |
| `asd-reviewer-implementation` | haiku | impl-review | PRD acceptance criteria coverage in code |
| `asd-reviewer-testing` | haiku | impl-review | Test coverage, edge cases, manual verification capture |
| `asd-reviewer-ui` | haiku | design-review + impl-review | UX-spec compliance, design-system tokens, a11y |
| `asd-reviewer-simplification` | opus | design-review + impl-review | Over-engineering detection (13-item checklist) |
| `asd-reviewer-documentation` | opus | design-review + impl-review | SSoT integrity, template adherence, traceability |
| `asd-reviewer-performance` | opus | impl-review | Perf budgets, regression, anti-patterns |
| `asd-external-review` | opus | both | Wraps Codex CLI, parses output, applies severity floor |

Reviewers emit a machine-parseable first-line verdict token: `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL`, where `<phase>` is `design` or `impl`.

---

## Configuration

All settings live in `.asd/config.yaml`, generated by `/asd-init`:

```yaml
language:
  chat: en          # language for chat with you
  docs: en          # language for user-facing artifacts

project:
  subsystem_decomposition: enabled    # enabled | disabled
  diagram_tool: likec4                # likec4 | mermaid (only when decomposition enabled)

backward_compat: migration            # strict | migration | none

review:
  external_review: enabled            # enabled | disabled
  iterations_low: 1                   # cumulative-budget severity floor
  iterations_medium: 1
  iterations_high: 2
  iterations_critical: 10

system:
  os: linux                           # windows | linux | macos
  tools:
    likec4: "likec4"
    designmd: "designmd"              # on Windows always use the alias
    codex_command: ""

git:
  base_branch: main
  branch_pattern: "sprint/{n}-{slug}"
  gh_enabled: true
  auto_pr: true
```

Re-run `/asd-init` to edit any section in diff mode.

---

## Folder structure

After `/asd-init`, your project looks like:

```
your-project/
├── .asd/
│   ├── config.yaml                  # workflow settings
│   ├── rules/                       # workflow rules (read by all agents)
│   ├── templates/                   # artifact templates (t_*.html / .md / .yaml / .c4)
│   ├── project/
│   │   ├── custom-rules.md          # project-specific rules (you edit)
│   │   ├── decisions-log.md         # append-only chronology of approved decisions
│   │   └── stubs.md                 # project-global TODO registry
│   └── sprints/
│       ├── <NNN-slug>/              # active sprint (one at a time)
│       └── archived/<NNN-slug>/     # closed sprints (immutable)
├── .claude/
│   ├── agents/                      # 15 agent definitions
│   ├── skills/                      # 13 skill definitions
│   ├── hooks/                       # SessionStart + Stop hooks (Node.js)
│   └── settings.json                # hook registration + permissions allowlist
├── design/                          # persistent design docs (grow across sprints)
│   ├── product/
│   │   ├── concept.html
│   │   └── requirements/<subsystem>.html
│   ├── architecture/
│   │   ├── stack.html
│   │   ├── commands.yaml            # build/test/lint/run + design.md lint
│   │   ├── c4/                      # subsystem registry (likec4 model or mermaid yaml)
│   │   ├── adr/<subsystem>/adr-NNNN-<slug>.html
│   │   ├── api/<subsystem>.html
│   │   └── tech-reference/<tech>-<version>.md
│   └── ux/
│       ├── DESIGN.md                # Google Labs format token source
│       ├── design-system.html       # rendered live preview
│       ├── accessibility.html
│       └── <subsystem>.html         # ux-spec per subsystem
├── CLAUDE.md                        # entry-point pointers for Claude Code
├── README.md                        # this file
└── <your project source>
```

When `project.subsystem_decomposition: disabled`, persistent docs go to flat project-wide paths (no `<subsystem>/` subdirectories, no `c4/`).

The authoritative path map lives in [`.asd/rules/artifact-layout.md`](.asd/rules/artifact-layout.md).

---

## External tools (optional)

ASD works without any of these, but they unlock specific features.

### LikeC4 CLI

Renders interactive C4 architecture diagrams from text-DSL sources. Required when `project.diagram_tool: likec4`.

```bash
npm install -g @likec4/cli
likec4 --version
```

If absent, choose `diagram_tool: mermaid` instead — ASD will render architecture views as embedded Mermaid C4 blocks.

### `@google/design.md`

Lints and exports the DESIGN.md design-system source to Tailwind / W3C DTCG tokens.

```bash
# Linux/macOS
npx @google/design.md spec

# Windows (use the alias — npx fails on .md file association)
npm install -g @google/design.md
designmd --version
```

### Codex CLI

Enables External Review in parallel with internal reviewers. ASD auto-skips and logs to the decisions log if Codex is unavailable, so the workflow keeps running.

---

## Customization

### Custom rules

`/asd-init` creates `.asd/project/custom-rules.md`. Add anything project-specific: naming conventions, forbidden libraries, domain glossary, compliance requirements, performance budgets. Every agent reads this file alongside the standard rules.

### Hooks

The SessionStart hook (`.claude/hooks/session-start.js`) prints a one-block summary of your active sprint into Claude's context on every session resume. The Stop hook touches `state.json.updated_at`. Both fail silently if Node is unavailable.

### Settings.json

`.claude/settings.json` pre-allows common git / gh / likec4 / designmd / codex commands so Claude Code does not prompt you for permission each time. Edit the `permissions.allow` array to extend.

---

## FAQ

**Can I run multiple sprints in parallel?**
No. ASD enforces one active sprint at a time. The PR phase archives the sprint folder; only then can a new one start. This keeps state recovery simple.

**What if a reviewer keeps blocking the same finding?**
The iteration severity floor uses cumulative budgets: by default iter 1 considers all severities, iter 2 considers medium+, iter 3-4 considers high+, iter 5-14 considers only critical, iter 15+ escalates to you. Tune the limits in `config.yaml`.

**What if I disagree with a reviewer's FAIL verdict?**
FAIL findings trigger an explicit user-approval prompt (Complication Approval format). You can override or accept; the workflow records your decision in `decisions-log.md`.

**Can I skip the audit phase on greenfield projects?**
No, audit is mandatory — but it runs fast on empty projects (no existing code or docs to scan).

**Does ASD work without subsystem decomposition?**
Yes. Set `project.subsystem_decomposition: disabled` during `/asd-init`. Persistent docs become flat project-wide files. No C4 registry is maintained.

**What if my project already has a CLAUDE.md?**
Back it up before cloning ASD; ASD ships its own CLAUDE.md. You can merge custom sections after init.

**Where do TODO stubs live?**
Project-globally in `.asd/project/stubs.md`, append-only across sprints. The PR phase blocks if any stub introduced by the current sprint remains unresolved without an `(accepted-debt)` Reason prefix.

---

## License

[MIT](LICENSE)

---

## Acknowledgments

ASD draws on practices and patterns from:

- [LordKuper/agentic-game-studio](https://github.com/LordKuper/agentic-game-studio) — sprint structure, reviewer roster, severity floor concept, brainstorm entry variants
- [Google Labs DESIGN.md](https://github.com/google-labs-code/design.md) — design-system source format
- [LikeC4](https://likec4.dev) — text-DSL architecture diagrams
- [Agent Skills specification](https://agentskills.io/specification) — SKILL.md format
- [Anthropic skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — description writing, progressive disclosure
- [DenisSergeevitch/agents-best-practices](https://github.com/DenisSergeevitch/agents-best-practices) — operating contracts, narrow tool whitelists, draft-vs-commit split
