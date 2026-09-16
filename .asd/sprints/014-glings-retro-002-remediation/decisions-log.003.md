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
- 2026-09-16 — impl-review iter-01 efficiency part 2: attempt 1 rejected at validate-ledger (no manifest_digest; not transcribable), re-dispatched fresh

## 2026-09-16 — impl-review iter-01: route to impl review-fix

- **Decision**: correctness, testing, documentation, external CONCERNS; efficiency APPROVE (latched at 1). `review_fixes_pending = iter-01`. 17 findings (COR-1..4, part-2 correctness 1-3, TST-1-1/1-2/2-1/2-2, DOC-1..3, part-2 documentation 1-3, EXT-1..6) with overlaps: trailer/reconstruction contract (COR-1..3, corr-2 #1, DOC-3, EXT-2/3), skip `Unreviewed files` write (COR-4, doc-2 #1), verdict grammar mirror (DOC-2, EXT-1/5), README "dated" (corr-2 #2, doc-2 #2).
- **Rationale**: No FAIL; iteration 2 within medium budget. Scope 27 files split 2 parts per internal reviewer, union check passed; External Review 27/27 in 2 batches.
- **Affected docs**: [reviews/impl/iter-01/](reviews/impl/iter-01/)
