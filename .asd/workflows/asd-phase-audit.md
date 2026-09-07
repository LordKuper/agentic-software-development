# ASD Workflow: Audit

1. Read frozen audit state and its recorded reason. A frozen false audit is a mechanical skip; record it and emit `NEXT: design`.
2. Dispatch `asd-architect` to inspect source, documentation, stubs, gaps, risks and migration needs, returning all `t_audit.md` sections as text. It may identify evidenced material product/domain ambiguity.
3. Only for that evidenced ambiguity, dispatch `asd-ba` for the affected product/domain findings. The orchestrator merges returned text into `audit.md`.
4. Apply `checkpoints.md`: in adaptive mode record valid evidence and advance; otherwise present the audit and await the applicable decision. Record actor, evidence and revision.

## Delegates

- `asd-architect` — single default audit owner
- `asd-ba` — only evidenced material product/domain ambiguity

## Return contract

```
PHASE: audit | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: design
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `t_audit.md`
