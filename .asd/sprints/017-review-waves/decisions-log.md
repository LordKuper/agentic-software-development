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

- 2026-09-24 — route Task 1: critical, dispatch HEAD c2bf1db
- 2026-09-24 — route Task 2: standard, dispatch HEAD c2bf1db

## 2026-09-24 — Wave 1 flagged choices resolved

- **Decision**: All Task 1 flags (af26202) and Task 2 flags (52d91d7) accepted as in-plan implementation choices. Task 1: snapshot copies go to `<iter dir>/snapshot/<path>`; External gets `--iteration`/`--wave` and requires a range in impl-review; `emit-manifest` prints a single object; new exports. Task 2: the wave display is impl-review only; an out-of-range `wave` falls back to 1 in the hook display. `t_review-scope.json` is already done by Task 1, so Task 4 does not touch it again.
- **Rationale**: Every choice stays inside D1/D2/D7/D9/D10, and none opens a material alternative. Later Tasks bind the rule text to these names.
- **Affected docs**: plan.md

- 2026-09-24 — route Task 3: critical, dispatch HEAD 2e2e133
