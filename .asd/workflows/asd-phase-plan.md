# ASD Workflow: Plan

Orchestration body for the `asd-phase-plan` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- design-promote done: persistent docs reflect approved sprint design
- `state.json.phase` advanced from `design-promote`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, sprint.md, persistent docs touched by sprint
- write a file: `state.json` inline, for the mechanical non-gate phase-field write at step 4 (`sprint-lifecycle.md` "State recovery")
- request user decision: rare, phase-level escalation only (PM handles section approvals)
- delegate to agent `asd-pm` (author + gated approval + decisions-log)

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`, `project.subsystem_decomposition`); read `<sprint>/state.json` — frozen `documents.prd`, `documents.audit`
2. Read `<sprint>/state.json` → confirm design-promote done
3. Read `<sprint>/sprint.md`, persistent docs referenced (per-subsystem files updated this sprint, plus shared concept.html, stack.html, DESIGN.md, accessibility.html — only whichever exist), `.asd/project/commands.yaml`. Acceptance-criteria source: PRD AC-N when `documents.prd` enabled, else `sprint.md`'s own `AC-N` list (`sprint-lifecycle.md` "Optional documents").
4. Write `state.json` (phase=plan) inline (mechanical, no gate); delegate to agent `asd-pm` with payload:
   - sprint.md path, list of relevant persistent doc paths, acceptance-criteria source, `language.chat`, `language.docs`; template `t_plan.md`
   - instruction:
     - author plan.md skeleton first
     - per-section discussion with user in `language.chat` per QODDA + language-policy section approval flow
     - **Stub inclusion step** (before task decomposition):
       - if `documents.audit` enabled: read `<sprint>/audit.md` "Related open stubs" section
       - if `documents.audit` disabled: grep touched-area files (from sprint.md scope) directly against `.asd/project/stubs.md` File:Line column for matches
       - if any found: request user decision per stub: include resolution this sprint / defer (leave open) / mark accepted-debt
       - per "include": add explicit `### Task N: Resolve stub <ref>` with owner derived from stub Owner column
       - per "accepted-debt": delegate to agent `asd-pm` to edit stubs.md Reason field prepending `(accepted-debt)`
       - decisions-log entry summarising stub decisions
     - **Task decomposition rules**:
       - one Task per coherent unit of work
       - each Task references an AC-N from the acceptance-criteria source it satisfies (cite in Task body)
       - subtasks as checkboxes inside `### Task N:` block only (parser-critical)
       - assign owner role per Task in body (backend-dev / frontend-dev)
       - no test-authoring Tasks or subtasks — tests are selected and written in `impl-test`, after the code exists; note per Task only the **material risk** the change carries, as input for impl-test
       - list non-trivial dependencies between tasks
     - **Definition of Done**: reference the standing DoD (`sprint-lifecycle.md` "Plan file format") instead of restating it; author only sprint-specific additions, if any
     - **write-then-review-accept** (`checkpoints.md` mechanic): translate skeleton + full draft to `language.docs` and write `<sprint>/plan.md`; post the absolute path + a short delta summary in chat — never the artifact body
     - user reviews `plan.md` on disk and replies `accept` (advance) or gives feedback (revise the same file in place, no `-v2`, and re-post path + summary); loop until explicit `accept`
     - on explicit `accept`: append decisions-log entry ("plan accepted for sprint <NNN-slug>")
     - emit COMPLETED
5. On PM COMPLETED → emit phase COMPLETED with return contract
6. On PM QUESTION / FAILED / ABORT → relay, halt

## Artefacts produced
- `<sprint>/plan.md`
- Updated `state.json` (phase=plan)
- decisions-log entry

## Agents delegated to
- `asd-pm` (single delegation)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: plan | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: impl
```

## References
- `.asd/rules/sprint-lifecycle.md` (plan phase contract)
- `.asd/rules/checkpoints.md` (plan approval gate)
- `.asd/rules/language-policy.md` (section approval flow)
- `.asd/rules/artifact-layout.md`
- Templates: `t_plan.md` (canonical plan structure)
