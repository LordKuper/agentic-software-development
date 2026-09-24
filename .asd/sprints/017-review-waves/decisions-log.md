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

- 2026-09-24 — route wave-1/iter-01 COR-1, COR-2, COR-3, COR-5, COR-6, DOC-1, DOC-2, DOC-3, EFF-1, EFF-2, EFF-3: critical (dev chain), dispatch HEAD 81f324d

## 2026-09-24 — Review-fix dev chain flags resolved

- **Decision**: All dev-chain flags accepted:
  - COR-1: an empty scope is one empty wave `[[]]`.
  - COR-5: a new `wave-files` runtime command; renames are mapped over waves.json `head`...HEAD (prescription corrected).
  - EFF-2: a fingerprint-named shared `.diff`.
  - COR-3: `--full-files` in design-review means "listed, no hunk".
  - COR-2: the closed-wave `.late.md` goes into the current `<id>/`, and step 8 checks unresolved findings before the "Otherwise" branch.
  - COR-6: the impl node wins once any wave has iterated.

  The CHANGELOG at pr covers `wave-files`, the `.diff` naming and the `snapshot.json` removal. Plan D9c wording is superseded by this entry.
- **Rationale**: Each flag stays inside the findings' intent and the D1-D10 bounds. `wave-files` replaces the orchestrator's hand-merge with a deterministic command, so it is no new abstraction layer.
- **Affected docs**: plan.md (D9c superseded)

- 2026-09-24 — route wave-1/iter-01 TST-1, TST-2, TST-3, EFF-4: standard (tester chain after dev chain), dispatch HEAD cdc5a93
