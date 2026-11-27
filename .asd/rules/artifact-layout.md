# Artifact Layout

## Optional documents

`prd.html`/`ux-spec.html`/`adr.html`/`c4-full`+`c4/` and `audit.md` are omitted entirely (sprint draft, promoted persistent doc, and any promotion folder) when their `documents.*` flag is disabled — see `sprint-lifecycle.md` "Optional documents" for the flags, defaults, and no-op phase rule. A disabled document is never written as an empty placeholder file. The subsystem registry and `<subsystem>.md` are no `documents.*` document: they follow `project.subsystem_decomposition` alone ("Subsystem registry"), and `/asd-init`'s empty registry seed is not such a placeholder.

## Subsystem decomposition modes

Set by `project.subsystem_decomposition` in config (`enabled` | `disabled`). Layout differs.

## Paths (decomposition enabled)

- `.asd/`: `rules/`, `templates/`, ignored `tmp/`, `sprints/`. Project files under `project/`: `config.yaml`, `commands.yaml`, `custom-{common,design,coding}-rules.md`, `stubs.md`, consumer-owned `context-ceilings.json`, lazy `retro-backlog.md` and `reliability-checklist.md`.
- Each `.asd/sprints/<NNN-slug>/` holds only workflow artifacts: `sprint.md`, `research.md`, `state.json`, `decisions-log.md` and `decisions-log.NNN.md`, `audit.md`, `plan.md` and optional rename map, `test-plan.md` and `test-plan.entry-NN.md`, `manual-steps.md`, `friction-log.md`, `timing.jsonl`, `retrospective.html`.
- Sprint `design/`: `prd.html`, `ux-spec.html`, `mockups/`, `adr.html` (folded), `design-md-delta.yaml`, `c4-full/` (diagram delta or first full model). LikeC4: `model/*.c4`, `views.c4`; Mermaid: `subsystems.md`.
- Sprint `reviews/`: `design/iter-NN/`, `impl/waves.json`, `impl/wave-<K>/iter-NN/` (legacy `impl/iter-NN/` is wave 1). Each iteration holds `<reviewer>.md`, optional `<reviewer>.late.md` and adjacent machine evidence (review-policy.md "Coverage ledger").
- Archive: `.asd/sprints/archived/<NNN-slug>/`.
- Root provider paths: `providers.md` "Canonical path -> per-provider path"; hand-authored `.claude/agent-memory/<agent>/` per "Agent memory".
- `docs/product/`: `concept.html`, `requirements/<subsystem>.html`.
- `docs/ux/`: `DESIGN.md`, `design-system.html`, `accessibility.html`, `mockups/<subsystem>/`, `<subsystem>.html`.

```
docs/
└── architecture/
    ├── stack.html
    ├── subsystems.md
    ├── <subsystem>.md
    ├── c4/                          # LikeC4; ignored build output
    └── tech-reference/<tech>-<version>.md
```

## Paths (decomposition disabled)

Only `docs/` differs:

```
docs/
├── product/{concept.html, requirements.html}
├── architecture/
│   ├── stack.html
│   └── tech-reference/<tech>-<version>.md
└── ux/{DESIGN.md, design-system.html, accessibility.html, ux-spec.html, mockups/}
```

## Agent memory

Each dispatched agent name (including tier) owns repo-root `.claude/agent-memory/<agent>/`, with `MEMORY.md` and one file per memory. Same-name dispatches share it. An owner may write within its definition and tool policy. These paths are hand-authored, never synced, and in review scope in both modes.

Keep methods only: no sprint, Task, wave, iteration or verdict. Validate each memory commit per `git-strategy.md` "Commit before review". A retirement migration deletes the retired agent's directory.

**Leftover-term check**: at first `impl-test` entry for a removal, search the whole repo, including retired agents' memory, for the exact sentences and terms in the sprint diff's removed lines. Fix memory hits in that entry (`review-policy.md` "Memory-fix dispatch"). Any test pinning removed text is temporary (`code-style.md` §17).

## Scratch directory

