---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-08 — scope: retrospective rows verified against HEAD before acceptance

- **Decision**: All sixteen rows of the sprint 008 retrospective's two tables were re-checked against HEAD `f1b15bf` before being written into `sprint.md`. Fifteen carried as `AC-1`..`AC-15`; the `F-6` remaining row closed as already satisfied (`providers.md:47` states host-honoured vs emitted-on-trust frontmatter fields); the `S4` agent-memory row narrowed to its undelivered half and carried as `AC-13`.
- **Rationale**: Sprint 008's own `F-2` — a retrospective's rows are written against the HEAD of the sprint that produced them and carry no verification that they are still unresolved when a later sprint picks them up. `AC-3` makes this verification a rule; this sprint performs it by hand ahead of that rule existing.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-08 — scope: audit enabled

- **Decision**: `documents.audit` (config `auto`) resolves to enabled for this sprint; frozen as `true` in `state.json`.
- **Rationale**: Scope changes workflow contracts, review routing and gate policy across nine rule and workflow files — not a complete mechanical scope with no behaviour, contract or gate impact.
- **Affected docs**: [state.json](state.json)

## 2026-09-08 — scope accepted

- **Decision**: The user accepted sprint 009's scope as written — `AC-1`..`AC-18`, including the `F-6` remainder closed at scope and the `S4` row narrowed to `AC-13`.
- **Rationale**: Initial scope is a hard gate in both policies; it establishes the authority the adaptive policy reuses for the rest of the sprint.
- **Affected docs**: [sprint.md](sprint.md), [state.json](state.json)
