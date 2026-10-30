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

## 2026-10-30 — scope amendment AC-12

- **Decision**: User added "minimise system-disk use" mid-impl, before wave 1's dispatch: AC-12 binds ASD canon (`artifact-layout.md` "Scratch directory", in Task 5 with AC-9's edit of the same doc), moves `update.js`'s download (Task 6, wave 1) and `tests/run.js` fixtures (Task 7, Test-only, new wave 2) off the OS temp directory, and deletes the 380 leftover `asd-sync-test-*` directories after wave 2.
- **Rationale**: `tests/run.js` and `update.js` are the only `os.tmpdir()` writers; tests leave their fixtures behind. Criterion cost: AC-12 new, 0 iterations / 0 fix rounds.
- **Affected docs**: `sprint.md`, `plan.md`
- 2026-10-30 — route Task 1: standard, dispatch HEAD f04c9dbed3ba1ec6f9062b950d1e9b14ee40101a
- 2026-10-30 — route Task 3: standard, dispatch HEAD f04c9dbed3ba1ec6f9062b950d1e9b14ee40101a
- 2026-10-30 — route Task 4: standard, dispatch HEAD f04c9dbed3ba1ec6f9062b950d1e9b14ee40101a
- 2026-10-30 — route Task 5: standard, dispatch HEAD f04c9dbed3ba1ec6f9062b950d1e9b14ee40101a
- 2026-10-30 — route Task 6: standard, dispatch HEAD f04c9dbed3ba1ec6f9062b950d1e9b14ee40101a
- 2026-10-30 — route Task 2: mechanical, dispatch HEAD f04c9dbed3ba1ec6f9062b950d1e9b14ee40101a
- 2026-10-30 — route Task 7: standard, dispatch HEAD 184fe90d40628ebb54b7880feb700878d6fa4bd4
- 2026-10-30 — AC-12: deleted 638 leftover test fixture dirs (asd-sync-test-*, asd & runtime-*; 6.0M) from the OS temp directory (user-approved amendment)

## 2026-10-30 — impl assessment (adaptive)

- **Decision**: initial impl accepted by the orchestrator under `user_gates: adaptive`; → impl-test.
- **Rationale**: Tasks 1-7 COMPLETED, every `plan.md` checkbox ticked; AC-1..AC-10, AC-12 implemented (AC-11 pending impl-test asserts and the terminal suite); build `node .asd/sync.js --check` ok, lint clean, round diff touches only dispatched write scopes, synced views, `release-manifest.json` ledgers and sprint bookkeeping; no stub added; full suite 318/318 at Task 7. Task 7 flag accepted: `GIT_CEILING_DIRECTORIES` isolates git; `sync.js` `findRepoRoot` and the hook's `findUp` carry no ceiling, but every fixture reaching them holds its own `.asd/`, so the plan's isolation predicate holds — no earlier disposition in the decisions log.
- **Affected docs**: none
