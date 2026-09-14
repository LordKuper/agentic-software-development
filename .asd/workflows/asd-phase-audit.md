# ASD Workflow: Audit

1. Read frozen `documents.audit` and `skip_design_phases`. A false audit is a mechanical skip: go to step 5, whose write carries its record.
2. Dispatch `asd-architect` to inspect source, documentation, stubs, gaps, risks and migration needs, returning all `t_audit.md` sections as text. It may identify evidenced material product/domain ambiguity.
3. Only for that evidenced ambiguity, dispatch `asd-ba` for the affected product/domain findings. The orchestrator merges returned text into `audit.md`.
4. Apply `checkpoints.md`: in adaptive mode record valid evidence and advance; otherwise present the audit and await the applicable decision. Record actor, evidence and revision.
5. Exit in at most one inline mechanical write (no gate), the only write for either skip; when step 1 skipped audit, it first appends `"audit"` to `skipped_phases` with that skip's decisions-log line. When `skip_design_phases` is `true`, the write sets `phase="design-promote"`, appends `["design", "design-review", "design-promote"]` to `skipped_phases` and one decisions-log line "design/design-review/design-promote skipped (skip_design_phases enabled)"; emit `NEXT: plan`. Otherwise it sets `phase="audit"` (only when step 1 skipped audit); emit `NEXT: design`.

Append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log".

## Delegates

- `asd-architect` — single default audit owner
- `asd-ba` — only evidenced material product/domain ambiguity

## Return contract

```
PHASE: audit | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <design | plan>
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `t_audit.md`
