# ASD Workflow: Plan

Orchestration body for the `asd-phase-plan` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- design-promote done: persistent `design/` docs reflect approved sprint design
- `state.json.phase` advanced from `design-promote`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, sprint.md, persistent design/ docs touched by sprint
- request user decision: rare, phase-level escalation only (PM handles section approvals)
- delegate to agent `asd-pm` (author + state + decisions-log)

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`, `project.subsystem_decomposition`)
2. Read `<sprint>/state.json` → confirm design-promote done
3. Read `<sprint>/sprint.md`, persistent design/ docs referenced (per-subsystem files updated this sprint, plus shared concept.html, stack.html, DESIGN.md, accessibility.html), `.asd/project/commands.yaml`
4. Delegate to agent `asd-pm` with payload:
   - sprint.md path, list of relevant persistent doc paths, `language.chat`, `language.docs`; template `t_plan.md`
   - instruction:
     - update `state.json` (phase=plan)
     - author plan.md skeleton first
     - per-section discussion with user in `language.chat` per QODDA + language-policy section approval flow
     - **Stub inclusion step** (before task decomposition):
       - read `<sprint>/audit.md` "Related open stubs" section
       - if non-empty: request user decision per stub: include resolution this sprint / defer (leave open) / mark accepted-debt
       - per "include": add explicit `### Task N: Resolve stub <ref>` with owner derived from stub Owner column
       - per "accepted-debt": delegate to agent creator to edit stubs.md Reason field prepending `(accepted-debt)`
       - decisions-log entry summarising stub decisions
     - **Task decomposition rules**:
       - one Task per coherent unit of work
       - each Task references AC-N from PRD it satisfies (cite in Task body or Context link)
       - subtasks as checkboxes inside `### Task N:` block only (parser-critical)
       - assign owner role per Task in body (backend-dev / frontend-dev)
       - no test-authoring Tasks or subtasks — tests are selected and written in `impl-test`, after the code exists; note per Task only the **material risk** the change carries, as input for impl-test
       - list non-trivial dependencies between tasks
     - **Definition of Done**:
       - all PRD acceptance criteria covered by Tasks
       - full test suite green at impl-test phase
       - all reviewers green at impl-review phase
     - on approval translate to `language.docs` + write `<sprint>/plan.md`
     - append decisions-log entry ("plan approved for sprint <NNN-slug>")
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
