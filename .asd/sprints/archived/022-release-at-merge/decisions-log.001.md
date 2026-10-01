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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-30 — Sprint 022 opened: release at merge, closure as mechanical cleanup

- **Decision**: Scope: the release is published right after the sprint PR merges (pr merge mode), and the hard sprint-closure gate is removed. Merge completes the sprint, and the next scope archives it mechanically. Workflow: `lite`, a user decision. Before seeding, the closure write for 021 ran (7274fb7, user-approved), and v13.4.0 was tagged and released on 8934231.
- **Rationale**: User request at the end of sprint 021, clarified by the user: remove the gate.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-30 — Retro intake verified at HEAD 7274fb7; scope gate accepted

- **Decision**: 6 candidates from 021's retro, all unresolved at HEAD (written at the end of 021, and no later commit touched their homes). The user included 021#A-5 → AC-4, 021#A-3 → AC-5, 021#P-2 → AC-6 and 021#A-6 → AC-7, and deferred 021#A-1 and 021#P-1 (independent contracts; split per the scope split rule). The user accepted sprint.md AC-1…AC-7 at the same gate. Criterion cost of each included row: 0 iterations charged, 0 fix rounds charged.
- **Rationale**: Hard scope and retro-intake gates (`checkpoints.md` "Gate policy"), decided by the user.
- **Affected docs**: [sprint.md](sprint.md), [.asd/project/retro-backlog.md](../../project/retro-backlog.md)

- 2026-09-30 — audit frozen true: `documents.audit: auto`; the scope changes gates, lifecycle tokens and the release contract (not mechanical)
- 2026-09-30 — documents frozen: prd/ux_spec/adr disabled by config; c4 false (`diagram_tool: none`)
