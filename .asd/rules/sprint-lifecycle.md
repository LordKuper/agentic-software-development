# Sprint Lifecycle

## Phases (all mandatory)

```
scope → audit → design → design-review → design-promote → plan → impl ⇄ impl-review → pr
```

`impl` and `impl-review` form a cycle: when impl-review finds issues it does NOT fix them itself — it routes the sprint back to `impl` (fix mode) to resolve the findings, then impl returns to `impl-review`. The cycle repeats until impl-review reaches DoD (all reviewers APPROVE) or the iteration cap is hit. Phase routing follows the `NEXT:` token in each phase skill's return contract, not a fixed linear chain.

## Review iteration counters

There are **two independent review iteration counters**, one per review phase, held in `state.json`:

- `reviews.design.iteration` — design-review iterations
- `reviews.impl.iteration` — impl-review iterations

Each review phase reads, increments, and reports only its own counter. They never share a value, so a design-review round and an impl-review round are always distinguishable, and the severity-floor cumulative budget (see `review-policy.md`) is computed per counter — design-review iterations never consume impl-review's budget and vice versa.

**Lifecycle and reset rules:**

- Both counters are created at `0` when the sprint is initialised in the `scope` phase (per `t_state.json`).
- `reviews.design.iteration` is incremented at the start of every design-review iteration (`1` on first entry). `design-review` is entered once per sprint and loops internally until DoD.
- `reviews.impl.iteration` is incremented at the start of every `impl-review` **entry** (`1` on first entry). The `impl⇄impl-review` cycle re-enters `impl-review` repeatedly; each re-entry increments the counter. The intervening `impl` fix-mode phase does **not** touch it.
- A new sprint starts both counters at `0` (a fresh `state.json`).
- **Rollback reset.** When `state.json.phase` is set to a phase positioned in the chain **strictly earlier than** the phase that produces a review's input, that review's counter resets to `0` — and with it the severity floor (the floor is derived from the counter) — and that review's `verdicts` are cleared. The two input-producing phases are: `design` for design-review, `impl` for impl-review. So:
  - `reviews.design.iteration` resets when the phase is set to `scope` or `audit`.
  - `reviews.impl.iteration` resets when the phase is set to any of `scope`, `audit`, `design`, `design-review`, `design-promote`, `plan`.
  - Setting the phase to `impl` itself is **not** earlier than `impl` — the normal `impl⇄impl-review` fix-mode re-entry therefore never resets `reviews.impl.iteration`; the counter accumulates across the whole cycle as intended. The reset fires only on a genuine rollback (the `asd-sprint` resume menu's *re-run earlier phase*), never on a forward or cycle transition. Rationale: once the artifact under review is going to be re-created from an earlier phase, all prior review rounds against the old artifact are void, so the budget starts clean.
- On an iteration-cap override (user chooses to continue past the cap), the counter keeps incrementing — it is **not** reset to `0`. The severity floor stays pinned at `critical` rather than dropping back to `low`, so the extra iterations do not re-admit lower-severity findings.

Each review phase writes its verdict files under a counter-specific folder: design-review → `<sprint>/reviews/design/iter-NN/`, impl-review → `<sprint>/reviews/impl/iter-NN/`, where `NN` is that phase's own counter. The two trees never collide.

| Phase | Owner | Input | Output | Exit criteria |
|---|---|---|---|---|
| scope | PM | user request | `sprint.md`, sprint id, branch | scope approved, branch created |
| audit | Architect + BA | `sprint.md`, codebase, `design/`, existing docs in any format/location | `audit.md` (findings + documentation migration plan); optional reverse-engineered/migrated drafts in `<sprint>/design/` | audit approved |
| design | BA → UX Designer → Architect | `audit.md` | drafts in `<sprint>/design/` | drafts complete |
| design-review | Documentation + UI + Simplification + External Review | `<sprint>/design/` | `reviews/design/iter-NN/<reviewer>.md` | DoD met |
| design-promote | PM + Architect + BA + UX Designer | approved drafts | persistent docs in `design/` | drafts merged, decisions-log entry |
| plan | PM | promoted persistent docs | `plan.md` | plan approved |
| impl | Backend Dev + Frontend Dev + Test Engineer | `plan.md` (initial) or `reviews/impl/iter-NN/` findings (fix mode) | code + tests, `manual-steps.md` | all tasks/findings done; build + tests run and pass (completion gate) |
| impl-review | Quality + Implementation + Testing + UI + Simplification + Documentation + Performance + External Review | code + tests | `reviews/impl/iter-NN/<reviewer>.md` | DoD met → `pr`; else route to `impl` fix mode |
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

## Impl phase details

Devs implement plan tasks. When a subtask needs a human-only operational action (a secret, cloud resource, migration run by hand, env var, third-party account), the dev registers an `MS-N` entry in `<sprint>/manual-steps.md`, marks the subtask `BLOCKED: MS-N` in `plan.md`, emits `BLOCKED_MANUAL`, and continues with all unblocked work.

PM validates each new `MS-N` for necessity (see `artifact-layout.md` Manual steps); entries the agent could do autonomously are rejected and returned to the dev. Once all unblocked work is COMPLETED and validated `pending` entries remain, the impl phase halts: PM presents `manual-steps.md` to the user and waits for a continue command. On resume, the dev verifies each entry per its `Verification` field, flips it to `done`, and finishes the blocked subtasks before the impl assessment gate.

### Impl modes

The impl phase runs in one of two modes, detected from `state.json.review_fixes_pending`:

- **Initial mode** (`review_fixes_pending` null/absent) — devs implement `plan.md` tasks as above. Ends with the user-facing impl assessment gate, then `NEXT: impl-review`.
- **Fix mode** (`review_fixes_pending` set to `iter-NN`) — entered when impl-review routed the sprint back. Devs read the reviewer findings in `<sprint>/reviews/impl/iter-NN/`, resolve every CONCERNS finding plus every FAIL finding whose escalation the user approved in impl-review, then return `NEXT: impl-review`. Fix mode skips the user-facing impl assessment gate (the cycle stays silent between review iterations); blockers (dev QUESTION / FAILED, Simplicity Default trigger) escalate exactly as in initial mode. On completion the phase clears `review_fixes_pending`.

### Impl completion gate

In **both modes**, the impl phase MUST NOT emit `COMPLETED` until all of the following hold, verified via `commands.yaml`:

- the `build` command was executed
- `build` finished with no errors and no warnings
- the `test` command was executed
- every test passed

If any condition fails, impl cannot complete: devs fix and re-run; an unrecoverable failure escalates as a blocker (`FAILED`). This gate is an automatic verification, not a user pause.

## Signal vocabulary

- `COMPLETED` — phase work done, ready for next phase
- `FAILED` — cannot proceed, reason in body
- `REVIEW_DONE` — reviewer finished, verdict in body
- `QUESTION` — needs user input, body contains options
- `PLAN_DRAFT` — plan written but not approved
- `PLAN_READY` — plan approved by user
- `BLOCKED_MANUAL` — task cannot proceed without a human-performed manual action; entry registered in `manual-steps.md`

## Plan file format

See `.asd/templates/t_plan.md` for the canonical structure.

## Sprint immutability

A closed sprint folder under `.asd/sprints/archived/<NNN-slug>/` is read-only. Follow-up work creates a new sprint.

## State recovery

`state.json` is the single recovery point. Updated on every phase transition, task status change, review verdict. Session-start hook reads it and prints a summary into context.