`node .asd/runtime.js scratch-dir` creates and prints absolute `.asd/tmp/`. All ASD temp files go there, ignored by its `.gitignore` (`*`), outside review. Remove after use except persistent cache state. PR open mode removes sprint-prefixed helpers (`asd-phase-pr.md`).

## Subsystem registry

When decomposition enabled, `docs/architecture/subsystems.md` (`t_subsystems.md`) is the sole subsystem registry — which subsystems exist and their ids — whatever `project.diagram_tool`. Each entry links `docs/architecture/<id>.md` (`t_subsystem.md`: purpose, key paths), and every registered subsystem has one. Reserved, never a subsystem id (they collide in flat `docs/architecture/`): `subsystems`, `stack`, `c4`, `tech-reference`.

`/asd-init` seeds the registry empty; only the main orchestrator fills it. Subsystem ids are identical across the registry, `c4`, PRD, ux-spec and code. A subsystem is added at `design-promote` (`sprint-lifecycle.md` "Design-promote phase"), or at `audit` when the registry is absent (`asd-phase-audit.md` "Rules", step 3a) — each addition with explicit user approval (hard gate).

Diagram per `project.diagram_tool`; with `none`, no diagram is written and `docs/architecture/c4/` is never created:

- **likec4**: `c4/model/*.c4`, `views.c4` (LikeC4 DSL) — diagram source only; container/component ids match registry ids. `likec4 build` produces `dist/` interactive HTML — build output, gitignored, never committed; run the `commands.yaml` `c4-build` command to render. A draft runs `likec4` lint/validate and, when the retry fails once more, falls back to a Mermaid C4 block; a draft never runs `likec4 build`.
- **mermaid**: a Mermaid C4 block inline in `subsystems.md`. No `c4/` folder, no build output.

## Document provenance

User-facing artifacts may carry a `provenance` frontmatter field:

- `original` (default) — designed within an ASD sprint from scratch
- `reverse-engineered` — built from existing code without source docs
- `migrated` — translated from an external doc in another format/location

When `provenance != original`, set `source: <path or URL>`. HTML shows a provenance badge. Reviewers apply lighter checks on absent alternatives for non-original docs. A `reverse-engineered` or `migrated` doc quotes its source for every requirement it records.

## Document representation rule

User-facing artifacts are HTML only. No parallel Markdown source. Exceptions:

- `DESIGN.md` — Google Labs format (YAML + Markdown), machine source for the design system. Spec: https://github.com/google-labs-code/design.md — agents fetch current spec from upstream when creating/editing it.
- `commands.yaml` — machine source, not user-facing
- LikeC4 `.c4` files — DSL source
- `docs/architecture/subsystems.md`, `<subsystem>.md` — agent-facing registry, read by `audit` and `plan` to locate subsystem code

`design-system.html` generated from DESIGN.md by the main orchestrator: all tokens/rules with live examples (color swatches with hex, typography samples, spacing scale, component previews). Regenerated when DESIGN.md changes.

## HTML shell wrapping (mandatory)

Wrap each user-facing HTML artifact in `t_html-shell.html` using its fragment template. Emit a **self-contained single file** with inline shell styles and no sibling-file dependencies.

**Placeholder fill** — creators compute and inline when writing:

