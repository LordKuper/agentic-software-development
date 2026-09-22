# ASD Workflow: Scope

The main orchestrator owns this phase inline.

1. Read config and existing active/legacy archived sprints. Obtain raw scope when absent, as a plain chat message, fast-forward the base branch, require a clean tree, create the sprint branch and folder.
2. Refine scope into `sprint.md` with stable `AC-N` ids; ask the user only for ambiguity that prevents a concrete scope. Before the scope gate, ask explicitly for cleanup and quality criteria (legacy removal, warning budget, doc consolidation) unless the raw scope already states them. Verify every retrospective-derived criterion against current `HEAD` before writing it, and record that verification in `decisions-log.md` per `sprint-lifecycle.md` "Orchestration and adaptive gates". Seed state and decisions log.
3. Read `documents.audit`: accept only `auto|always|off`, any other value blocks (`sprint-lifecycle.md` "Orchestration and adaptive gates"); `auto` skips only a complete mechanical scope with no behaviour, contract, migration or gate impact. Freeze the effective boolean into `state.json.documents.audit` (no separate reason field — the rule is deterministic, per `sprint-lifecycle.md`). Reevaluate after an accepted scope expansion.
3a. Seed the remaining state placeholders: `{{USER_GATES}}` from `config.user_gates` (accept only `adaptive|strict`; absent -> `strict`); `{{DOC_PRD}}`/`{{DOC_UX_SPEC}}`/`{{DOC_ADR}}` from normalized `documents.*` (absent group -> all enabled); `{{DOC_C4}}` as the effective diagram (`sprint-lifecycle.md` "Optional documents"). No placeholder literal may survive the write. At the scope gate (step 4) the user may skip an enabled optional document (`prd`/`ux_spec`/`adr`/`c4`) for this sprint only — hard, narrow-only: overwrite its frozen value with `false` and log one decisions-log line "skipped this sprint by user" (`sprint-lifecycle.md` "Optional documents").
4. The initial scope is hard until it is explicitly accepted, because it establishes authority for the adaptive policy. Afterwards record the accepted user decision. A fully specified already-authorized outcome is recorded without inventing another decision.
5. Emit `NEXT: audit`.

Append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log".

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
