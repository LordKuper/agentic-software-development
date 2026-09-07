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

## 2026-09-07 — audit phase runs (documents.audit: auto)

- **Decision**: `documents.audit` normalizes to enabled for this sprint; the audit phase runs.
- **Rationale**: `auto` skips only a complete, verifiably mechanical scope with no behaviour, contract, migration or gate impact. This scope changes tool behaviour (`.asd/sync.js` unmatched-target error), a review contract (split review, interrupted-dispatch outcome), routing input (`.asd/runtime.js`) and the state schema (`t_state.json` handoff artifacts) — none of it mechanical.
- **Affected docs**: [state.json](state.json), [sprint.md](sprint.md)

## 2026-09-07 — scope accepted in full, all 14 AC

- **Decision**: The user accepted the initial scope as written, keeping both the friction remediation (AC-1..AC-6) and the systemic proposals (AC-7..AC-11) in one sprint, over the alternative of deferring the systemic half to a later sprint.
- **Rationale**: The retrospective's own scoping advice argues for a smaller diff, but the two systemic proposals with the largest expected saving are in the deferred half; AC-1 lands the split-review contract in this same sprint, so an oversize review diff has a documented shape to fall back on.
- **Affected docs**: [sprint.md](sprint.md), [state.json](state.json), [retrospective 007](../archived/007-retrospective-phase/retrospective.html)
