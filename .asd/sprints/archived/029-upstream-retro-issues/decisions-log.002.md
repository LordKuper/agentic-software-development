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

## 2026-10-26 — audit contradiction C1

- **Decision**: AC-1/AC-4/AC-7 win over the `checkpoints.md` external-action row: publishing, auto-closing and post-release closing of retro-finding issues take no gate in either `user_gates` mode; `checkpoints.md` gains an explicit exception, as `cleanup` removals have one.
- **Rationale**: User choice; the user asked for automatic publication, and a strict consumer opts out through the AC-8 config key.
- **Affected docs**: audit.md, sprint.md AC-1, AC-4, AC-7

## 2026-10-26 — audit accepted (adaptive)

- **Decision**: audit.md passes the audit gate adaptively: every section written for AC-1..AC-13, C1 settled by the user, the AC-2 issue home (target framework path) and a `P-N` issue's cause field (`Expected saving`) settled from `asd-phase-retro.md` step 4 and `asd-phase-scope.md` step 2a.
- **Rationale**: No unresolved material alternative remains; the scope gate authorised AC-1..AC-13; no document is enabled, so lite continues to plan.
- **Affected docs**: audit.md
