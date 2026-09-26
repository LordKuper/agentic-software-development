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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-26 — `retrospective.html` written

- **Decision**: Retro written on the analysed branch: 2 friction entries (F-1 → A-1, a new guardrail; F-2 → A-2, covered by this sprint's Memory-fix dispatch rule) and 3 systemic proposals (P-1 verify host-behaviour criteria against a live dispatch; P-2 name exact section homes for parallel Tasks; P-3 pin removed sentences, not free regexes, in leftover-term checks). All rows are `asd`. Nothing is applied or promoted; the next sprint's retro intake offers the rows.
- **Rationale**: `sprint-lifecycle.md` "Retro phase". The rows parse with `retroRows`, with ids A-1..A-2 and P-1..P-3.
- **Affected docs**: [retrospective.html](retrospective.html)
