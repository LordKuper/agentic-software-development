# ASD Workflow: Audit

Orchestration body for the `asd-phase-audit` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- `sprint.md` approved (per checkpoints precondition chain)
- `state.json.phase` advanced from `scope`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `sprint.md`
- request user decision: only on user-facing escalation from agents
- delegate to agent, sequential: `asd-ba`, `asd-architect`, `asd-pm`

## Workflow

1. Read `.asd/project/config.yaml` (`project.subsystem_decomposition`, `language.docs`)
2. Read `<sprint>/state.json` — confirm predecessor done; phase set to `audit` by PM in step 6
3. Read `<sprint>/sprint.md` (refined scope)
4. Delegate to agent `asd-ba` with payload:
   - sprint.md path, decomposition mode, language.docs; template `t_audit.md`
   - instruction:
     - scan project for existing docs any format/location (MD, TXT, DOC, DOCX, RST, HTML, PDF text, wiki exports, Confluence dumps, README outside `design/`, `.asd/project/`)
     - create/append `<sprint>/audit.md` per `t_audit.md`: Scope reference, Touched areas (docs side), Existing docs found, Documentation migration plan
     - optionally produce reverse-engineered/migrated draft PRDs in `<sprint>/design/` (with `provenance` + `source` frontmatter) when overlap with sprint scope obvious
     - emit COMPLETED
5. On BA COMPLETED → delegate to agent `asd-architect` with payload:
   - sprint.md path, audit.md path (partial), decomposition mode, `.asd/project/stubs.md` path; template `t_audit.md` (append)
   - instruction:
     - scan project source code in touched areas
     - append to `<sprint>/audit.md`: Touched areas (code side, merge), Existing implementation found, Gaps, Risks; if `decomposition=enabled` also Subsystems map
     - optionally produce reverse-engineered draft ADRs in `<sprint>/design/`
     - for any tech identified, verify `design/architecture/tech-reference/<tech>-<version>.md` exists; if missing, create reverse-engineered references via fetch-external-doc-by-URL + `t_tech-reference.md`
     - read `.asd/project/stubs.md`; filter entries whose File:Line points to touched-area files or whose Owner indicates relevance; append matching rows to audit.md "Related open stubs" section (or "no related open stubs")
     - emit COMPLETED
6. On Architect COMPLETED → delegate to agent `asd-pm` with payload:
   - audit.md path
   - instruction:
     - update `state.json` (phase=audit, updated_at)
     - present audit.md to user for approval per checkpoints.md (approve / request changes / reject)
     - on approve → append decisions-log entry, emit COMPLETED
     - on request changes → relay feedback to BA or Architect (caller decides which), loop
7. On PM COMPLETED → emit COMPLETED with return contract
8. On any agent QUESTION / FAILED / ABORT → relay, halt

## Artefacts produced
- `<sprint>/audit.md` (merged BA + Architect findings, user-approved)
- Optional reverse-engineered/migrated drafts in `<sprint>/design/` with `provenance: reverse-engineered | migrated`
- Optional new `design/architecture/tech-reference/<tech>-<version>.md` entries (reverse-engineered)

## Agents delegated to
- `asd-ba` (docs scan)
- `asd-architect` (code scan)
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
