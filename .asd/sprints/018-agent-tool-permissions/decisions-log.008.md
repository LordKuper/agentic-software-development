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
- 2026-09-25 — impl-review wave 1 division: 1 wave (543 lines ≤ 3000), surface 38/100
- 2026-09-25 — correctness interrupted attempt 1 in wave-1/iter-01 (maxTurns 50 reached, no report)
- 2026-09-25 — documentation interrupted attempt 1 in wave-1/iter-01 (maxTurns 50 reached, no report)

## 2026-09-25 — Reviewer question answered (wave-1/iter-01 correctness #1)

- **Decision**: A reviewer holding an open `question:` item returns at least CONCERNS, never `APPROVE`; the answer rides into review-fix with the findings.
- **Rationale**: One rule closes the gap: the latch fires only on a bare `APPROVE`, so no answered question can be dropped by a latch or an all-approve DoD.
- **Affected docs**: `review-policy.md` "Gate Verdict Format", `asd-phase-design-review.md`, `asd-phase-impl-review.md`

- 2026-09-25 — impl-review wave-1/iter-01: efficiency APPROVE (latched); correctness, testing, documentation, external CONCERNS (14 findings) → impl review-fix
