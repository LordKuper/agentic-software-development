---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-09-25 — route Task 1: critical, dispatch HEAD 9cd9fe8
- 2026-09-25 — route Task 2: critical, dispatch HEAD 11a2a3d
- 2026-09-25 — route Task 3, Task 4, Task 5: critical, dispatch HEAD f4eb7ed
- 2026-09-25 — route Task 6: standard, dispatch HEAD f4eb7ed
- 2026-09-25 — route wave-3 reconciliation (orchestrator request-changes on Tasks 3/4/6 cross-citations): critical, dispatch HEAD fc19c89
- 2026-09-25 — route Task 7: standard, dispatch HEAD 421b41b

## 2026-09-25 — Retro backlog seeded (AC-4)

- **Decision**: The orchestrator wrote `.asd/project/retro-backlog.md` from `t_retro-backlog.md`, with 15 rows decided in 019: 10 `included`, 3 `deferred` (016#P-1, 017#P-1, 017#P-3), 2 `rejected` (016#P-3, 017#A-1). Guardrail text comes from `retroRows`. `retro-candidates --self-hosting` now returns exactly the 3 deferred rows (DoD check).
- **Rationale**: The backlog is orchestrator-owned, and no dispatched agent writes it (plan Overview). The seed applies the triage recorded in decisions-log.001.md.
- **Affected docs**: [retro-backlog.md](../../project/retro-backlog.md)

## 2026-09-25 — Wave flagged choices resolved

- **Decision**: Accepted every dev flagged choice from Tasks 1-7 and the reconciliation round (commit 421b41b):
  - Task 1 edited its own memory, and the `index.lock` retry was left out of the rule.
  - Task 2 kept `effort` "emitted on trust".
  - Task 5 fixed a backtick edge in the shared `tableCells`, which changes the `defect-stalemate` digest for cells with inner backticks; the effect is fail-safe (the question is re-asked).
  - Task 3 placed each home where the sibling cites point.
  - The reconciliation round classified External Review as a no-write-tool memory owner.
- **Rationale**: Each choice stays inside plan scope and the accepted ACs. Two gaps are left for impl-review and not fixed here: who flips the `test-plan.md` Status of a reviewer-owned memory `D-N` after a memory-fix, and the `t_retrospective.html` comment restating the row-id ordinal.
- **Affected docs**: [plan.md](plan.md)
