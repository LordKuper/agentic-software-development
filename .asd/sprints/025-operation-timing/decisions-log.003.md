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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-10-08 — plan inputs settled by the user

- **Decision**: Timing ledger stays in the sprint folder; the orchestrator commits it before every clean-tree check and with phase-exit bookkeeping (D3). Slow set = top 5 longest leaf machine operations plus every one over 30 minutes (D5). Every user wait is recorded; retro proposes removing avoidable escalations (D6). After an AC-8 update: commit, then halt on both hosts (D8).
- **Rationale**: User answers at plan time to `audit.md` Open plan inputs 1, 2, 9 and the ledger-location trade-off (audit Risks, clean-tree checks).
- **Affected docs**: [plan.md](plan.md)

## 2026-10-08 — `plan.md` accepted

- **Decision**: The user accepted `plan.md`: D1-D9, Tasks 1-8, wave 1 = Tasks 1-2, wave 2 = Tasks 3-8. pr merge mode and the release retry are not recorded (D7). No open stubs (audit.md has no "Related open stubs").
- **Rationale**: `checkpoints.md` plan gate, write-then-review-accept; explicit `accept`.
- **Affected docs**: [plan.md](plan.md)
