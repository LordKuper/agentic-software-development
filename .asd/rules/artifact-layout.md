# Artifact Layout

## Optional documents

`prd.html`/`ux-spec.html`/`adr.html`/`c4-full`+`c4/` and `audit.md` are omitted entirely (sprint draft, promoted persistent doc, and any promotion folder) when their `documents.*` flag is disabled — see `sprint-lifecycle.md` "Optional documents" for the flags, defaults, and no-op phase rule. A disabled document is never written as an empty placeholder file.

## Subsystem decomposition modes

Set by `project.subsystem_decomposition` in config (`enabled` | `disabled`). Layout differs.

## Paths (decomposition enabled)

```
<repo root>/
├── .asd/
│   ├── rules/
│   ├── templates/
│   ├── project/
│   │   ├── config.yaml
│   │   ├── commands.yaml
│   │   ├── custom-common-rules.md
│   │   ├── custom-design-rules.md
│   │   ├── custom-coding-rules.md
│   │   └── stubs.md
│   └── sprints/
│       ├── <NNN-slug>/
│       │   ├── sprint.md
│       │   ├── state.json
│       │   ├── decisions-log.md
│       │   ├── audit.md
│       │   ├── design/
│       │   │   ├── prd.html
│       │   │   ├── ux-spec.html
│       │   │   ├── adr.html             # sprint-scoped only; never a standalone persistent document (folds at design-promote)
│       │   │   ├── design-md-delta.yaml
│       │   │   └── c4-full/{model/*.c4, views.c4}   # delta patch vs persistent registry; full schema only when registry absent; never build dist/ here
│       │   ├── plan.md
│       │   ├── test-plan.md
│       │   ├── manual-steps.md
│       │   └── reviews/
│       │       ├── design/iter-NN/<reviewer>.md
│       │       └── impl/iter-NN/<reviewer>.md
│       └── archived/<NNN-slug>/
├── .claude/{agents/, skills/, hooks/, settings.json}
├── docs/
│   ├── product/
│   │   ├── concept.html
│   │   └── requirements/<subsystem>.html
│   ├── architecture/
│   │   ├── stack.html
│   │   ├── c4/                          # subsystem registry + views; layout per project.diagram_tool (dist/, architecture.html are gitignored build output — build to view)
│   │   │   # likec4 mode: model/*.c4, views.c4
│   │   │   # mermaid mode: subsystems.yaml
│   │   └── tech-reference/<tech>-<version>.md
│   └── ux/
│       ├── DESIGN.md
│       ├── design-system.html
│       ├── accessibility.html
│       └── <subsystem>.html             # ux-spec per subsystem
└── CLAUDE.md
```

## Paths (decomposition disabled)

`docs/` becomes flat:

```
docs/
├── product/{concept.html, requirements.html}
├── architecture/
│   ├── stack.html
│   └── tech-reference/<tech>-<version>.md
└── ux/{DESIGN.md, design-system.html, accessibility.html, ux-spec.html}
```

No `c4/` directory. No subsystem subfolders.

## Subsystem registry

When decomposition enabled, registry lives in `docs/architecture/c4/`. Layout per `project.diagram_tool`:

- **likec4**: `model/*.c4` (LikeC4 DSL). Subsystem id = container/component id. `likec4 build` produces `dist/` interactive HTML — build output, gitignored, never committed; run the `commands.yaml` build-to-view command to render.
- **mermaid**: `subsystems.yaml` (machine registry). Subsystem id = entry id. `architecture.html` (embedded Mermaid C4 views) is likewise build output, gitignored, never committed; run the build-to-view command to render.

New subsystems added only via `design-promote`, with user approval, regardless of diagram tool.

## Document provenance

User-facing artifacts may carry a `provenance` frontmatter field:

- `original` (default) — designed within an ASD sprint from scratch
- `reverse-engineered` — built from existing code without source docs
- `migrated` — translated from an external doc in another format/location

When `provenance != original`, set `source: <path or URL>`. HTML shows a provenance badge. Reviewers apply lighter checks on absent alternatives for non-original docs.

## Document representation rule

User-facing artifacts are HTML only. No parallel Markdown source. Exceptions:

- `DESIGN.md` — Google Labs format (YAML + Markdown), machine source for the design system. Spec: https://github.com/google-labs-code/design.md — agents fetch current spec from upstream when creating/editing it.
- `commands.yaml` — machine source, not user-facing
- LikeC4 `.c4` files — DSL source

`design-system.html` generated from DESIGN.md by the Documentation agent: all tokens/rules with live examples (color swatches with hex, typography samples, spacing scale, component previews). Regenerated when DESIGN.md changes.

## HTML shell wrapping (mandatory)

Every user-facing HTML artifact (prd, ux-spec, adr, concept, stack, accessibility, design-system, architecture) MUST be wrapped in `t_html-shell.html`. The fragment template (`t_prd.html`, …) supplies the `<section>` content filling `{{CONTENT}}`. Creators emit a complete HTML document, not a bare fragment. Each artifact stays a **self-contained single file** — no `docs/assets/*` stylesheet or other sibling-file dependency; the shell inlines its own `<style>`.

