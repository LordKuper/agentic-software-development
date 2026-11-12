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

## 2026-11-12 — audit contradictions and scope amendment

- **Decision**: AC-22 retired by AC-35 (collapse every whole-file deletion, not only provider views); AC-29 retired by AC-36 (scope-time `sprint.md` settings-change declaration applied before the step 3a freeze). No plan exists yet, so no Task carries them; plan places both.
- **Rationale**: User answers "Все удаления файлов (Рекомендуется)" and "Объявление на scope (Рекомендуется)" on the hard audit-contradiction gate; criterion cost 0 iterations / 0 fix rounds for AC-22, AC-29, AC-35, AC-36 (lower bound, no review yet).
- **Affected docs**: `sprint.md`, `audit.md`

## 2026-11-12 — audit accepted (adaptive)

- **Decision**: Audit passes adaptively: every `t_audit.md` section written for AC-1..AC-36; both contradictions settled by the user; remaining canon departures are planned criteria; host facts (Agent tool per-call `effort`, Artifact `Design` type) verified live in this session.
- **Rationale**: Exact user authority covers scope and both answers; no unresolved material alternative; checks ran (stubs none, no decomposition registry needed).
- **Affected docs**: `audit.md`
