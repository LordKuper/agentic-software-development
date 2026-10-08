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
- 2026-10-07 — pr open mode: DoD verified (plan ticked, wave-1 combined+external APPROVE at iter-02, full suite 273/273 at 3d9c1be with no code/test diff since, lint+sync clean, retrospective present, no sprint stubs, no existing PR for the branch); asd_version 13.6.0 → 13.7.0 (feat highest, no breaking marker; max migration 9.0.0 ≤ 13.7.0), CHANGELOG v13.7.0 added
- 2026-10-07 — pr open mode: PR #60 opened after the user confirmed publication; state.json.pr written and pushed; NEXT await-merge

## 2026-10-07 — scope amendment AC-8, AC-9

- **Decision**: The user amended retro proposals 024#P-1 and 024#P-2 into sprint 024 instead of opening a sprint 025. AC-8 is carried by Task 8 (`checkpoints.md`) and AC-9 by Task 9 (`code-style.md` §17), both in new wave 3. The amendment was accepted after the division point, so `floor_base=wave-1/2` and wave 1's `latched` are cleared. `phase` returns from `pr` to `impl` (not earlier than `impl`, so no rollback reset). PR #60 stays open and is updated on the next push. The audit boolean stays true.
- **Rationale**: `sprint-lifecycle.md` "Scope amendment"; the user's explicit request in chat.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
