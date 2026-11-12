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

## 2026-11-11 — sprint opened

- **Decision**: Sprint 033-retro-intake-model-choice opened on branch `sprint/033-retro-intake-model-choice` from main at 5f3dd335; workflow `lite`.
- **Rationale**: Workflow choice answered by the user: "lite (Рекомендуется)"; sprint 032 closed by the closure write (ba95f4d1), its release v14.4.0 complete.
- **Affected docs**: `state.json`

## 2026-11-12 — approach choice

- **Decision**: Approach B (full) for the model-choice strand: haiku tester run variant, haiku External Review wrapper, Opus tier above `standard` for risky tasks, effort step in the escalation ladder, README orchestrator-model guidance and haiku-alias note, plus a haiku read-only scout agent for orchestrator scans; reviewers keep `high`; Codex untouched.
- **Rationale**: User answer "B полностью" over the recommended B′ (no scout); requirements: token savings without noticeable quality loss, every article recommendation applied or rejected with a reason (research.md F1-F12).
- **Affected docs**: `research.md`
