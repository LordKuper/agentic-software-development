# ASD Workflow: Design

Orchestration body for the `asd-phase-design` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- `audit.md` approved (per checkpoints precondition chain)
- `state.json.phase` advanced from `audit`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `sprint.md`, `audit.md`, audit-produced reverse/migrated drafts in `<sprint>/design/`
- search repo: design-system gate — existence of `design/ux/DESIGN.md`, `design/ux/design-system.html`, `design/ux/accessibility.html`
- request user decision: rare, phase-level escalation only
- delegate to agent, sequential: BA, UX Designer, Architect, optional Architect (c4-full); plus PM for state
- dispatch skill `asd-design-system` when gate detects missing files

## Workflow

1. Read `.asd/project/config.yaml` (`project.subsystem_decomposition`, `project.diagram_tool`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json`, `sprint.md`, `audit.md`
3. List existing drafts in `<sprint>/design/` (from audit, with `provenance` flag)
4. Delegate to agent `asd-pm`: update `state.json` (phase=design)
5. **Step PRD**: delegate to agent `asd-ba`:
   - inputs: sprint.md, audit.md, existing prd draft if any, `language.chat`, `language.docs`; template `t_prd.html`
   - instruction: integrate existing draft (preserve `provenance` + `source` if present); author full sprint PRD covering all scope; discuss each section in `language.chat`; on approval translate to `language.docs` + write `<sprint>/design/prd.html`; emit COMPLETED
6. **Step Design-system gate**: on BA COMPLETED → search repo for existence of all three: `design/ux/DESIGN.md`, `design/ux/design-system.html`, `design/ux/accessibility.html`
   - if ANY missing → dispatch skill `asd-design-system`; halt until COMPLETED; on FAILED/aborted → relay + halt phase
   - if all present → Step 7
7. **Step UX-spec**: on gate cleared → delegate to agent `asd-ux-designer`:
   - inputs: prd.html, audit.md, existing ux-spec draft if any, current `design/ux/DESIGN.md`, `design-system.html`, `accessibility.html`; templates `t_ux-spec.html`, `t_design-md-delta.yaml`
   - instruction: integrate existing draft; author flows + UI mockups using ONLY existing DESIGN.md tokens; when a needed token missing/must change, pause mockup, request user decision to approve token add/update, append entry to `<sprint>/design/design-md-delta.yaml` (create on first entry per `t_design-md-delta.yaml`), THEN continue mockup referencing new token; discuss each section in `language.chat`; on approval translate + write `<sprint>/design/ux-spec.html`; emit COMPLETED (delta file produced inline iff a token gap surfaced — else omitted)
8. **Step ADR**: on UX COMPLETED → delegate to agent `asd-architect`:
   - inputs: prd.html, ux-spec.html, existing adr draft if any, `design/architecture/stack.html`, existing adr/, `tech-reference/`; template `t_adr.html`
   - instruction: integrate existing draft; author one+ ADRs for sprint scope (repeated `<article>` blocks); for any new tech, create/update `tech-reference/<tech>-<version>.md` via fetch-external-doc-by-URL + `t_tech-reference.md`; discuss each decision in `language.chat`; on approval translate + write `<sprint>/design/adr.html`; emit COMPLETED
9. **Optional Step c4-full**: on ADR COMPLETED → if `project.subsystem_decomposition: enabled`:
   - delegate to agent `asd-architect`
   - templates per `project.diagram_tool`:
     - likec4: `t_c4-model.c4`, `t_c4-views.c4`; produce `<sprint>/design/c4-full/model/*.c4`, `views.c4`, run `likec4 build` → `dist/`
     - mermaid: `t_subsystems.yaml`; produce `<sprint>/design/c4-full/subsystems.yaml` + `architecture.html` (mermaid-rendered)
   - instruction: full schema covering sprint scope (not delta — delta computed in design-promote); discuss overall view in `language.chat`; on approval write files; emit COMPLETED
   - if `disabled` → skip
10. On all required steps COMPLETED → delegate to agent `asd-pm` to update `state.json` (drafts ready), append decisions-log entry summarising drafts
11. Emit phase COMPLETED with return contract
12. Any creator QUESTION → relay, halt; resumes on user answer
13. Any creator FAILED / ABORT → relay, halt

## Artefacts produced
- `<sprint>/design/prd.html` (required)
- `<sprint>/design/ux-spec.html` (required)
- `<sprint>/design/adr.html` (required)
- `<sprint>/design/design-md-delta.yaml` (optional, produced inline by UX-spec step iff token gaps surfaced)
- `<sprint>/design/c4-full/` (optional, when `subsystem_decomposition: enabled`; layout per `diagram_tool`)
- New/updated `design/architecture/tech-reference/<tech>-<version>.md` (when new tech in ADR)

Indirect (via design-system gate): `design/ux/DESIGN.md`, `design-system.html`, `accessibility.html` (when gate dispatches `asd-design-system`).

## Agents delegated to
- `asd-pm` (state + decisions-log)
- `asd-ba` (PRD)
- `asd-ux-designer` (UX-spec; inline delta)
- `asd-architect` (ADR; optional c4-full; tech-reference)

## Skills/workflows dispatched
- `asd-design-system` (only when gate detects missing DESIGN.md / design-system.html / accessibility.html)

## Return contract (single line)
```
PHASE: design | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: design-review
```

## References
- `.asd/rules/sprint-lifecycle.md` (design phase contract, in-phase precondition chain)
- `.asd/rules/checkpoints.md` (per-artifact approval)
- `.asd/rules/language-policy.md` (section approval flow, quote translation)
- `.asd/rules/artifact-layout.md` (sprint design folder, provenance, c4 mode layouts)
- Templates: `t_prd.html`, `t_ux-spec.html`, `t_adr.html`, `t_design-md-delta.yaml`, `t_c4-model.c4`, `t_c4-views.c4`, `t_subsystems.yaml`, `t_tech-reference.md`
