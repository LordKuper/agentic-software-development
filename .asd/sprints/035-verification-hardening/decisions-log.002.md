---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-11-17 — audit contradictions resolved; scope amendment AC-15, AC-16

- **Decision**: AC-6 narrowed: bundle rule files and manifest rubrics come from `origin/<base_branch>`, the host-loaded reviewer definition body stays the working-tree view as a stated limitation — AC-6 retired, AC-16 added. AC-1 widened: a production executable file in no manifest of the wave also clears every latch — AC-1 retired, AC-15 added. No plan exists yet, so no Task or wave to amend.
- **Rationale**: User answers at the audit-contradiction gate ("Сузить AC-6", "Новый файл снимает latch"); evidence in audit.md "Contradictions" (host loads `.claude/agents/<name>.md` from the working tree, providers.md 12/31; new fix-round files are in no latched reviewer's manifest).
- **Affected docs**: `sprint.md`, `audit.md`
- 2026-11-17 — audit accepted (adaptive): every t_audit.md section written for AC-1..AC-16, contradictions settled by the user, no stub, decomposition disabled
