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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-10-07 — route Task 1, Task 2: critical, dispatch HEAD 11f92e0
- 2026-10-07 — route Task 3: standard, dispatch HEAD 11f92e0
- 2026-10-07 — route Task 4: mechanical, dispatch HEAD 11f92e0
- 2026-10-07 — wave 1 done: Task 1 (8e82efb, f0eb735), Task 2 (377b7de), Task 3 (bdf64d8), Task 4 (1d2a90e); views synced (4 Claude agent views, manifest hashes), sync --check clean
- 2026-10-07 — flagged choices accepted: Task 1 extra L123 sentence on prose/test-only deltas (asked by D3); Task 1 log-line claim replaced by `task_routing[id].reason` (f0eb735, log format unchanged); Task 2 D6 paragraph after the audit-reevaluation sentence, the `change` bullet relying on the doubt bound for "ambiguous judgment" (consistent with providers.md L129 class names), Modes clause citing "Scope amendment"
- 2026-10-07 — route Task 5: critical, dispatch HEAD 44bcf76
- 2026-10-07 — route Task 6, Task 7: standard, dispatch HEAD 44bcf76
- 2026-10-07 — wave 2 done: Task 5 (91b1d00), Task 6 (a8485d5), Task 7 (b3d8875); no generated view changed, manifest upstream_hashes recomputed via --apply AGENTS.md, sync --check clean

## 2026-10-07 — impl assessment approved (adaptive)

- **Decision**: Initial impl is complete. All seven Tasks are ticked, build and lint are clean, `sync.js --check` is clean, and the self-check `node tests/run.js` passes 272/272. The round touched only authorised paths. There are no sprint stubs, and every flagged choice is resolved (wave 1 entry above).
- **Rationale**: `checkpoints.md` routine initial impl assessment in adaptive mode, with valid evidence.
- **Affected docs**: [plan.md](plan.md)
- 2026-10-07 — route impl-test entry 1: standard, dispatch HEAD 6d3b882
- 2026-10-07 — impl-test: impacted set green (273/273), 1/0 tests added/removed, 2 adjusted (entry 1, HEAD analysed 64c1898); no defects, no manual-verification row
