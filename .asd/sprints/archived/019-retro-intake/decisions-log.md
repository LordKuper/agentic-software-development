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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-26 — PR #53 opened (adaptive publication)

- **Decision**: Open-mode DoD verified: every plan Task checked, reviews green over wave 1 of 1, full suite 238/238 at `746ed3c` with no code, test or stub diff since, no sprint stubs, `retrospective.html` present, and the `asd_version` 13.2.0 CHANGELOG entry present. Branch pushed and PR #53 opened.
- **Rationale**: `user_gates: adaptive`. Scope was explicitly accepted by the user, the evidence is recorded, and `gh` is authenticated.
- **Affected docs**: https://github.com/LordKuper/agentic-software-development/pull/53

## 2026-09-26 — Sprint closed

- **Decision**: PR #53 was squash-merged into `main` as `6c8c15c`. The user explicitly asked to close the sprint ("Закрывай спринт"). Terminal state written: `pr.state=merged`, `phase=done`, `archived_at`. The folder moves to `archived/` via the companion PR.
- **Rationale**: The hard closure gate was satisfied by explicit user approval after the merge (`checkpoints.md`).
- **Affected docs**: [state.json](state.json)
