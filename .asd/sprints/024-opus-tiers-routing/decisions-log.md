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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-10-07 — route Task 8, Task 9: standard, dispatch HEAD 7266fae
- 2026-10-07 — wave 3 done: Task 8 (b119ba2), Task 9 (974964f); manifest upstream_hashes recomputed via --apply AGENTS.md, sync --check clean
- 2026-10-07 — correction: the 024#P-1/P-2 retro-backlog rows written with the amendment were removed (sprint-019 AC-4 contract: a backlog row must address an archived retro). The re-run retro records both as `covered by:`, so intake drops them
- 2026-10-07 — impl assessment approved (adaptive): amendment Tasks 8-9 ticked, lint and sync clean, suite self-check 273/273, no flagged choices, authorised paths only
- 2026-10-07 — route impl-test entry 3: standard, dispatch HEAD 26b3b9e; risk artifact: content-contract pins via node tests/run.js
- 2026-10-07 — impl-test: impacted set green (273/273), 0/0 tests added/removed, 1 extended with 3 asserts (entry 3, HEAD analysed 4f3ce96); no defects, no manual-verification row
- 2026-10-07 — impl-review wave-1/iter-03 (floor low, floor_base=wave-1/2): combined CONCERNS (F1 low, `checkpoints.md:5` "It records" has an ambiguous referent after the AC-8 insert), external CONCERNS (F1 medium, AC-8/AC-9 pins match rewordable prose); low-severity test-only branch not fired (combined F1 is not in a test, external F1 is medium) → review_fixes_pending=wave-1/iter-03
- 2026-10-07 — route review-fix wave-1/iter-03 combined.md F1: standard, dispatch HEAD ee0facb8; risk artifact: rule wording via node tests/run.js
- 2026-10-07 — route review-fix wave-1/iter-03 external.md F1: standard, dispatch HEAD ee0facb8; risk artifact: content-contract pins via node tests/run.js
- 2026-10-07 — impl fix for wave-1/iter-03: findings resolved (combined.md F1 by 9bceee2, external.md F1 by 9674110); manifest upstream_hashes recomputed, sync --check clean, suite self-check 273/273, authorised paths only
- 2026-10-07 — route impl-test entry 4: standard, dispatch HEAD 5f173a13; risk artifact: content-contract pins via node tests/run.js
- 2026-10-07 — impl-test: impacted set green (273/273), 0/0 tests added/removed (entry 4, HEAD analysed 6d57b320); no defects
- 2026-10-07 — impl-review wave-1/iter-04 (floor medium): combined APPROVE, external APPROVE; iter-03 findings verified resolved. External's below-floor residual (prose anchors in AC-8/AC-9 pins) is accepted as calibrated low, not overruled. Wave 1 roster met → terminal full-suite gate
- 2026-10-07 — route impl-review wave-1/iter-04 suite: standard, dispatch HEAD a3f16153; risk none via node tests/run.js
