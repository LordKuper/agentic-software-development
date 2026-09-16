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
- 2026-09-16 — route iter-02 dev chain: critical, dispatch HEAD 4d84e84
- 2026-09-16 — iter-02 dev chain flagged choices accepted: `<review file> <id>` qualifier only on collision; D-N leftover only sets the row, fix verified by impl-test
- 2026-09-16 — route iter-02 tester chain: critical, dispatch HEAD 43d320f
- 2026-09-16 — iter-02 tester chain flagged choices accepted: spelling-tolerant authorised check, word anchors failing loudly, rows edited in place

## 2026-09-16 — impl fix for iter-02: findings resolved

- **Decision**: COR-1, DOC-1 (`b2019e0`, `43d320f`), TST-1 and COR-1 pin (`c9cf9b7`) resolved; suite 207/207, sync --check ok, lint clean.
- **Rationale**: Fix-mode finalize; flagged choices resolved above.
- **Affected docs**: [reviews/impl/iter-02/](reviews/impl/iter-02/), [test-plan.md](test-plan.md)