| Placeholder | Source / value |
|---|---|
| `{{DOC_TYPE}}` | one of `PRD`, `ADR`, `UX-spec`, `Concept`, `Stack`, `Accessibility`, `Design-system`, `Retrospective` |
| `{{SUBSYSTEM}}` | subsystem id when persistent per-subsystem; `sprint` for any sprint-scoped artifact (drafts, `retrospective.html`); `project` for project-wide docs |
| `{{SPRINT_ID}}` | active `state.json.sprint_id` for any sprint-scoped artifact (drafts, `retrospective.html`); empty for persistent docs |
| `{{STATUS}}` | `draft` (design), `in-review` (design-review), `approved` (design-promote in either workflow), `locked` (archived), `final` (terminal report). Each ADR decision has its own `proposed`/`accepted` `.status-chip` per `t_adr.html` |
| `{{UPDATED_AT}}` | ISO date (YYYY-MM-DD) of last write |
| `{{RESPONSIBILITY}}` | the `owns:` line from the fragment's responsibility frontmatter |
| `{{PROVENANCE}}` | `original` \| `reverse-engineered` \| `migrated` (from fragment frontmatter) |
| `{{SOURCE}}` | the `source:` field; empty when provenance=original |
| `{{SOURCE_SUFFIX}}` | ` (from {{SOURCE}})` in the provenance badge when source non-empty; else empty |
| `{{TITLE}}` | doc title, e.g. `PRD — Sprint 001 · <slug>` or `ADRs — Sprint 001 · <slug>`; each ADR keeps its title in its own `<h2>`/chip |
| `{{STATS}}` | draft PRD: `N stories · N AC · updated …`; persistent PRD: `N goals · N stories · N AC · N non-goals · updated …`; ADR: `N decisions · subsystems · updated …`; UX-spec: `N flows · N mockups`; Stack: `N langs · N frameworks · N components`; others: at least `updated …`. Per-ADR status and subsystem stay on that decision's chips |
| `{{TOC_NAV}}` | full `<nav class="toc">…</nav>` (title + `<ol>` of `<section id>` links in fragment order with `<h2>` text) when the fragment has **3 or more** `<h2>` sections; empty string otherwise. `.layout:has(> nav.toc)` controls two-column layout. For `adr.html`, link each decision's `<h2 id="adr-{{N}}-title">` directly, one per `<article class="adr">`, omitting its `<h3>` subheadings |
| `{{MERMAID_SCRIPT}}` | the mermaid CDN `<script src>` + init `<script>` tag pair when `{{CONTENT}}` contains a `.mermaid` diagram block; empty string when the fragment has no diagram |
| `{{CONTENT}}` | fragment body (everything after the frontmatter comment) |
| `{{GENERATED_BY}}` | `ASD workflow` |
| `{{GENERATED_AT}}` | same as `{{UPDATED_AT}}` |

**Badge omission**: omit the provenance badge when `PROVENANCE == original` (do not emit the `<span class="provenance-original">` block).

**Fragment invariants**: fragment files in `.asd/templates/` (`t_prd.html` etc.) must NOT include `<html>`, `<head>`, `<body>`, `<style>`, `<script>` — content-only, rely on shell for chrome/styling. Duplicating shell chrome is a reviewer finding. Sole exception: `t_design-system.html`'s `<style>` holding only the `asd:vars` `:root` block, generator-owned (`design-system.md` §12 Regeneration).

## Review verdict placeholder namespace

The verdict-token line in `t_review.md`/`t_review-report.md` (`[REVIEW-{{REVIEW_PHASE}}-{{REVIEWER}}]: ...`) uses `{{REVIEW_PHASE}}`, a distinct placeholder from core.md's `{{PHASE}}` template variable (full phase name, e.g. `impl-review`). `{{REVIEW_PHASE}}` is restricted to `design` \| `impl` only (`review-policy.md` verdict-token format) — literal substitution of `{{PHASE}}` there would emit an unparseable `impl-review`/`design-review` token. Dispatching workflow fills `{{REVIEW_PHASE}}` from its own phase (`impl-review`→`impl`, `design-review`→`design`), never copies `{{PHASE}}` verbatim.

## Tech reference docs (mandatory for every chosen tech)

`docs/architecture/tech-reference/<tech>-<version>.md` per `t_tech-reference.md`. Owner: orchestrator. Created per chosen library, framework, runtime, external service. Holds the canonical source URL (fetched, not recalled) with `Last verified` date, API surface used (per entry: default-target resolution and state mutation, verified against help or source before use), version specifics, deprecations, project conventions; never a secret.

**Refuse-to-implement rule**: Dev, Tester MUST find `tech-reference/<tech>-<version>.md` for each newly used tech, covering every command or subcommand the diff newly invokes. Else `FAILED — tech-reference missing for <tech>@<version>` or `<command>` per gap; the orchestrator writes each and re-dispatches.

## Manual steps

`<sprint>/manual-steps.md` per `t_manual-steps.md`. Per-sprint, created lazily. Owners: dev agents (append entries); orchestrator (validates necessity).

