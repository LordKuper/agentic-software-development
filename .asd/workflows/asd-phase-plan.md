# ASD Workflow: Plan

Orchestration body for the `asd-phase-plan` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- design-promote done: persistent docs reflect approved sprint design, or the collapse test holds (`sprint-lifecycle.md` "Design/design-review/design-promote collapse")
- `state.json.phase` advanced from `design-promote`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, sprint.md, persistent docs touched by sprint
- write a file: `state.json` inline, for the mechanical non-gate phase-field write at step 4 (`sprint-lifecycle.md` "State recovery")
- request user decision: rare, phase-level escalation only
- the main orchestrator authors, gates and logs plan.md inline
- append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log"

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`, `project.subsystem_decomposition`); read `<sprint>/state.json` — frozen `documents.prd`, `documents.audit`
2. Read `<sprint>/state.json` → confirm design-promote done
3. Read `<sprint>/sprint.md`, persistent docs referenced (decomposition enabled: `docs/architecture/subsystems.md` and each touched subsystem's `<id>.md`, to locate its code; per-subsystem files updated this sprint, plus shared concept.html, stack.html, DESIGN.md, accessibility.html — only whichever exist), `.asd/project/commands.yaml`. Acceptance-criteria source: PRD AC-N when `documents.prd` enabled, else `sprint.md`'s own `AC-N` list (`sprint-lifecycle.md` "Optional documents").
4. Write `state.json` (phase=plan) inline; the main orchestrator performs:
   - sprint.md path, list of relevant persistent doc paths, acceptance-criteria source, `language.chat`, `language.docs`; template `t_plan.md`
   - instruction:
     - author plan.md skeleton first
     - per-section discussion in `language.chat` per QODDA (`core.md`) + `core.md`'s "Incremental writing"
     - **Stub inclusion step** (before task decomposition):
       - if `documents.audit` enabled: read `<sprint>/audit.md` "Related open stubs" section
       - if `documents.audit` disabled: grep touched-area files (from sprint.md scope) directly against `.asd/project/stubs.md` File:Line column for matches
       - if any found: request user decision per stub: include resolution this sprint / defer (leave open) / mark accepted-debt
       - per "include": add explicit `### Task N: Resolve stub <ref>` with owner derived from stub Owner column
       - per "accepted-debt": edit stubs.md Reason field prepending `(accepted-debt)` inline after its applicable gate
       - decisions-log entry summarising stub decisions
     - **Task decomposition rules**:
       - one Task per coherent unit of work
       - each Task references an AC-N from the acceptance-criteria source it satisfies (cite in Task body)
       - subtasks as checkboxes inside `### Task N:` block only (parser-critical)
       - no test-authoring Tasks or subtasks — tests are selected and written in `impl-test`, after the code exists; note per Task only the **material risk** the change carries, as input for impl-test
       - assign every Task to a wave and write the wave table into `## Dependencies`, a settings-change Task alone in its wave (wave 1, or a wave after every Task adding one of its keys to `t_config.yaml`), each Task that changes the dispatch or commit contract isolated ahead of the Tasks dispatched under it, per `sprint-lifecycle.md` "Plan file format"; list non-trivial dependencies under the table
       - write the Tasks' touched paths, one per line, to a temp file outside the repo; run `node .asd/runtime.js surface-check --files <path>` and declare its `files` as `Change surface: <n> files` in `## Overview`. `breach: true` blocks acceptance until a split or an approved `change-surface cap override` bound (`sprint-lifecycle.md` "Plan file format")
     - **Definition of Done**: reference the standing DoD (`sprint-lifecycle.md` "Plan file format") instead of restating it; author only sprint-specific additions, if any
     - translate skeleton + full draft to `language.docs`, write `<sprint>/plan.md`; gate mechanic (approve-before-write vs write-then-review-accept) and strict-vs-adaptive evidence requirement per `checkpoints.md` — deferred to step 5, not fixed here
     - on gate satisfied: append decisions-log entry ("`<sprint>/plan.md` accepted")
     - emit COMPLETED
5. Apply `checkpoints.md` to the completed plan and record either user approval (explicit `accept` in strict) or adaptive evidence; emit phase COMPLETED.
6. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Artefacts produced
- `<sprint>/plan.md`
- Updated `state.json` (phase=plan)
- decisions-log entry

## Return contract (single line)
```
PHASE: plan | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: impl
```

## References
- `.asd/rules/sprint-lifecycle.md` (plan phase contract)
- `.asd/rules/checkpoints.md` (plan approval gate)
- `.asd/rules/language-policy.md` ("Write-then-review-accept: chat-language self-sufficiency")
- `.asd/rules/artifact-layout.md`
- Templates: `t_plan.md` (canonical plan structure)
