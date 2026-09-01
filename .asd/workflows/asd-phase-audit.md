# ASD Workflow: Audit

Orchestration body for the `asd-phase-audit` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- `sprint.md` approved (per checkpoints precondition chain)
- `state.json.phase` advanced from `scope`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `sprint.md`
- write a file: `<sprint>/audit.md` (assembled by this workflow from BA + Architect returned text, per `t_audit.md` section ownership); `state.json` inline, for the mechanical non-gate phase-field write at step 7 (`sprint-lifecycle.md` "State recovery")
- request user decision: only on user-facing escalation from agents
- delegate to agent in parallel: `asd-ba`, `asd-architect`; delegate to agent: `asd-pm`

## Workflow

1. Read `<sprint>/state.json` — confirm predecessor done; read frozen `documents.audit`, `documents.prd`, `documents.adr`
2. **No-op path** — if `documents.audit: disabled`: delegate to agent `asd-pm` to set `phase=audit`, append `"audit"` to `state.json.skipped_phases`, append decisions-log "audit skipped (documents.audit disabled)" — **no user decision requested** (`sprint-lifecycle.md` "No-op phase rule"); emit phase COMPLETED with return contract; skip remaining steps
3. Read `.asd/project/config.yaml` (`project.subsystem_decomposition`, `language.docs`)
4. Read `<sprint>/sprint.md` (refined scope)
5. **Parallel dispatch** — both creators write disjoint `t_audit.md` sections with no content dependency; delegate to agent `asd-ba` and agent `asd-architect` in parallel:
   - `asd-ba` payload: sprint.md path, decomposition mode, language.docs, frozen `documents.prd`; template `t_audit.md`
     - instruction:
       - scan project for existing docs any format/location (MD, TXT, DOC, DOCX, RST, HTML, PDF text, wiki exports, Confluence dumps, README outside `docs/`, `.asd/project/`)
       - return as final text output (no file write), per `t_audit.md` section ownership: Scope reference, Touched areas (docs side), Existing docs found, Documentation migration plan
       - **only if `documents.prd` enabled**: optionally produce reverse-engineered/migrated draft PRDs in `<sprint>/design/` (with `provenance` + `source` frontmatter) when overlap with sprint scope obvious; if `documents.prd` disabled, never write `<sprint>/design/prd.html` — findings that would have seeded a draft go into the migration plan text instead
       - emit COMPLETED
   - `asd-architect` payload: sprint.md path, decomposition mode, `.asd/project/stubs.md` path, frozen `documents.adr`; template `t_audit.md`
     - instruction:
       - scan project source code in touched areas
       - return as final text output (no file write), per `t_audit.md` section ownership: Touched areas (code side), Existing implementation found, Gaps (incl. dependency/migration findings), Risks; if `decomposition=enabled` also Subsystems map
       - **only if `documents.adr` enabled**: optionally produce reverse-engineered draft ADRs in `<sprint>/design/`; if `documents.adr` disabled, never write `<sprint>/design/adr.html` — record the architectural finding as migration-plan/gaps text instead
       - for any tech identified, verify `docs/architecture/tech-reference/<tech>-<version>.md` exists; if missing, create reverse-engineered references via fetch-external-doc-by-URL + `t_tech-reference.md`
       - read `.asd/project/stubs.md`; filter entries whose File:Line points to touched-area files or whose Owner indicates relevance; return matching rows for "Related open stubs" section, or omit the section entirely when none match
       - emit COMPLETED
6. On both BA and Architect COMPLETED → this workflow assembles `<sprint>/audit.md` per `t_audit.md`, merging the two returned texts into their owned sections (BA: Scope reference, Touched areas docs-side, Existing docs found, Documentation migration plan; Architect: Touched areas code-side, Existing implementation found, Gaps, Risks, Subsystems map, Related open stubs) — same pattern as reviewer-file assembly in `asd-phase-impl-review.md`; write the merged file
7. Write `state.json` (phase=audit, updated_at) inline (mechanical, no gate); delegate to agent `asd-pm` with payload:
   - audit.md path
   - instruction:
     - present audit.md to user for approval per checkpoints.md (approve / request changes / reject)
     - on approve → append decisions-log entry, emit COMPLETED
     - on request changes → relay feedback to BA or Architect (caller decides which), loop (re-dispatch only the agent(s) whose section needs revision; this workflow re-assembles/updates audit.md with the revised text)
8. On PM COMPLETED → emit COMPLETED with return contract
9. On any agent QUESTION / FAILED / ABORT → relay, halt

## Artefacts produced
- `<sprint>/audit.md` (written by this workflow, assembled from BA + Architect returned text, user-approved)
- Optional reverse-engineered/migrated drafts in `<sprint>/design/` with `provenance: reverse-engineered | migrated`
- Optional new `docs/architecture/tech-reference/<tech>-<version>.md` entries (reverse-engineered)

## Agents delegated to
- `asd-ba` (docs scan) — parallel with Architect, returns text
- `asd-architect` (code scan) — parallel with BA, returns text
- `asd-pm` (state + user approval)

## Skills/workflows dispatched
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