Manual step = operational action a human must perform for the plan to complete (provision a secret or cloud resource, hand-run a migration, register a third-party account). NOT a code stub (`stubs.md`) nor manual QA verification (reviews `quality.md`).

- When a subtask cannot proceed without a human-only operational action, the dev appends an `MS-N` entry (full step-by-step instructions + a `Verification` field) and marks the subtask `BLOCKED: MS-N` in `plan.md`.
- `Verification` mandatory: states how the workflow confirms the action was done (a `commands.yaml` check, observable state, or explicit user confirmation).
- The main orchestrator validates every new entry before the phase halts, keeping it only when the action genuinely cannot be done autonomously (needs access, a secret, an external account, an authority the agent lacks); else it is rejected and returned to the dev.
- Status `pending` → `done`, flipped by the registering dev only after running `Verification`.

## Test plan

`<sprint>/test-plan.md` per `t_test-plan.md`, which holds the shape of `Added tests` (`Gap proof`), `Suite run` (`Line delta`, `Allowance`, `Slowest tests`), and the optional `Area runs` and `Suite revision` ledgers. Entry 1 writes it fresh. Every re-entry amends it, keeping carried-over defects and resolved entries. The `impl-test` Tester owns the `Entry log` and rotation. For a proved prose-only review-fix re-entry, the orchestrator may write and close the entry under `asd-phase-impl-test.md` step 2a. For a split first entry, the orchestrator seeds `Area runs`, runners commit one result at a time against the recorded relevant paths and `HEAD`, and the orchestrator aggregates results still current at the suite gate (steps 3 and 8). A `Defects` row's `Status` is flipped by its test-fix fixer. A review-fix tester (`asd-phase-impl.md` step 5) amends only `Risk → check decisions` and `Added tests` rows, plus `Suite run` for a check a finding requires. It records a removal finding as a `Risk → check decisions` row. The next `impl-test` entry performs the removal and records its reason under `Removed tests`, naming the surviving test and the branch it exercises for a redundancy removal. An impl-review in-place tester (`review-policy.md` "Minor test-only findings") has the same reach and reports a finding outside it unfixed.

**Rotation**: at a re-entry's strategy pass, before any new row and never when resuming an interrupted current entry (`asd-phase-impl-test.md` step 1), the Tester moves the `Risk → check decisions`, `Removed tests` and `Added tests` rows, a struck `Removed tests` row (`~~<file:name>~~`, `asd-phase-impl-test.md` step 9a) excepted, of the previous `Entry log` entry N, if any, plus the review-fix and impl-review in-place tester rows added since (they have no `Entry log` row of their own), into `test-plan.entry-NN.md` (same section headings, N zero-padded to 2) when that file is absent, leaving those tables empty in the live file bar the struck rows, which stay live so step 5 and 9a keep filtering against them. Live `test-plan.md` keeps the `Entry log`, `Suite run`, optional `Area runs`, `Defects` and `Manual verification`. A segment is never edited, save the smallest edit clearing an `impl-test-close` refusal against it (`asd-phase-impl-test.md` "Rules"): a fix that changes a rotated row's risk gets a superseding row in the live file. Readers: "Decisions log" below.

An AC deviation found with no failing test is a `Defects` row all the same — `Failing test` = `none (AC-N)`, `Symptom` naming the AC and the deviation — and is never rated acceptable.

SSoT for two things invisible in the diff: **why** a test was removed, and **why** a change needed no new test; also the handoff channel for code defects to `impl` test-fix mode (`Defects`).

**Manual verification — single home.** The optional `Manual verification` table (AC, steps, expected observation) is authored only here, by the Tester, when automation is impossible (visual UI, third-party live integration, ux feel). The user's manual-verification check of its rows runs at `impl-test`'s first green entry (`asd-phase-impl-test.md`), and its result is recorded in this file, where reviewers read it. No review file duplicates this spec; `asd-reviewer-quality` (composed into `asd-reviewer-combined` in lite) judges it and reports any result as an ordinary finding.

## Friction log

