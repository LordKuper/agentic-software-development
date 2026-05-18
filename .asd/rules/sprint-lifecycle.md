# Sprint Lifecycle

## Phases (all mandatory)

```
scope → audit → design → design-review → design-promote → plan → impl → impl-review → pr
```

| Phase | Owner | Input | Output | Exit criteria |
|---|---|---|---|---|
| scope | PM | user request | `sprint.md`, sprint id, branch | scope approved, branch created |
| audit | Architect + BA | `sprint.md`, codebase, `design/`, existing docs in any format/location | `audit.md` (findings + documentation migration plan); optional reverse-engineered/migrated drafts in `<sprint>/design/` | audit approved |
| design | BA → UX Designer → Architect | `audit.md` | drafts in `<sprint>/design/` | drafts complete |
| design-review | Documentation + UI + Simplification + External Review | `<sprint>/design/` | `reviews/iter-NN/<reviewer>.md` | DoD met |
| design-promote | PM + Architect + BA + UX Designer | approved drafts | persistent docs in `design/` | drafts merged, decisions-log entry |
| plan | PM | promoted persistent docs | `plan.md` | plan approved |
| impl | Backend Dev + Frontend Dev + Test Engineer | `plan.md` | code + tests | all tasks done |
| impl-review | Quality + Implementation + Testing + UI + Simplification + Documentation + Performance + External Review | code + tests | `reviews/iter-NN/<reviewer>.md` | DoD met |
| pr | PM | everything | sprint archive + PR | PR opened (or push summary if `gh_enabled=false`) |

## Audit phase details

Scope of audit:
- existing source code in touched areas
- existing documentation in **any format and location** (MD, RST, Confluence exports, Notion, HTML, Wiki, text-extractable PDF, README files outside ASD layout)
- existing persistent docs in `design/`

Output:
- `audit.md` — findings (touched areas, existing docs/code, gaps, risks) plus **Documentation migration plan** section listing found external docs to be promoted into ASD format
- Optionally, where sprint scope directly overlaps with found content, the agent may pre-formulate reverse-engineered or migrated drafts directly in `<sprint>/design/` (prd.html / ux-spec.html / adr.html) with `provenance: reverse-engineered | migrated` and `source: <original>` in frontmatter. These drafts then flow through design and design-review like any other.

Migration plan items NOT addressed by sprint drafts wait for design-promote to handle them.

## Design phase details

Agents produce a unified draft set for the entire sprint scope in `<sprint>/design/`:

- `prd.html` — requirements + acceptance criteria
- `ux-spec.html` — flows + accessibility notes for sprint scope
- `adr.html` — architecture decisions
- `design-md-delta.yaml` — proposed token changes to DESIGN.md, produced inline by UX-spec authoring (only when a token gap surfaces during mockup work; each entry user-approved before mockup resumes)
- `c4-full/` — full LikeC4 schema covering sprint scope, rendered inline (`model/*.c4`, `views.c4`, `dist/`)

Order: PRD blocks design-system gate. Design-system gate (existence check on `design/ux/DESIGN.md`, `design-system.html`, `accessibility.html`; dispatches `/asd-design-system` when any missing) blocks UX-spec. UX-spec blocks ADR. ADR blocks c4-full. `design-md-delta.yaml` is produced inline during UX-spec, not as a separate post-ADR step.

If `project.subsystem_decomposition: disabled`, `c4-full/` is omitted.

## Design-promote phase details

PM orchestrates; three domain creators perform actual promotion (Documentation reviewer is NOT involved in this phase):

1. PM proposes per-subsystem decomposition (only when `subsystem_decomposition: enabled`); user approves split via AskUserQuestion
2. PM proposes any new subsystems inferred from drafts; user approves each (name, parent container, description). On approve: Architect patches C4 registry (likec4 model or subsystems.yaml), creates subsystem folders, runs `likec4 build` if applicable
3. PM distributes Documentation migration plan items from `audit.md` to the matching domain (architecture / product / ux / api)
4. Parallel domain promotion:
   - `asd-ba` writes per-subsystem (or flat) `design/product/requirements/<subsystem>.html` from prd draft; processes product migration items
   - `asd-architect` writes per-subsystem (or flat) `design/architecture/adr/<subsystem>/adr-NNNN-<slug>.html` from adr draft; updates `design/architecture/api/<subsystem>.html`, `stack.html`, `tech-reference/`; applies c4 delta from sprint `c4-full/` to persistent `design/architecture/c4/`; regenerates `c4/dist/` (likec4) or `architecture.html` (mermaid); processes architecture migration items
   - `asd-ux-designer` writes per-subsystem (or flat) `design/ux/<subsystem>.html` from ux-spec draft; patches `design/ux/DESIGN.md` from `design-md-delta.yaml`; regenerates `design/ux/design-system.html` from patched DESIGN.md (live examples: swatches, typography, spacing, components); processes ux migration items
   - Each creator AskUserQuestion before each persistent write
5. PM final user confirmation before persistent mutation (confirm / rollback / partial rollback)
6. PM appends decisions-log entries and finalises `state.json`

If `project.subsystem_decomposition: disabled`: drafts merge into single project-level docs (`design/product/requirements.html`, `design/architecture/adr/adr-NNNN-<slug>.html` flat, `design/architecture/api.html`, `design/ux/ux-spec.html`). No subsystem folders. No c4 model.

## Signal vocabulary

- `COMPLETED` — phase work done, ready for next phase
- `FAILED` — cannot proceed, reason in body
- `REVIEW_DONE` — reviewer finished, verdict in body
- `QUESTION` — needs user input, body contains options
- `PLAN_DRAFT` — plan written but not approved
- `PLAN_READY` — plan approved by user

## Plan file format

See `.asd/templates/t_plan.md` for the canonical structure.

## Sprint immutability

A closed sprint folder under `.asd/sprints/archived/<NNN-slug>/` is read-only. Follow-up work creates a new sprint.

## State recovery

`state.json` is the single recovery point. Updated on every phase transition, task status change, review verdict. Session-start hook reads it and prints a summary into context.
