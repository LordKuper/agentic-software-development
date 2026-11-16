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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-11-16 — route Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7: standard, dispatch HEAD 4c1f6e66
- 2026-11-16 — plan amended (no scope change): `providers.md` artifact-write line restates AC-8's old "never touches the filesystem" claim; Task 7 flagged it outside its write scope, so the edit joins Task 9 (wave 2, disjoint paths)
- 2026-11-16 — route Task 8, Task 9: standard, dispatch HEAD 26eb47fb
- 2026-11-16 — Task 9 flag (latch-skipped reviewer's inherited APPROVE re-recorded each iteration) resolved by meeting `sprint-lifecycle.md` "APPROVE latch": Task 8's `record-verdicts` leaves an existing `latched[key]` untouched on a bare APPROVE
- 2026-11-16 — route Task 10: standard, dispatch HEAD 4083fc74
- 2026-11-16 — impl assessment approved (adaptive): Tasks 1-10 ticked; AC-1..AC-15 delivered by 461e3d3d, 588c15a2, ef6124b2, 0ce7bc3b, 97405154, f3898eb6, 5eceaa72, fa4217e2, dbae46e4, b9f5b76b; build `sync.js --check` ok, lint clean, round-diff paths inside each Task's scope plus synced views; no sprint stubs. Flags accepted within plan decisions: Task 1 (`[asd-retro]`-titled non-marker issues join the project list, label ensure is a planned write under D2), Task 8 (legacy flat `reviews.impl` refused, reviewer-key and value validation, only the `reviews` block rewritten), Task 9 latch (resolved above); Task 7's 51-char subject is reworded before push
- 2026-11-16 — route impl-test-1: standard, dispatch HEAD 991415df
- 2026-11-16 — route impl-test-1-memfix: standard, dispatch HEAD 89768baf
- 2026-11-16 — memory-fix asd-external-review: leftover heredoc-only invocation lines in 4 memory files updated to the prompt-file form (impl-test entry 1 leftover-term hits)
- 2026-11-16 — impl-test: defects D-1, D-2, D-3, D-4, D-5 → impl test-fix (digest 0a5e08623f032461bd1cfa137761b7ca2c1e7b7474694fd27d6ef16515a6677f)
