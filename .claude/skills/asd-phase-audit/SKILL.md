---
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint. Updates state.json to phase=audit, dispatches asd-ba to scan existing documentation in any format/location and produce the Existing docs found and Documentation migration plan sections of audit.md, then dispatches asd-architect to scan existing source code and produce the Existing implementation found, Gaps, Risks, and Subsystems map sections. Optionally either agent may pre-formulate reverse-engineered or migrated drafts in <sprint>/design/ when sprint scope directly overlaps with found content (with provenance frontmatter). Finally dispatches asd-pm to present the merged audit.md for user approval. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
metadata:
  asd-role: phase
  asd-order: "2"
  version: "0.1"
allowed-tools: "Read AskUserQuestion Task"
---

# ASD Phase: Audit

## Preconditions
- Active sprint exists at `.asd/sprints/<NNN-slug>/`
- `sprint.md` approved (per checkpoints precondition chain)
- `state.json.phase` advanced from `scope`

## Tool policy
- Read — `.asd/config.yaml`, `state.json`, `sprint.md`
- AskUserQuestion — only on user-facing escalation from agents
- Task — dispatch `asd-ba`, `asd-architect`, `asd-pm` sequentially

## Workflow

1. Read `.asd/config.yaml` (note `project.subsystem_decomposition`, `language.docs`)
2. Read `<sprint>/state.json` — confirm phase predecessor done; phase will be set to `audit` by PM in step 6
3. Read `<sprint>/sprint.md` (refined scope)
4. Dispatch `asd-ba` via Task with payload:
   - sprint.md path, decomposition mode, language.docs
   - template: `t_audit.md`
   - instruction:
     - scan project for existing docs in any format/location (MD, TXT, DOC, DOCX, RST, HTML, PDF text, wiki exports, Confluence dumps, README files outside `design/`, `.asd/project/`)
     - create or append `<sprint>/audit.md` per `t_audit.md`, filling: Scope reference, Touched areas (docs side), Existing docs found, Documentation migration plan
     - optionally produce reverse-engineered or migrated draft PRDs in `<sprint>/design/` (with `provenance` + `source` frontmatter) when overlap with sprint scope is obvious
     - emit COMPLETED
5. On BA COMPLETED → dispatch `asd-architect` via Task with payload:
   - sprint.md path, audit.md path (already partial), decomposition mode, `.asd/project/stubs.md` path
   - template: `t_audit.md` (append)
   - instruction:
     - scan project source code in touched areas
     - append to `<sprint>/audit.md`: Touched areas (code side, merge), Existing implementation found, Gaps, Risks; if `decomposition=enabled` also Subsystems map
     - optionally produce reverse-engineered draft ADRs in `<sprint>/design/`
     - for any tech identified, verify `design/architecture/tech-reference/<tech>-<version>.md` exists; if missing, create reverse-engineered references via WebFetch + `t_tech-reference.md`
     - read `.asd/project/stubs.md`; filter entries whose File:Line points to files in touched areas or whose Owner indicates relevance; append matching rows to audit.md "Related open stubs" section (or "no related open stubs" if none)
     - emit COMPLETED
6. On Architect COMPLETED → dispatch `asd-pm` via Task with payload:
   - audit.md path
   - instruction:
     - update `state.json` (phase=audit, updated_at)
     - present audit.md to user for approval per checkpoints.md (approve / request changes / reject)
     - on approve → append decisions-log entry, emit COMPLETED
     - on request changes → relay user feedback to BA or Architect (caller decides which), loop
7. On PM COMPLETED → emit COMPLETED with return contract
8. On any agent QUESTION / FAILED / ABORT → relay, halt

## Artefacts produced
- `<sprint>/audit.md` (merged findings from BA + Architect, approved by user)
- Optional reverse-engineered or migrated drafts in `<sprint>/design/` with `provenance: reverse-engineered | migrated`
- Optional new `design/architecture/tech-reference/<tech>-<version>.md` entries (reverse-engineered)

## Agents dispatched
- `asd-ba` (docs scan)
- `asd-architect` (code scan)
- `asd-pm` (state + user approval)

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: audit | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: design
```

## References
- `.asd/rules/sprint-lifecycle.md` (audit phase contract)
- `.asd/rules/checkpoints.md` (approval gates, precondition chain)
- `.asd/rules/artifact-layout.md` (provenance, migration plan, tech-reference)
- Templates: `t_audit.md`, `t_prd.html`, `t_adr.html`, `t_tech-reference.md`
