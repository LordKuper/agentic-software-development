# ASD Workflow: Design Promote

Owner: inline orchestrator (decomposition, state, gates); dispatches `asd-architect`, `asd-ba`, `asd-ux`, each only for its domain artifacts.

## Entry

```json
{"requires": ["standard: design-review done (never dispatched after a design-block collapse, sprint-lifecycle.md)", "lite: impl-review DoD met (review-policy.md 'DoD per review phase') and state.json phase advanced from impl-review, else ABORT — precondition not met: impl-review DoD"], "modes": {"standard": "frozen workflow=standard: promote approved drafts after design-review", "lite": "frozen workflow=lite: promote from the accepted implementation after impl-review, no draft, no review"}, "ops": ["append friction: F-N entries to <sprint>/friction-log.md (sprint-lifecycle.md 'Friction log')", "timing: dispatch ops around the agent dispatches of steps 3 and 4 (sprint-lifecycle.md 'Operation timing')"]}
```

## Inputs

```json
["state.json frozen workflow and documents.*", "standard: approved drafts in <sprint>/design/", "lite: sprint.md, plan.md, sprint diff (<base_branch>...HEAD), audit.md when present", "audit.md"]
```

## Steps

1. Read frozen `workflow`, documents, drafts and audit. Scope: `standard` — enabled documents intersected with existing drafts; `lite` — the enabled documents. Empty scope is a mechanical no-op: record skipped phase and advance per step 5.
2. Compute decomposition and migration targets. Under `checkpoints.md`, execute an already approved/in-bounds decomposition adaptively with evidence [GATE adaptive: decomposition]; a new subsystem or material boundary is hard and waits for the user [GATE hard: new subsystem]. Record the decision before mutation.
3. For an approved new or a changed subsystem, dispatch `asd-architect` to write it to `docs/architecture/subsystems.md` and its `<id>.md` and create its folders (`sprint-lifecycle.md` "Design-promote phase").
4. Dispatch only applicable domain creators in parallel: BA promotes PRD, Architect promotes ADR/stack/tech references and, only with frozen `documents.c4` true, the diagram per `project.diagram_tool`, UX promotes UX/DESIGN and regenerates its view when changed — when `DESIGN.md` is patched, on Windows, run command `designmd-install` once per session before dispatching `asd-ux`. BA/UX do not run git writes: either returns a rename or deletion of one of its persistent docs as a proposal in its final text; the user approves it [GATE hard: doc deletion] [GATE adaptive: doc rename] (rename follows `checkpoints.md` "Gate policy"), the main orchestrator runs `git mv`/`git rm` inline, then re-dispatches that creator fresh, before step 5, to update content and inbound links. Any creator `QUESTION` or `ADVICE_NEEDED` → `agent-protocol.md` "Relay". `lite`: each creator writes or updates its enabled persistent docs from the `lite` inputs in place of drafts; with `ux_spec` enabled, run the design-system gate of `asd-phase-design.md` step 7 before dispatching `asd-ux`. Its hard gates stay (`sprint-lifecycle.md` "Workflows"), each approved before its write.
5. Wait for creators; append artifact records and update `state.json` inline. `lite`: commit the promoted docs (`git-strategy.md` "Commits"). Post a non-blocking summary; exit per `## Exit`.

## Dispatch

```json
[{"agent": "asd-architect", "when": "step 3, approved new or changed subsystem", "payload": ["inputs.subsystems (approved decomposition)"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "FAILED", "ABORT"]}, {"agent": "asd-ba, asd-architect, asd-ux", "when": "step 4, each for its enabled domain docs", "payload": ["mode", "inputs.drafts (standard)", "inputs.requirements, inputs.plan, inputs.diff, inputs.audit (lite)", "inputs.ux (asd-ux)"], "signals": ["COMPLETED", "QUESTION", "ADVICE_NEEDED", "FAILED", "ABORT"]}]
```

## Exit

```json
{"writes": ["persistent docs per enabled document", "docs/architecture/subsystems.md, <id>.md and folders (step 3)", "state.json", "artifact records", "lite: promoted-docs commit"], "next": [{"if": "standard", "next": "plan"}, {"if": "lite", "next": "retro"}]}
```

## Return

```
PHASE: design-promote | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <plan|retro>
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/artifact-layout.md`
- `.asd/rules/git-strategy.md`
