# ASD Workflow: Scope

The phase orchestrator owns this phase inline.

1. Read config and existing active/legacy archived sprints. Obtain raw scope when absent, fast-forward the base branch, require a clean tree, create the sprint branch and folder.
2. Refine scope into `sprint.md` with stable `AC-N` ids; ask the user only for ambiguity that prevents a concrete scope. Seed state and decisions log.
3. Normalize `documents.audit`: legacy `enabled` is `always`, `disabled` is `off`; `auto` skips only a complete mechanical scope with no behaviour, contract, migration or gate impact. Freeze normalized mode, effective boolean and reason in state. Reevaluate after an accepted scope expansion.
4. The initial scope is hard until it is explicitly accepted, because it establishes authority for the adaptive policy. Afterwards record the accepted user decision. A fully specified already-authorized outcome is recorded without inventing another decision.
5. Emit `NEXT: audit`.

## Artefacts

- `.asd/sprints/<NNN-slug>/sprint.md`
- `state.json`, `decisions-log.md`, branch

## Return contract

```
PHASE: scope | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: audit
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/git-strategy.md`
- `t_sprint.md`, `t_state.json`, `t_decisions-log.md`
