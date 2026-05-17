---
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint. Updates state.json to phase=design, then dispatches creators sequentially per the precondition chain: asd-ba for prd.html, asd-ux-designer for ux-spec.html, asd-architect for adr.html. Each creator discusses content with the user in language.chat (section by section), then writes the approved version to file in language.docs. After ADR approved, dispatches asd-ux-designer for optional design-md-delta.yaml (when DESIGN.md token changes are needed) and asd-architect for c4-full/ (when project.subsystem_decomposition is enabled; layout depends on project.diagram_tool — likec4 model files or mermaid subsystems.yaml plus architecture.html). Creators must integrate any reverse-engineered or migrated drafts left in <sprint>/design/ by the audit phase rather than duplicate. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
metadata:
  asd-role: phase
  asd-order: "3"
  version: "0.1"
allowed-tools: "Read AskUserQuestion Task"
---

# ASD Phase: Design

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- `audit.md` approved (per checkpoints precondition chain)
- `state.json.phase` advanced from `audit`

## Tool policy
- Read — `.asd/config.yaml`, `state.json`, `sprint.md`, `audit.md`, any audit-produced reverse/migrated drafts in `<sprint>/design/`
- AskUserQuestion — rare, only on phase-level user escalation
- Task — sequential dispatch: BA, UX Designer, Architect, optional UX Designer (delta), optional Architect (c4-full); plus PM for state update

## Workflow

1. Read `.asd/config.yaml` (`project.subsystem_decomposition`, `project.diagram_tool`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json`, `<sprint>/sprint.md`, `<sprint>/audit.md`
3. List existing drafts in `<sprint>/design/` (from audit phase, with `provenance` flag)
4. Dispatch `asd-pm` via Task: update `state.json` (phase=design)
5. **Step PRD**: dispatch `asd-ba` via Task:
   - inputs: sprint.md, audit.md, existing prd draft in `<sprint>/design/` (if any from audit), `language.chat`, `language.docs`
   - template: `t_prd.html`
   - instruction: integrate existing draft (preserve `provenance` + `source` if present); author full sprint PRD covering all scope; discuss each section with user in `language.chat`; on approval translate to `language.docs` and write to `<sprint>/design/prd.html`; emit COMPLETED
6. **Step UX-spec**: on BA COMPLETED → dispatch `asd-ux-designer` via Task:
   - inputs: prd.html, audit.md, existing ux-spec draft (if any), current `design/ux/DESIGN.md`, `design/ux/accessibility.html`
   - template: `t_ux-spec.html`
   - instruction: integrate existing draft; author flows + UI mockups using DESIGN.md tokens; discuss each section in `language.chat`; on approval translate + write `<sprint>/design/ux-spec.html`; emit COMPLETED
7. **Step ADR**: on UX COMPLETED → dispatch `asd-architect` via Task:
   - inputs: prd.html, ux-spec.html, existing adr draft (if any), `design/architecture/stack.html`, existing adr/, `design/architecture/tech-reference/`
   - template: `t_adr.html`
   - instruction: integrate existing draft; author one or more ADRs for sprint scope (repeated `<article>` blocks); for any new tech proposed, create/update `tech-reference/<tech>-<version>.md` via WebFetch + `t_tech-reference.md`; discuss each decision in `language.chat`; on approval translate + write `<sprint>/design/adr.html`; emit COMPLETED
8. **Optional Step design-md-delta**: on ADR COMPLETED → if UX/UI changes propose token additions/updates/removals:
   - dispatch `asd-ux-designer` via Task with template `t_design-md-delta.yaml`
   - instruction: author delta only if non-empty; discuss each change in `language.chat`; on approval write `<sprint>/design/design-md-delta.yaml` (machine yaml, caveman keys); emit COMPLETED (or COMPLETED with empty-delta note)
   - if no token changes needed → skip (no file written)
9. **Optional Step c4-full**: on ADR COMPLETED (parallel to step 8) → if `project.subsystem_decomposition: enabled`:
   - dispatch `asd-architect` via Task
   - templates per `project.diagram_tool`:
     - likec4: `t_c4-model.c4`, `t_c4-views.c4`; produce `<sprint>/design/c4-full/model/*.c4`, `views.c4`, run `likec4 build` → `dist/`
     - mermaid: `t_subsystems.yaml`; produce `<sprint>/design/c4-full/subsystems.yaml` and `architecture.html` (mermaid-rendered)
   - instruction: full schema covering sprint scope (not delta — delta computed in design-promote); discuss overall view in `language.chat`; on approval write files; emit COMPLETED
   - if `subsystem_decomposition: disabled` → skip
10. On all required steps COMPLETED → dispatch `asd-pm` to update `state.json` (drafts ready), append decisions-log entry summarising drafts produced
11. Emit phase COMPLETED with return contract
12. Any creator QUESTION → relay to user, halt; resumes on user answer
13. Any creator FAILED / ABORT → relay, halt

## Artefacts produced
- `<sprint>/design/prd.html` (required)
- `<sprint>/design/ux-spec.html` (required)
- `<sprint>/design/adr.html` (required)
- `<sprint>/design/design-md-delta.yaml` (optional, when token changes)
- `<sprint>/design/c4-full/` (optional, when `subsystem_decomposition: enabled`; layout per `diagram_tool`)
- New or updated `design/architecture/tech-reference/<tech>-<version>.md` entries (when new tech proposed in ADR)

## Agents dispatched
- `asd-pm` (state + decisions-log)
- `asd-ba` (PRD)
- `asd-ux-designer` (UX-spec; optional delta)
- `asd-architect` (ADR; optional c4-full; tech-reference)

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: design | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: design-review
```

## References
- `.asd/rules/sprint-lifecycle.md` (design phase contract, precondition chain inside phase)
- `.asd/rules/checkpoints.md` (per-artifact approval)
- `.asd/rules/language-policy.md` (section approval flow, quote translation)
- `.asd/rules/artifact-layout.md` (sprint design folder, provenance, c4 mode layouts)
- Templates: `t_prd.html`, `t_ux-spec.html`, `t_adr.html`, `t_design-md-delta.yaml`, `t_c4-model.c4`, `t_c4-views.c4`, `t_subsystems.yaml`, `t_tech-reference.md`