The shell trims two blocks per document instead of always emitting them: the mermaid CDN script (only when the fragment actually contains a diagram) and the auto-TOC nav (only when the fragment has enough sections to need one). Both are ordinary computed placeholders, filled by the creator at write time — see table below.

**Placeholder fill** — creators compute and inline when writing:

| Placeholder | Source / value |
|---|---|
| `{{DOC_TYPE}}` | one of `PRD`, `ADR`, `UX-spec`, `Concept`, `Stack`, `Accessibility`, `Design-system`, `Architecture` |
| `{{SUBSYSTEM}}` | subsystem id when persistent per-subsystem; `sprint` for sprint drafts; `project` for project-wide docs |
| `{{SPRINT_ID}}` | active `state.json.sprint_id` for sprint drafts; empty for persistent docs |
| `{{STATUS}}` | `draft` (design) / `in-review` (design-review) / `approved` (post design-promote) / `locked` (archived). `adr.html` is a set of decisions (one `<article>` each, `t_adr.html` "repeat this article per decision") — `{{STATUS}}` here is this document-lifecycle value, not an individual ADR's `proposed`/`accepted` status, which lives solely on that ADR's `.status-chip` |
| `{{UPDATED_AT}}` | ISO date (YYYY-MM-DD) of last write |
| `{{RESPONSIBILITY}}` | the `owns:` line from the fragment's responsibility frontmatter |
| `{{PROVENANCE}}` | `original` \| `reverse-engineered` \| `migrated` (from fragment frontmatter) |
| `{{SOURCE}}` | the `source:` field; empty when provenance=original |
| `{{SOURCE_SUFFIX}}` | ` (from {{SOURCE}})` in the provenance badge when source non-empty; else empty |
| `{{TITLE}}` | doc title — e.g. `PRD — Sprint 001 · <slug>` or `ADRs — Sprint 001 · <slug>` (set-level; ADR doc holds one or more decisions, so no single decision title fits doc-level `{{TITLE}}` — the individual decision title lives on each ADR's own `<h2>`/chip inside `{{CONTENT}}`) |
| `{{STATS}}` | doc-type chip strip; PRD sprint draft (`SUBSYSTEM=sprint`): `N stories · N AC · updated …`; PRD persistent doc: `N goals · N stories · N AC · N non-goals · updated …`; ADR: `N decisions · subsystems · updated …` (set-level; per-ADR status/subsystem stays on that ADR's own chips, not doc-level STATS); UX-spec: `N flows · N mockups`; Stack: `N langs · N frameworks · N components`; others: at least `updated …` |
| `{{TOC_NAV}}` | full `<nav class="toc">…</nav>` block (title + `<ol>` of links to each `<section id>` in fragment order, auto-generated from `<h2>` text) when the fragment has **3 or more** `<h2>` sections; empty string below that threshold — the nav is omitted entirely, not emitted empty. The shell derives the two-column layout purely from this via CSS (`.layout:has(> nav.toc)`) — no separate layout-class placeholder needed. For a multi-ADR `adr.html` (one `<article class="adr">` per decision, each with `id`-prefixed headings `adr-{{N}}-*`), the TOC lists one entry per ADR article (linking `#adr-{{N}}`), not one entry per `<h2>` — each ADR's internal Context/Decision/Consequences/… headings nest as sub-entries or stay unlinked in the TOC, since the id-prefixing already disambiguates them for direct anchors and the shell's scrollspy |
| `{{TOC_ASSETS}}` | TOC/scrollspy `<style>` block + scrollspy `<script>`, filled with the same non-empty condition as `{{TOC_NAV}}` (3+ `<h2>` sections); empty string otherwise — keeps the doc self-contained with no dead CSS/script when there's no TOC |
| `{{MERMAID_SCRIPT}}` | the mermaid CDN `<script src>` + init `<script>` tag pair when `{{CONTENT}}` contains a `.mermaid` diagram block; empty string when the fragment has no diagram |
| `{{CONTENT}}` | fragment body (everything after the frontmatter comment) |
| `{{GENERATED_BY}}` | `ASD workflow` |
| `{{GENERATED_AT}}` | same as `{{UPDATED_AT}}` |

## Review verdict placeholder namespace

The verdict-token line in `t_review.md`/`t_review-report.md` (`[REVIEW-{{REVIEW_PHASE}}-{{REVIEWER}}]: ...`) uses `{{REVIEW_PHASE}}`, a distinct placeholder from core.md's `{{PHASE}}` template variable (full phase name, e.g. `impl-review`). `{{REVIEW_PHASE}}` is restricted to `design` \| `impl` only (`review-policy.md` verdict-token format) — literal substitution of `{{PHASE}}` there would emit an unparseable `impl-review`/`design-review` token. Dispatching workflow fills `{{REVIEW_PHASE}}` from its own phase (`impl-review`→`impl`, `design-review`→`design`), never copies `{{PHASE}}` verbatim.

**Badge omission**: omit the provenance badge when `PROVENANCE == original` (do not emit the `<span class="provenance-original">` block).

**Fragment invariants**: fragment files in `.asd/templates/` (`t_prd.html` etc.) must NOT include `<html>`, `<head>`, `<body>`, `<style>`, `<script>` — content-only, rely on shell for chrome/styling. Reviewers FAIL fragments that duplicate shell chrome.

## Tech reference docs (mandatory for every chosen tech)

`docs/architecture/tech-reference/<tech>-<version>.md` per `t_tech-reference.md`. Owner: Architect. Created for every chosen library, framework, runtime, external service. Includes canonical source URL, API surface used, version specifics, deprecations, project conventions.

**Refuse-to-implement rule**: Backend Dev, Frontend Dev, Test Engineer MUST verify `tech-reference/<tech>-<version>.md` exists before implementing with a tech. If missing → emit `FAILED — tech-reference missing for <tech>@<version>` and request it from Architect. No implementation without verified reference.

## Manual steps

`<sprint>/manual-steps.md` per `t_manual-steps.md`. Per-sprint, created lazily. Owners: dev agents (append entries); PM (validates necessity).

Manual step = operational action a human must perform for the plan to complete (provision a secret, create a cloud resource, hand-run a migration, set an env var, register a third-party account). NOT a code stub (`stubs.md`) nor manual QA verification (reviews `testing.md`).

- When a subtask cannot proceed without a human-only operational action, the dev appends an `MS-N` entry (full step-by-step instructions + a `Verification` field) and marks the subtask `BLOCKED: MS-N` in `plan.md`.
- `Verification` mandatory: states how the workflow confirms the action was done (a `commands.yaml` check, observable state, or explicit user confirmation).
- PM validates every new entry before the phase halts. Kept only when the action genuinely cannot be done autonomously (needs access, a secret, an external account, an authority the agent lacks). Else rejected, returned to the dev to implement directly.
- Status `pending` → `done`. The registering dev flips to `done` only after running `Verification`.
- Sprint-scoped; archived with the sprint.

## Test plan

`<sprint>/test-plan.md` per `t_test-plan.md`. Per-sprint: entry 1 writes it fresh; every re-entry amends it (Defects section carried over with resolved entries kept for the record). Owner: Test Engineer.

SSoT for two things invisible in the diff: **why** a test was removed, and **why** a change needed no new test. Also the handoff channel for code defects to `impl` test-fix mode (`Defects` section). Not a task list (that is `plan.md`) and not a review verdict (that is `reviews/impl/iter-NN/testing.md`).

**Manual verification — single home.** The optional `Manual verification` table (AC, steps, expected observation) is authored only here, by the Test Engineer, when automation is impossible (visual UI, third-party live integration, ux feel). No review file duplicates or re-authors this spec; `asd-reviewer-testing` judges whether the spec is justified and reports any result as an ordinary finding, never as a persisted section of its own.

## Single Source of Truth (iron rule)

Each fact has exactly one home file. Other files link to it, never copy. Violation = `FAIL` from Documentation reviewer.

## Document responsibility

Every template in `.asd/templates/` MUST declare its responsibility in frontmatter:

```yaml
---
responsibility:
  owns: <SSoT scope>
  excludes: <what belongs elsewhere>
  delegates_to: <other docs>
---
```

Agents preserve the block. Reviewers verify content respects the declared scope.

## Naming

- kebab-case English filenames
- Sprint slug derived from scope, max 30 chars
- Sprint number zero-padded to 3 digits
- ADR numbering is sprint-local (`ADR-1`, `ADR-2`, …) inside `<sprint>/design/adr.html` — unique only within the sprint, may repeat across sprints; ADRs are never promoted as a standalone persistent document, so no persistent ADR filename convention exists

## Sprint archival

Sprint folder moves from `.asd/sprints/<NNN-slug>/` to `.asd/sprints/archived/<NNN-slug>/` in `pr` **open** mode, right after the PR is created (DoD already met) — a dedicated commit pushed to the same sprint branch, so it lands inside the PR itself and merges atomically with it (avoids a later "push to sprint branch" that squash-merge + auto-delete-branch would make impossible). The terminal signal (`phase=done`, `pr.state="merged"`) is written separately, in `pr` **merge** mode, only once the PR is confirmed merged — the sprint counts as active until then even though its folder already sits under `archived/`. Archived sprints are otherwise never modified; this one terminal write is the sole exception (`sprint-lifecycle.md` "Sprint immutability").

## Decisions log

Every approved decision (concept change, new subsystem, ADR, scope shift, custom-rule update) appends one entry to `<sprint>/decisions-log.md`. Per-sprint file, created at `scope` from `t_decisions-log.md`, archived with the sprint (`sprint-lifecycle.md` "Sprint immutability"). Owner: PM agent. Append-only, never edited or removed. Entry format and the durability rule are normative in `t_decisions-log.md` — not restated here.

**Legacy log**: `.asd/project/decisions-log.md` is historical only — the project-wide log used before this rule, frozen as of sprint `002-lean-workflow`. Never appended to again.
