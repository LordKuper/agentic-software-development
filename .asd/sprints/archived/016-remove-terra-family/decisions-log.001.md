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

## 2026-09-23 — Terra replacement tier and compatibility approach

- **Decision**: Codex `terra` family removed outright; `asd-dev`/`asd-tester` base and `asd-external-review` wrapper move to `sol / medium`. Cleanup criteria: zero `terra` in live canon and generated views; `tests/run.js` green and `sync.js --check` clean. No dedicated anti-`terra` regression test.
- **Rationale**: User choice at scope (all recommended options). All three `terra` users run `medium`; keeping effort unchanged isolates the family swap and keeps base vs critical (`sol / high`) an effort split.
- **Affected docs**: sprint.md

- 2026-09-23 — audit frozen true: `documents.audit: auto`, scope removes a public model family (compatibility/contract impact, not mechanical)
- 2026-09-23 — prd, ux_spec, adr frozen false (config-disabled); c4 frozen false (`project.diagram_tool: none`)

## 2026-09-23 — Scope accepted

- **Decision**: User explicitly accepted `sprint.md` (AC-1..AC-6); scope gate passed, next phase audit.
- **Rationale**: Hard scope gate; establishes authority for adaptive gates this sprint.
- **Affected docs**: sprint.md
