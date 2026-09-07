# ASD Workflow: Scope

The main orchestrator owns this phase inline.

1. Read config and existing active/legacy archived sprints. Obtain raw scope when absent, fast-forward the base branch, require a clean tree, create the sprint branch and folder.
2. Refine scope into `sprint.md` with stable `AC-N` ids; ask the user only for ambiguity that prevents a concrete scope. Seed state and decisions log.
3. Normalize `documents.audit`: legacy `enabled` is `always`, `disabled` is `off`; `auto` skips only a complete mechanical scope with no behaviour, contract, migration or gate impact. Freeze the effective boolean into `state.json.documents.audit` (no separate reason field — the normalization rule is deterministic, per `sprint-lifecycle.md`). Reevaluate after an accepted scope expansion.
3a. Seed the remaining state placeholders: `{{USER_GATES}}` from `config.user_gates` (accept only `adaptive|strict`; absent -> `strict`); `{{DOC_PRD}}`/`{{DOC_UX_SPEC}}`/`{{DOC_ADR}}`/`{{DOC_C4}}` from normalized `documents.*` (absent group -> all enabled). No placeholder literal may survive the write.
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
