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
- 2026-09-24 — External Review skipped for sprint 017-review-waves iteration wave-1/iter-02: external review unavailable: command-unavailable (`codex` not on PATH; same cause as F-1)

## 2026-09-24 — impl-review wave-1/iter-02 → impl review-fix

- **Decision**: Efficiency returned APPROVE and is latched (wave 1, iteration 2). Correctness (1), Testing (3) and Documentation (2) returned CONCERNS, and External was availability-skipped. The 6 findings route to impl review-fix with `review_fixes_pending = "wave-1/iter-02"`. The cap is not reached (next is iteration 3 of 7).
- **Rationale**: No finding is FAIL, and all are at or above floor `medium`.
- **Affected docs**: reviews/impl/wave-1/iter-02/
