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
- 2026-09-30 — design-promote skipped: frozen prd/ux_spec/adr/c4 all false (lite empty scope)
- 2026-09-30 — retro: retrospective.html written; 2 entries analysed (both covered by existing rules, 0 new actions), 3 systemic proposals (turn budget vs file count, bounded fail-first mutation runs, single-home tier tables); non-empty-log branch
- 2026-09-30 — pr open mode: DoD verified (plan ticked, iter-03 all APPROVE, full suite 264/264 at 8c40552 with no code/test diff since, build+lint clean, retrospective present, no sprint stubs); asd_version 13.4.0 → 13.5.0 (feat highest, no breaking marker), CHANGELOG v13.5.0 added
- 2026-09-30 — pr open mode: PR #58 opened after the user confirmed publication; state.json.pr written and pushed; NEXT await-merge
- 2026-10-01 — sprint closure: PR 58 merged (f106867), release v13.5.0 published; archived by sprint 023 scope, no continue choice needed
