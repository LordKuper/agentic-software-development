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

## 2026-10-26 — audit contradiction C2 settled

- **Decision**: An absent `state.json.cleanup` snapshot reads `enabled` (in-flight and upgraded sprints, 028 included, run the cleanup phase); C1 settled canonically — test files stay out of cleanup reach under the test-removal gate.
- **Rationale**: User choice over the recommended `disabled`; C1 has a canonical side (`checkpoints.md`).
- **Affected docs**: audit.md

## 2026-10-26 — scope amendment: agent roster reduction

- **Decision**: AC-11..AC-19 added to sprint 028 (no plan yet, so no Task or wave): seven agent specs remain, BA/UX/Architect work moves inline to the orchestrator, reviewers become three separate specs `quality`/`efficiency`/`combined` (standard runs quality + efficiency, lite combined), routing drops `critical`, advisor recommendation precedes every non-gate user escalation, consumer migration, MAJOR release.
- **Rationale**: User request and edits: three separate reviewer specs over one spec with variants; models per AC-15 with `asd-dev-mechanical` high and `asd-reviewer-efficiency` opus/high; iterations 0, fix rounds 0 for every new criterion.
- **Affected docs**: sprint.md

- 2026-10-26 — audit reevaluated: stays true; supplemental audit dispatched for AC-11..AC-19