`<sprint>/friction-log.md` per `t_friction-log.md`. Workflow/machine Markdown — same class as `plan.md`, `test-plan.md`, `manual-steps.md`, so the HTML-only representation rule above does not reach it. Owner: the dispatching phase workflow (appends). Scope, entry format, boundary against adjacent owners and writer mechanism are normative in `sprint-lifecycle.md` "Friction log".

## Research

`<sprint>/research.md` per `t_research.md`, written at scope by the orchestrator from interview and researcher returns (`sprint-lifecycle.md` "Staged solution design"). Workflow Markdown, same class as `audit.md` and `plan.md`, so the HTML-only representation rule does not reach it. Readers: `sprint-lifecycle.md` "Input sources" `research`.

## Retrospective

`<sprint>/retrospective.html` per `t_retrospective.html`. User-facing HTML, shell-wrapped like every other. **Derived analysis, never a rendering of the log** — references `F-N` ids, never a second copy of the entries. Owner: `retro` phase; semantics in `asd-phase-retro.md`.

## Retro backlog

`.asd/project/retro-backlog.md` per `t_retro-backlog.md`: the cross-sprint disposition of each retro row, one line per row, updated in place. Owner: main orchestrator. Created lazily at the first retro-intake write — `asd-init` seeds none, no migration creates it, `/asd-update` never touches it. Semantics: `asd-phase-scope.md` step 2a. Issue dispositions (an `asd-retro` or project issue) live on GitHub, never here.

## Reliability checklist

`.asd/project/reliability-checklist.md` per `t_reliability-checklist.md`: the cross-sprint guardrails reviewers check, one table row per item. Owner: main orchestrator. Created lazily at the first included row — `asd-init` seeds none, `/asd-update` never overwrites it. Written by scope intake (`asd-phase-scope.md` step 2a: add, remove) and retro `checklist-hits` (`Last hit`, `asd-phase-retro.md`).

## Single Source of Truth (iron rule)

Each fact has exactly one home file. Other files link to it, never copy. Violation = a finding from `asd-reviewer-quality`, or from `asd-reviewer-combined` applying the Quality rubric's SSoT entry.

## Documentation economy (iron rule)

Apply while writing framework canon or any artifact another agent reads. **Removal** governs: cut only text whose absence changes no action. Lack of **provenance** (recorded defect, friction or decision) and independent **enforcement** corroborate, never authorize a cut alone. Efficiency reviews this rule, including Combined's Efficiency rubric.

Cut filler, redundant rationale, examples, inverse prohibitions, emphasis and copied facts. Keep parsed literals and grammar, complete contract enumerations, case distinctions, surprising symptoms, and authoritative gates, safety, ownership, preconditions and recovery (including standalone security, authority or irreversible-action limits).

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
- ADR numbering is sprint-local (`ADR-1`, `ADR-2`, …) inside `<sprint>/design/adr.html` — unique only within the sprint, may repeat across sprints; never promoted standalone

## Sprint archival

Archived path: `.asd/sprints/archived/<NNN-slug>/`. The archive move rides the next sprint's branch; the sequence is owned by `sprint-lifecycle.md` "PR phase".

## State file

`<sprint>/state.json` carries only the keys `t_state.json` defines — machine state, never prose. `gate_decisions[].reason` and `.evidence` are short refs (a path, id or one-line pointer), not narrative; the narrative goes to `decisions-log.md`.

## Decisions log

The orchestrator seeds `<sprint>/decisions-log.md` at scope from `t_decisions-log.md` and appends one entry per user/adaptive decision. Archive with the sprint. Follow template format and durability; never edit or remove entries.

**Rotation**: before dispatch to a phase other than `state.json.phase`, run `node .asd/runtime.js rotate-decisions --sprint <sprint> --to <phase>`; it renames a populated log to next `decisions-log.NNN.md` and seeds a live one. Commit both on `rotated`. Same-phase and within impl/impl-test/impl-review transitions never rotate. Within-cycle recovery/stalemate readers use live log alone.

Read the live file for current facts. For cross-span facts, read all segments in ordinal order, then live (alone for legacy sprints). Never append to the historical `.asd/project/decisions-log.md`.
