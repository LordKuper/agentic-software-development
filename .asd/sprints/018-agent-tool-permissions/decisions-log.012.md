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
- 2026-09-25 — route correctness.md 1, documentation.md DOC-5, external.md 1-2, testing.md TST-2-1 (canon part): critical, dispatch HEAD f69d1c1
- 2026-09-25 — review-fix round 2 flagged choices accepted: no Bash in asd-design-system allowed-tools (operation line only); install step kept at design step 8 (harmless if unused); design-principles.md:47 creator-scoped; tester "no agent named = creator-scoped" with exact exempt set; optional answer:/designmd-install pins added this round
- 2026-09-25 — impl fix for wave-1/iter-02: findings resolved (correctness.md 1, documentation.md DOC-5, external.md 1-2, testing.md TST-2-1..TST-2-3)
