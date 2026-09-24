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

## 2026-09-24 — Out-of-scope test removal pre-authorized for removed mechanisms (adaptive)

- **Decision**: The tester may delete or rewrite `tests/run.js` tests that pin mechanisms this sprint removed: split parts/`--halve`/`outOfPart`/part files, `SPLIT_THRESHOLD_FILES`, `DISPATCH_CEILING`, External batches and `partial`, `surface-check` `dispatches`/`--test-plan-files`, and scope-manifest `base_ref`/`head_ref`/`exclude_paths`. Every other out-of-scope removal is proposed first and goes through the removal gate.
- **Rationale**: The user accepted the removal of these mechanisms at the plan gate. That covers tests whose only subject is the removed behaviour, and no other removal.
- **Affected docs**: test-plan.md

- 2026-09-24 — route impl-test entry 1: critical, dispatch HEAD af04d4d

- 2026-09-24 — impl-test: impacted set green (full suite via safety valve, 219/219), 8/2 tests; 17 updated; no D-N; tester flags (decision `none` for D5/D6 prose, "legacy" sweep carve-out, `..` guard test) accepted
