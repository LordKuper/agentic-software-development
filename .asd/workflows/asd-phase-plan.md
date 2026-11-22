# ASD Workflow: Plan

Owner: inline orchestrator; dispatches `asd-scout` for read-only scan summaries.

## Entry

```json
{"requires": ["active sprint at .asd/sprints/<NNN-slug>/", "predecessor done per the frozen workflow (sprint-lifecycle.md 'Workflows'): standard — design-promote done (persistent docs reflect approved sprint design) or the collapse test holds (sprint-lifecycle.md 'Design/design-review/design-promote collapse'); lite — audit done or skipped", "state.json phase advanced from design-promote (standard) or audit (lite)"], "ops": ["context: node .asd/runtime.js context --phase plan --role orchestrator at entry, read it; --role asd-scout before each ## Dispatch delegation, passed as inputs.context; --out per agent-protocol.md 'Dispatch payload'", "append friction: F-N to <sprint>/friction-log.md per sprint-lifecycle.md 'Friction log'", "timing: a dispatch op around each ## Dispatch delegation, user-wait ops (sprint-lifecycle.md 'Operation timing')"]}
```

## Inputs

```json
[".asd/project/config.yaml (language.chat, language.docs, project.subsystem_decomposition)", "state.json frozen workflow, documents.prd, documents.audit", "<sprint>/sprint.md", "requirements: acceptance-criteria source (sprint-lifecycle.md 'Input sources')", "persistent docs referenced: decomposition enabled — docs/architecture/subsystems.md and each touched subsystem's <id>.md, to locate its code; per-subsystem files updated this sprint, plus shared concept.html, stack.html, DESIGN.md, accessibility.html — only whichever exist", ".asd/project/commands.yaml", "lite: <sprint>/audit.md when audit ran", "research (sprint-lifecycle.md 'Input sources'): read first; research only the technical delta it leaves (design-principles.md §11)", "<sprint>/decisions-log.md and every rotated segment (artifact-layout.md 'Decisions log'); an accepted ux-spec — sprint draft, else persistent — only when one exists", ".asd/project/stubs.md", "t_plan.md"]
```

## Steps

1. Read config and `<sprint>/state.json`.
2. Confirm the predecessor per `## Entry`.
3. Read the remaining `## Inputs`.
4. Write `state.json` (phase=plan) inline, then author `plan.md`:
   - plan.md skeleton first; per-section discussion in `language.chat` per QODDA (`core.md`) + `core.md`'s "Incremental writing"
   - **Stub inclusion step** (before task decomposition):
     - if `documents.audit` enabled: read `<sprint>/audit.md` "Related open stubs" section
     - if `documents.audit` disabled: grep touched-area files (from sprint.md scope) directly against `.asd/project/stubs.md` File:Line column for matches
     - if any found: request user decision per stub [GATE hard: stub disposition]: include resolution this sprint / defer (leave open) / mark accepted-debt; each offer states the stub's verified cost and behaviour change
     - per "include": add explicit `### Task N: Resolve stub <ref>` with owner derived from stub Owner column — except a stub whose files are all tests: it gets no Task and routes to `impl-test` as a plain-text line `Stub <ref> → impl-test` outside every `### Task N:` block, never a checkbox, also recorded in the decisions-log entry below
     - per "accepted-debt": edit stubs.md Reason field prepending `(accepted-debt)` inline after its applicable gate
     - decisions-log entry summarising stub decisions
   - Locating the code a Task touches may be delegated to `asd-scout` (a question plus paths; read-only, returns a `path:line`-cited summary); the orchestrator reads every section a summary cites that it relies on before writing a Task, and the plan stays its own.
   - **Task decomposition** per `sprint-lifecycle.md` "Plan file format" (declarations, Wave declaration, Decomposition rules), plus:
     - one Task per coherent unit of work; each Task cites in its body the AC-N it satisfies
     - subtasks as checkboxes inside `### Task N:` block only (parser-critical)
     - no test-authoring Tasks or subtasks, except a `Test-only` Task; note per Task only its `Material risk` declaration, as input for impl-test
     - For a public contract change, identify affected test call sites and the build that checks them. Group compile-only adaptations with the contract Task in the dependency graph. Schedule any test-file edits as a `Test-only` Task first in the next wave, preserving test assertions. The contract wave must still pass its applicable build. When it would fail before the adapters land, plan a compatible intermediate change or resolve the sequencing at the plan gate. Place build-dependent work after the wave that verifies those callers compile.
     - write the wave table into `## Dependencies`; list non-trivial dependencies under the table
   - **Alert and deduplication keys.** When a decision governs an alert-episode or deduplication key, record its behavior under history retention, threshold changes, recovery without new data, and a backward clock adjustment. Record why an inapplicable case does not arise.
   - **Definition of Done**: reference the standing DoD (`sprint-lifecycle.md` "Plan file format") instead of restating it; author only sprint-specific additions, if any
   - **Decision coverage** (`t_plan.md`): one `## Decision coverage` row per user decision, in the decisions log or an accepted ux-spec, that sets or changes a requirement, behaviour or design choice, mapped to an `AC-N`/Task or an `Out of scope` line; process gates (workflow choice, triage authorisation, retro dispositions, ASD update, an approach choice `research.md` already reflects) are no rows; no such decision: omit the section
   - **Build check**: run `commands.yaml` `build` once; a non-zero exit is `FAILED` naming the command and its first error lines, before the step 5 gate
   - **Deployment references.** Before step 5, verify the tech references for infrastructure commands used by each deployment Task per `artifact-layout.md` "Tech reference docs". Verify each pinned image tag exists through its configured registry's authoritative interface and record the full image reference and verification in the Task. Resolve a missing reference, absent tag or unverified registry lookup before accepting the plan.
   - translate skeleton + full draft to `language.docs`, write `<sprint>/plan.md`
5. Apply `checkpoints.md` to the completed plan [GATE write-then-review-accept: plan] and record either user approval (explicit `accept` in strict) or adaptive evidence; append decisions-log entry ("`<sprint>/plan.md` accepted"); exit per `## Exit`.

## Dispatch

```json
[{"agent": "asd-scout", "when": "locating touched code before task decomposition, step 4", "payload": ["inputs.context", "question and paths"], "signals": ["COMPLETED", "ABORT"]}]
```

## Exit

```json
{"writes": ["<sprint>/plan.md", "state.json (phase=plan)", "decisions-log.md"], "next": [{"if": "plan accepted", "next": "impl"}]}
```

## Return

```
PHASE: plan | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: impl
```

## References

- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md` ("Write-then-review-accept: chat-language self-sufficiency")
- `.asd/rules/artifact-layout.md`
- Templates: `t_plan.md`
