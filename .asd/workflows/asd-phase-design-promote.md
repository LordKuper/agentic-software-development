# ASD Workflow: Design Promote

Orchestration body for the `asd-phase-design-promote` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Design drafts present and approved by design-review (DoD met)
- `state.json.phase` advanced from `design-review`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, sprint design drafts, audit.md, persistent `design/`
- request user decision: rare, phase-level escalation only (PM + creators handle per-doc/per-subsystem approvals)
- delegate to agent: PM (orchestrator), Architect, BA, UX Designer (domain promoters)

## Workflow

1. Read `<sprint>/state.json` — read frozen `documents.prd`/`ux_spec`/`adr`/`c4`. Compute promotion scope as the **intersection** of (a) frozen `documents.*` enabled and (b) the file actually existing in `<sprint>/design/` (mirrors design-review's scope rule, `sprint-lifecycle.md` "Optional documents") — a draft whose flag is disabled is never promoted even if it physically exists
2. **No-op path** — if the intersected scope is empty: delegate to agent `asd-pm` to set `phase=design-promote`, append `"design-promote"` to `state.json.skipped_phases`, append decisions-log "design-promote skipped (nothing to promote)" — **no user decision requested** (`sprint-lifecycle.md` "No-op phase rule"); emit phase COMPLETED with return contract; skip remaining steps
3. Read `.asd/project/config.yaml` (`project.subsystem_decomposition`, `project.diagram_tool`, `system.tools.likec4`, `system.tools.designmd`, `language.chat`, `language.docs`)
4. Confirm design-review DoD met
5. Read sprint drafts + audit migration plan (if `audit.md` exists)
6. **PM orchestration** — delegate to agent `asd-pm`:
   - update `state.json` (phase=design-promote)
   - if `subsystem_decomposition: enabled`:
     - propose overall per-subsystem split (which subsystems touched, which fragments go where); request user decision; iterate
     - detect new subsystems inferred from drafts; per each request user decision (name, parent container, description); collect approvals
     - distribute migration plan items to domain (architecture / product / ux / api)
   - if `disabled`: skip decomposition, mark all writes flat
   - emit decomposition map (per-domain target paths + new subsystems + migration distribution) to caller
7. **New subsystem registry update** (only if new subsystems approved in step 6) — delegate to agent `asd-architect`:
   - patch c4 registry per `project.diagram_tool` (likec4 model OR subsystems.yaml)
   - create empty domain folders per new subsystem
   - run `likec4 build` for likec4 mode (regen `c4/dist/`)
   - emit COMPLETED
8. **Parallel domain promotion** — delegate to agent in parallel, **only for domains whose sprint draft exists**:
   - **`asd-ba`** — only if `prd.html` is in scope (step 1 intersection) — payload (prd.html, decomposition map for product domain, migration items tagged product):
     - per subsystem (or flat): write decomposed PRD into `design/product/requirements/<subsystem>.html` (or `requirements.html`); merge with existing if present
     - process product migration items (`provenance: migrated|reverse-engineered` + `source`)
     - request user decision before each persistent write; show diff vs existing
     - emit COMPLETED
   - **`asd-architect`** — only if `adr.html` or `c4-full/` is in scope (step 1 intersection, independently — a repo can promote c4 without adr, or vice versa) — payload (adr.html if in scope, c4-full if in scope, decomposition map for architecture domain, migration items tagged architecture):
     - per subsystem (or flat): split adr.html decisions into `design/architecture/adr/<subsystem>/adr-NNNN-<slug>.html` (new files; NNNN globally unique)
     - merge new API contracts into `design/architecture/api/<subsystem>.html` (or `api.html`)
     - update `design/architecture/stack.html` + `tech-reference/` entries if sprint introduced new tech
     - compute c4 delta from `<sprint>/design/c4-full/` vs persistent `design/architecture/c4/`; apply patches; regenerate `c4/dist/` (likec4) or `architecture.html` (mermaid)
     - process architecture migration items
     - request user decision before each persistent write
     - emit COMPLETED
   - **`asd-ux-designer`** — only if `ux-spec.html` is in scope (step 1 intersection) — payload (ux-spec.html, design-md-delta.yaml if present, decomposition map for ux domain, migration items tagged ux):
     - per subsystem (or flat): split ux-spec into `design/ux/<subsystem>.html` (or `ux-spec.html`); merge with existing
     - if `design-md-delta.yaml` present: apply add/update/remove ops to `design/ux/DESIGN.md`; if `system.tools.designmd` true, run `designmd-lint` from `commands.yaml`; halt on lint errors. On Windows run `designmd-install` once per session before first `designmd-lint`/`-diff`/`-export` (no-op on Linux/macOS). Never inline the linter binary — always go through `designmd-*` commands.
     - regenerate `design/ux/design-system.html` from patched DESIGN.md (only if DESIGN.md changed)
     - process ux migration items
     - request user decision before each persistent write
     - emit COMPLETED
9. Wait all dispatched creators COMPLETED
10. **Final mutation confirmation** — delegate to agent `asd-pm`:
   - present summary of all persistent writes (per-domain counts + new subsystems + files touched)
   - request user decision: confirm finalize / rollback / partial rollback
   - on confirm: compose decisions-log entries (decomposition, each new subsystem, each promoted artefact, DESIGN.md patch, c4 patch) and append to `.asd/project/decisions-log.md`
   - update `state.json` (phase=design-promote done)
   - emit COMPLETED
11. Emit phase COMPLETED with return contract
12. Any agent QUESTION / FAILED / ABORT → relay, halt

## Artefacts produced
- Persistent docs under `design/` per domain (per subsystem when decomposition enabled, flat when disabled)
- Patched `design/ux/DESIGN.md` (when delta present)
- Regenerated `design/ux/design-system.html` (when DESIGN.md changed)
- Patched `design/architecture/c4/` (when c4-full present); regenerated `c4/dist/` (likec4) or `architecture.html` (mermaid)
- New `design/architecture/tech-reference/<tech>-<version>.md` if applicable
- Appended decisions-log entries

## Agents delegated to
- `asd-pm` (orchestration, new subsystem proposals, state, decisions-log, final confirm)
- `asd-architect` (architecture domain + c4 registry updates)
- `asd-ba` (product domain)
- `asd-ux-designer` (ux domain)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: design-promote | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: plan
```

## References
- `.asd/rules/sprint-lifecycle.md` (design-promote phase contract)
- `.asd/rules/artifact-layout.md` (path map per decomposition mode, c4 modes, promotion rules)
- `.asd/rules/checkpoints.md` (per-promotion approval, new-subsystem approval, final mutation confirm)
- `.asd/rules/language-policy.md`
- Templates: `t_prd.html`, `t_adr.html`, `t_ux-spec.html`, `t_api.html`, `t_design-system.html`, `t_subsystems.yaml`, `t_tech-reference.md`, `t_decisions-log.md`
