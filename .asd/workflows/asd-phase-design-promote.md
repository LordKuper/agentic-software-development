# ASD Workflow: Design Promote

The main phase orchestrator owns decomposition, state and gates inline.

1. Read frozen documents, drafts and audit. Intersect enabled documents with existing drafts. Empty scope is a mechanical no-op: record skipped phase and advance.
2. Compute decomposition and migration targets. Under `checkpoints.md`, execute an already approved/in-bounds decomposition adaptively with evidence; a new subsystem or material boundary is hard and waits for the user. Record the decision before mutation.
3. For an approved new subsystem, dispatch `asd-architect` to update the C4 registry/folders.
4. Dispatch only applicable domain creators in parallel: BA promotes PRD, Architect promotes ADR/C4/stack/tech references, UX promotes UX/DESIGN and regenerates its view when changed.
5. Wait for creators; append artifact records and update `state.json` inline. Post a non-blocking summary and emit `NEXT: plan`.

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
