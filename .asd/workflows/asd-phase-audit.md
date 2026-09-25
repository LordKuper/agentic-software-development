# ASD Workflow: Audit

1. Read frozen `documents.*`. A false audit is a mechanical skip: go to step 5, whose write carries its record.
2. Dispatch `asd-architect` to inspect source, every `docs/` document bearing on touched areas, other documentation, stubs, gaps, risks and migration needs, returning all `t_audit.md` sections as text with contradictions resolved by canonical precedence (`sprint-lifecycle.md` "Audit phase"). It may identify evidenced material product/domain ambiguity. When `project.subsystem_decomposition` is enabled it reads the subsystem registry, and returns a registry proposal beside the sections when the registry is absent (`sprint-lifecycle.md` "Audit phase"). When `git ls-files -- <touched areas>` counts more than `.asd/runtime.js` `AUDIT_BATCH_THRESHOLD_FILES`, the payload carries a batched-read plan: grep the touched areas first, then read only the matched sections, never whole files in bulk.
3. Only for that evidenced ambiguity, dispatch `asd-ba` for the affected product/domain findings. The orchestrator merges returned text into `audit.md`.
3a. Registry migration (decomposition enabled), per `sprint-lifecycle.md` "Audit phase": request explicit user confirmation per proposed subsystem (hard); dispatch `asd-architect` to write the registry (with any migrated diagram) and `<id>.md` of confirmed subsystems and backfill missing `<id>.md`. Then, for a redundant legacy `docs/architecture/c4/`, request user decision (hard) and on approval delete it, its `.gitignore` entries and `commands.yaml` `c4-build` inline. Record each decision.
3b. Per unsettled `audit.md` "Contradictions" entry: request user decision (hard); record the answer in `decisions-log.md` and in that entry.
3c. Any architect/BA `QUESTION` → per `sprint-lifecycle.md`'s `QUESTION` protocol.
4. Apply `checkpoints.md`: in adaptive mode record valid evidence and advance; otherwise present the audit and await the applicable decision. Record actor, evidence and revision.
5. The per-sprint document skip of a frozen-`true` `prd`/`ux_spec`/`adr`/`c4` with no draft yet (hard; `sprint-lifecycle.md` "Optional documents") applies here only on user request or inside a decision step 4 already awaits — never a standalone prompt on an adaptive or mechanical exit. Exit in at most one inline mechanical write (no further gate), the only write for any skip; when step 1 skipped audit, it first appends `"audit"` to `skipped_phases` with that skip's decisions-log line; each accepted document skip sets its frozen `false` with its decisions-log line, before the collapse test reads it. Under the design-block collapse test (`sprint-lifecycle.md` "Design/design-review/design-promote collapse"), the write sets `phase="design-promote"`, appends `["design", "design-review", "design-promote"]` to `skipped_phases` and one decisions-log line "design/design-review/design-promote skipped (no documents enabled)"; emit `NEXT: plan`. Otherwise it sets `phase="audit"` (only when step 1 skipped audit); emit `NEXT: design`.

Append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log".

## Delegates

- `asd-architect` — single default audit owner; registry writes after confirmation
- `asd-ba` — only evidenced material product/domain ambiguity

## Return contract

```
PHASE: audit | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <design | plan>
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `t_audit.md`
