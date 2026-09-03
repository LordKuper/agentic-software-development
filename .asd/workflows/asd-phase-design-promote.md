# ASD Workflow: Design Promote

Orchestration body for the `asd-phase-design-promote` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Design drafts present and approved by design-review (DoD met)
- `state.json.phase` advanced from `design-review`. When design was the collapsed no-op (all four `documents.*` disabled), this phase is never separately dispatched — `state.json.phase` is written straight to `design-promote` by design's step 2, and `NEXT: plan` fires from there

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, sprint design drafts, audit.md, persistent `docs/`
- write a file: `state.json` and decisions-log inline, for the no-op path's mechanical write (step 2) and the post-promotion bookkeeping write (step 10)
- request user decision: rare, phase-level escalation only (PM handles decomposition + new-subsystem approvals)
- delegate to agent: PM (orchestrator), Architect, BA, UX (domain promoters)

## Workflow

1. Read `<sprint>/state.json` — read frozen `documents.prd`/`ux_spec`/`adr`/`c4`. Compute promotion scope as the **intersection** of (a) frozen `documents.*` enabled and (b) the file actually existing in `<sprint>/design/` (mirrors design-review's scope rule, `sprint-lifecycle.md` "Optional documents") — a draft whose flag is disabled is never promoted even if it physically exists
2. **No-op path** — the all-`documents.*`-disabled case is handled entirely by `asd-phase-design.md` step 2's collapsed check and never reaches this phase as a separate dispatch. This step is the defensive fallback for the residual case of an intersected scope somehow empty on direct/explicit re-dispatch of this phase alone: write inline (mechanical, no gate — no user decision requested, `sprint-lifecycle.md` "No-op phase rule"): set `phase=design-promote`, append `"design-promote"` to `state.json.skipped_phases`, append decisions-log "design-promote skipped (nothing to promote)"; emit phase COMPLETED with return contract; skip remaining steps
3. Read `.asd/project/config.yaml` (`project.subsystem_decomposition`, `project.diagram_tool`, `system.tools.likec4`, `system.tools.designmd`, `language.chat`, `language.docs`)
4. Confirm design-review DoD met
5. Read sprint drafts + audit migration plan (if `audit.md` exists)
6. **PM orchestration** — delegate to agent `asd-pm`:
   - update `state.json` (phase=design-promote)
   - if `subsystem_decomposition: enabled`:
     - propose overall per-subsystem split (which subsystems touched, which fragments go where); request user decision; iterate
     - detect new subsystems inferred from drafts; per each request user decision (name, parent container, description); collect approvals
     - distribute migration plan items to domain (architecture / product / ux)
   - if `disabled`: skip decomposition, mark all writes flat
   - emit decomposition map (per-domain target paths + new subsystems + migration distribution) to caller
7. **New subsystem registry update** (only if new subsystems approved in step 6) — delegate to agent `asd-architect`:
   - patch c4 registry per `project.diagram_tool` (likec4 model OR subsystems.yaml)
   - create empty domain folders per new subsystem
   - emit COMPLETED
8. **Parallel domain promotion** — delegate to agent in parallel, **only for domains whose sprint draft exists**:
   - **`asd-ba`** — only if `prd.html` is in scope (step 1 intersection) — payload (prd.html, decomposition map for product domain, migration items tagged product):
     - per subsystem (or flat): fold the sprint draft's User stories + Acceptance criteria into `docs/product/requirements/<subsystem>.html` (or `requirements.html`); the sprint draft carries no Goals/Non-goals — author the persistent doc's required Goals (and optional Non-goals) now, merging with existing content if present
     - process product migration items (`provenance: migrated|reverse-engineered` + `source`)
     - show diff vs existing (informational, no approval gate)
     - emit COMPLETED
   - **`asd-architect`** — only if `adr.html` or `c4-full/` is in scope (step 1 intersection, independently — a repo can promote c4 without adr, or vice versa) — payload (adr.html if in scope, c4-full if in scope, decomposition map for architecture domain, migration items tagged architecture):
     - fold every approved ADR into whichever existing persistent doc's `responsibility.owns` frontmatter already declares ownership of that decision's subject (`sprint-lifecycle.md` "Design-promote phase" fold rule) — never a lookup table, never a new `adr/` tree; use the ADR's own "Fold target" line as the candidate, verify the `owns:` match before writing; binding rejected alternatives fold as one line into the target's Constraints-equivalent section; non-binding alternatives stay sprint-archive-only; API contracts fold the same way (subsystem doc, `stack.html`, a project-generated OpenAPI/SDL/proto artifact, or Complication Approval if nothing owns it — no pre-made template)
     - update `docs/architecture/stack.html` + `tech-reference/` entries if sprint introduced new tech
     - apply the sprint's c4 delta patch from `<sprint>/design/c4-full/` to persistent `docs/architecture/c4/` (or, when the persistent registry did not exist before this sprint, write the sprint's full schema directly as the registry) — never regenerate `dist/`/`architecture.html` here, build on demand via the `commands.yaml` build-to-view command
     - process architecture migration items
     - emit COMPLETED
   - **`asd-ux`** — only if `ux-spec.html` is in scope (step 1 intersection) — payload (ux-spec.html, design-md-delta.yaml if present, decomposition map for ux domain, migration items tagged ux):
     - per subsystem (or flat): split ux-spec into `docs/ux/<subsystem>.html` (or `ux-spec.html`); merge with existing
     - if `design-md-delta.yaml` present: apply add/update/remove ops to `docs/ux/DESIGN.md`; if `system.tools.designmd` true, run `designmd-lint` from `commands.yaml`; halt on lint errors. On Windows run `designmd-install` once per session before first `designmd-lint`/`-diff`/`-export` (no-op on Linux/macOS). Never inline the linter binary — always go through `designmd-*` commands.
     - regenerate `docs/ux/design-system.html` from patched DESIGN.md — this is the sprint's **one** regeneration point (`design-system.md` §10), triggered only if `DESIGN.md` was actually touched this sprint (i.e. `design-md-delta.yaml` present and applied); no DESIGN.md change → skip regeneration entirely
     - process ux migration items
     - emit COMPLETED
