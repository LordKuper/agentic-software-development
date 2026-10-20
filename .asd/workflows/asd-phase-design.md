# ASD Workflow: Design

Owner: inline orchestrator; dispatches `asd-ba`, `asd-ux`, `asd-architect`, skill `asd-design-system`.

## Entry

```json
{"requires": ["active sprint at .asd/sprints/<NNN-slug>/", "audit.md approved, or (frozen documents.audit false) the audit phase COMPLETED signal alone (checkpoints.md precondition chain)", "state.json phase advanced from audit"], "ops": ["read: config.yaml, state.json, sprint.md, audit.md, audit-produced reverse/migrated drafts in <sprint>/design/", "search repo: design-system gate files (step 7)", "write a file: state.json inline, mechanical non-gate writes at steps 2, 5, 11 (sprint-lifecycle.md 'State recovery'); decisions-log inline, per-artifact entries at steps 6-9 on that artifact's accept", "request user decision: accept loops (steps 6, 8, 9), token gate (step 8), creator QUESTIONs (step 13), phase-level escalation", "delegate to agent, sequential: BA, UX, Architect, optional Architect (c4-full)", "dispatch skill asd-design-system (step 7)", "append friction: F-N entries to <sprint>/friction-log.md (sprint-lifecycle.md 'Friction log')", "timing: dispatch ops around the agent dispatches of steps 6, 8, 9 and 10 (sprint-lifecycle.md 'Operation timing')"]}
```

## Inputs

```json
[".asd/project/config.yaml (project.diagram_tool, language.chat, language.docs)", "state.json frozen documents.prd, ux_spec, adr, c4", "<sprint>/sprint.md", "<sprint>/audit.md (when present)", "existing drafts in <sprint>/design/ (provenance flag)"]
```

## Steps

