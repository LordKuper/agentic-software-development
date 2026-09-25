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
- 2026-09-25 — route correctness.md 1-5, documentation.md DOC-1..DOC-4, external.md 1-3: critical, dispatch HEAD 1608af0
- 2026-09-25 — review-fix flagged choices accepted: BA search scope "user-provided URLs and public standards/regulations a requirement cites"; README web purposes point to each agent's Tool policy; UX README mirror in d802f2c; design-review "continue fixing" = creator fix; tester single commit, widened TST-1-2 (allowlist never reaches a "Never run" command) and stalemate pin (options from the external-review.md home)
- 2026-09-25 — impl fix for wave-1/iter-01: findings resolved (correctness.md 1-5, documentation.md DOC-1..DOC-4, external.md 1-3, testing.md TST-1-1, TST-1-2)
