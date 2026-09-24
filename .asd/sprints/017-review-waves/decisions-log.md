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

- 2026-09-24 — route wave-1/iter-02 correctness.md COR-1, documentation.md DOC-1: critical (dev chain), dispatch HEAD 480fdfb
- 2026-09-24 — route wave-1/iter-02 documentation.md DOC-2: memory owner asd-external-review (same route as COR-4), dispatch HEAD 480fdfb
- 2026-09-24 — review-fix wave-1/iter-02 dev chain: COR-1 (3cada92, always rewrite via pid .tmp+rename, fingerprint name kept), DOC-1 (2d33b83, cite SSoT); DOC-2 by owner (External memory). Flags accepted.
- 2026-09-24 — route wave-1/iter-02 testing.md TST-1, TST-2, TST-3 (+ COR-1 regression test): standard (tester chain), dispatch HEAD 2d33b83
- 2026-09-24 — impl fix for wave-1/iter-02: findings resolved (correctness.md COR-1 in 3cada92 + regression f580744; documentation.md DOC-1 in 2d33b83; documentation.md DOC-2 in owner memory commit; testing.md TST-1..TST-3 in f580744); build/lint clean, 224/224
