# ASD Workflow: Design Promote

The main phase orchestrator owns decomposition, state and gates inline.

1. Read frozen documents, drafts and audit. Intersect enabled documents with existing drafts. Empty scope is a mechanical no-op: record skipped phase and advance. After a design-block collapse (`sprint-lifecycle.md`) this phase is never dispatched.
2. Compute decomposition and migration targets. Under `checkpoints.md`, execute an already approved/in-bounds decomposition adaptively with evidence; a new subsystem or material boundary is hard and waits for the user. Record the decision before mutation.
3. For an approved new or a changed subsystem, dispatch `asd-architect` to write it to `docs/architecture/subsystems.md` and its `<id>.md` and create its folders (`sprint-lifecycle.md` "Design-promote phase").
4. Dispatch only applicable domain creators in parallel: BA promotes PRD, Architect promotes ADR/stack/tech references and, only with frozen `documents.c4` true, the diagram per `project.diagram_tool`, UX promotes UX/DESIGN and regenerates its view when changed. BA/UX have no shell: when either proposes renaming or deleting one of its persistent docs, the user approves (deletion is hard, rename follows `checkpoints.md` "Gate policy"), the main orchestrator runs `git mv`/`git rm` inline, then the creator updates content and inbound links.
5. Wait for creators; append artifact records and update `state.json` inline. Post a non-blocking summary and emit `NEXT: plan`.

Append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log".

## Delegates

- `asd-ba`, `asd-architect`, `asd-ux` only for their domain artifacts

## Return contract

```
PHASE: design-promote | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: plan
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/artifact-layout.md`