1. Read `<sprint>/state.json` — frozen `documents.prd`, `documents.ux_spec`, `documents.adr`, `documents.c4`. `state.json.documents.c4` already holds the effective diagram computed once at `scope` (`sprint-lifecycle.md` "Optional documents"); read it as-is here, never recompute against the live config — a mid-sprint `diagram_tool` or `subsystem_decomposition` edit must not change this sprint's preconditions.
2. **Collapsed no-op path** — defensive fallback for a direct re-dispatch; the audit exit normally collapses first (`sprint-lifecycle.md` "Design/design-review/design-promote collapse"). If `prd`, `ux_spec`, `adr`, and `documents.c4` (already effective) all disabled: perform **one** deterministic check covering all three no-op phases at once — never dispatch `design-review`/`design-promote` as separate steps for this sprint. Write inline (mechanical, no gate, `sprint-lifecycle.md` "No-op phase rule" + "Skip record" multi-phase case), in a single write: set `phase="design-promote"` (the last of the three collapsed phases, so the next phase in the `standard` definition's `phases` is `plan` and a resumed session cannot re-enter this block), append `["design", "design-review", "design-promote"]` to `state.json.skipped_phases`, append **one** decisions-log line "design/design-review/design-promote skipped (no documents enabled)"; emit phase COMPLETED with `NEXT: plan`; skip remaining steps.
3. Read `.asd/project/config.yaml`, `<sprint>/sprint.md`, `audit.md` (if it exists).
4. List existing drafts in `<sprint>/design/` (from audit, with `provenance` flag).
5. Write `state.json` (phase=design) inline (mechanical, no gate).
6. **Step PRD** — only if `prd` enabled: delegate to agent `asd-ba`:
   - instruction: author sprint PRD draft covering all scope as User stories + Acceptance criteria (plus optional one-line Problem) — Goals/Non-goals omitted entirely, deferred to design-promote's persistent-doc fold; write `<sprint>/design/prd.html`; emit COMPLETED with a per-section delta summary in `language.chat`
   - **accept loop** [GATE write-then-review-accept: PRD] (orchestrator, `checkpoints.md` mechanic): post the absolute path + that summary, discuss sections with the user in `language.chat`; on requested changes → re-dispatch the creator fresh with its original task plus the feedback; loop until explicit `accept`
   - on `accept` → workflow appends decisions-log entry inline ("`<sprint>/design/prd.html` accepted")
   - if `prd` disabled → skip to step 7 (downstream steps read `sprint.md` directly instead of `prd.html`)
7. **Step Design-system gate** — only if `ux_spec` enabled, after step 6: search repo for existence of all three: `docs/ux/DESIGN.md`, `docs/ux/design-system.html`, `docs/ux/accessibility.html`
   - if ANY missing → dispatch skill `asd-design-system`; halt until COMPLETED; on FAILED/aborted → relay + halt phase
   - on `asd-design-system` COMPLETED → workflow appends decisions-log entry inline, one combined entry naming all three accepted paths ("`docs/ux/DESIGN.md`, `docs/ux/design-system.html`, `docs/ux/accessibility.html` accepted")
   - if all present, or `ux_spec` disabled → step 8
8. **Step UX-spec** — only if `ux_spec` enabled, on gate cleared: on Windows, run command `designmd-install` once per session, then delegate to agent `asd-ux`:
   - instruction: author flows + UI mockups using ONLY existing DESIGN.md tokens; when a needed token is missing/must change, return `QUESTION` proposing the token add/update; once re-dispatched with the approval, append the entry to `<sprint>/design/design-md-delta.yaml` (create on first entry per `t_design-md-delta.yaml`), THEN continue mockup referencing the new token; write `<sprint>/design/ux-spec.html`; emit COMPLETED with a per-section delta summary in `language.chat` (delta file produced inline iff a token gap surfaced — else omitted)
   - **token gate** [GATE adaptive: design token] (orchestrator): UX's token `QUESTION` is approve-before-write (`checkpoints.md` "Gate mechanics"), separate from the accept loop below, relayed per `agent-protocol.md` "Relay"
   - accept loop as step 6 [GATE write-then-review-accept: UX-spec]
   - on `accept` → workflow appends decisions-log entry inline ("`<sprint>/design/ux-spec.html` accepted")
   - if `ux_spec` disabled → skip to step 9
9. **Step ADR** — only if `adr` enabled, after step 8: delegate to agent `asd-architect`:
   - instruction: author one+ ADRs for sprint scope (repeated `<article>` blocks), sprint-local numbering (`ADR-1`, `ADR-2`, …), status `proposed`/`accepted` only; optionally name a candidate Fold target per decision; for any new tech, create/update `tech-reference/<tech>-<version>.md` via fetch-external-doc-by-URL + `t_tech-reference.md` (this sub-write carries no gate of its own — it is source material folded into the ADR, which itself carries the accept loop below); write `<sprint>/design/adr.html`; emit COMPLETED with a per-decision delta summary in `language.chat`
   - accept loop as step 6 [GATE write-then-review-accept: ADR] — **one `accept` covers the whole sprint ADR set**, never per-decision
   - on `accept` → workflow appends decisions-log entry inline ("`<sprint>/design/adr.html` accepted")
   - if `adr` disabled → skip to step 10
10. **Step c4-full** — only if frozen `documents.c4` (already effective) enabled, after step 9: delegate to agent `asd-architect`
    - templates per `project.diagram_tool`: likec4 `t_c4-model.c4`, `t_c4-views.c4`, producing `<sprint>/design/c4-full/model/*.c4`, `views.c4` against `docs/architecture/c4/`; mermaid `t_subsystems.md`, producing `<sprint>/design/c4-full/subsystems.md` against the registry's diagram block
    - instruction: author a **delta patch** against the persistent diagram covering sprint scope; author the **full schema** instead only when the persistent diagram does not yet exist; never build `dist/` here (generated output no reviewer sees, `external-review.md`); write the files directly — `c4-full/` carries no approval gate of any kind (neither class, `checkpoints.md`), so there is no discuss/approve step here; post the absolute path(s) + a brief summary in chat (still no content dumps — `checkpoints.md`'s link-and-summary rule applies even without a gate); emit COMPLETED
    - if `documents.c4` disabled (`diagram_tool: none`, or `subsystem_decomposition: disabled`) → `c4-full/` omitted
11. On all enabled steps COMPLETED → write `state.json` (drafts ready) inline; post a non-blocking rollup SUMMARY chat note listing drafts produced and skipped (informational only — per-artifact decisions-log entries already recorded at each step's `accept`, steps 6-9) — mechanical, no gate.
12. Exit per `## Exit`.
13. Any creator `QUESTION` or `ADVICE_NEEDED` → `agent-protocol.md` "Relay"; any creator FAILED / ABORT → relay, halt.

## Rules

- Drafts cover the whole sprint scope in `<sprint>/design/`, one artifact per enabled document only — a disabled document produces no draft, no gate, no dependency on it.
- Order: PRD, design-system gate (blocks UX-spec), UX-spec, ADR, c4-full — each only when enabled.
- A creator integrates an existing draft, preserving `provenance` + `source` when present, and translates its draft to `language.docs`.
- `design-md-delta.yaml` holds proposed DESIGN.md token changes, produced inline during UX-spec authoring only on a token gap; each entry user-approved (step 8 token gate).

## Dispatch

```json
[{"agent": "asd-ba", "when": "step 6", "payload": ["inputs.requirements (sprint.md)", "inputs.audit", "inputs.draft (existing prd draft)", "inputs.template (t_prd.html)", "language"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "FAILED", "ABORT"]}, {"agent": "asd-ux", "when": "step 8", "payload": ["inputs.requirements (prd.html if enabled, else sprint.md)", "inputs.audit", "inputs.draft (existing ux-spec draft)", "inputs.ux (current DESIGN.md, design-system.html, accessibility.html)", "inputs.template (t_ux-spec.html, t_design-md-delta.yaml)", "answers (approved token)", "language"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "FAILED", "ABORT"]}, {"agent": "asd-architect", "when": "step 9", "payload": ["inputs.requirements (whichever of prd.html/ux-spec.html exist, else sprint.md)", "inputs.audit", "inputs.draft (existing adr draft)", "inputs.contracts (docs/architecture/stack.html)", "inputs.fold_targets (persistent docs/ by responsibility.owns, tech-reference/)", "inputs.template (t_adr.html)", "language"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "FAILED", "ABORT"]}, {"agent": "asd-architect", "when": "step 10", "payload": ["inputs.drafts (whichever exist; ADR not required)", "inputs.contracts (docs/architecture/stack.html)", "inputs.registry (docs/architecture/subsystems.md)", "inputs.diagram (persistent diagram: likec4 docs/architecture/c4/, mermaid the registry's diagram block)", "inputs.requirements (sprint.md)", "inputs.template (per diagram_tool)"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "FAILED", "ABORT"]}]
```

## Exit

```json
{"writes": ["<sprint>/design/prd.html: requirements + acceptance criteria (documents.prd)", "<sprint>/design/ux-spec.html: flows + accessibility notes (documents.ux_spec)", "<sprint>/design/adr.html: architecture decisions (documents.adr)", "<sprint>/design/design-md-delta.yaml (token gap only)", "<sprint>/design/c4-full/ (frozen documents.c4; layout per diagram_tool)", "docs/architecture/tech-reference/<tech>-<version>.md (new tech in ADR)", "docs/ux/DESIGN.md, design-system.html, accessibility.html (via asd-design-system, step 7)", "state.json", "decisions-log.md"], "next": [{"if": "collapsed no-op path (step 2)", "next": "plan"}, {"if": "otherwise", "next": "design-review"}]}
```

## Return

```
PHASE: design | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <design-review | plan>
```

## References

- `.asd/rules/sprint-lifecycle.md` (in-phase precondition chain)
- `.asd/rules/checkpoints.md` (per-artifact approval)
- `.asd/rules/language-policy.md` ("Write-then-review-accept: chat-language self-sufficiency", quote translation)
- `.asd/rules/artifact-layout.md` (sprint design folder, provenance, c4 mode layouts)
- Templates: `t_prd.html`, `t_ux-spec.html`, `t_adr.html`, `t_design-md-delta.yaml`, `t_c4-model.c4`, `t_c4-views.c4`, `t_subsystems.md`, `t_tech-reference.md`