9. Wait all dispatched creators COMPLETED
10. **Bookkeeping** — mechanical inline write by this workflow (no PM dispatch, no gate): compose decisions-log entries for the **ungated** items only (each promoted artefact, DESIGN.md patch, c4 patch) and append to `<sprint>/decisions-log.md` — decomposition and each new subsystem already got their own decisions-log entry from `asd-pm` at step 6/7's own approval, never re-recorded here; update `state.json` (phase=design-promote done)
11. **Post-promotion summary** — ordinary phase output, no operation of its own: post a non-blocking chat note listing path/file list of everything promoted this run (per-domain counts + new subsystems + files touched); informational only, no decision requested, no wait for response (compensating control for the dropped final-mutation/partial-rollback gate, `sprint-lifecycle.md` "Design-promote phase")
12. Emit phase COMPLETED with return contract
13. Any agent QUESTION / FAILED / ABORT → relay, halt
14. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Artefacts produced
- Persistent docs under `docs/` per domain (per subsystem when decomposition enabled, flat when disabled)
- Patched `docs/ux/DESIGN.md` (when delta present)
- Regenerated `docs/ux/design-system.html` (once per sprint, only when DESIGN.md changed this sprint — `design-system.md` §10)
- Patched `docs/architecture/c4/` (when c4-full present) — `dist/`/`architecture.html` are build output, not regenerated here
- New `docs/architecture/tech-reference/<tech>-<version>.md` if applicable
- Appended decisions-log entries

## Agents delegated to
- `asd-pm` (orchestration, new subsystem proposals); no-op path (step 2) and post-promotion bookkeeping (step 10) are inline workflow writes, no PM dispatch
- `asd-architect` (architecture domain + c4 registry updates)
- `asd-ba` (product domain)
- `asd-ux` (ux domain)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: design-promote | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: plan
```

## References
- `.asd/rules/sprint-lifecycle.md` (design-promote phase contract)
- `.asd/rules/artifact-layout.md` (path map per decomposition mode, c4 modes, promotion rules)
- `.asd/rules/checkpoints.md` (decomposition + new-subsystem approval gates; no-content-dumps shape for the post-promotion summary)
- `.asd/rules/language-policy.md`
- Templates: `t_prd.html`, `t_adr.html`, `t_ux-spec.html`, `t_design-system.html`, `t_subsystems.yaml`, `t_tech-reference.md`, `t_decisions-log.md`
