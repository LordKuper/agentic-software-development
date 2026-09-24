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

- 2026-09-24 — pr open mode: DoD verified (plan ticked, reviews-green wave 1/1, full suite 225/225 @ f6ad5fa with no code diff since, retro present, no sprint stubs); asd_version 12.0.0 → 13.0.0 (feat! commits), CHANGELOG v13.0.0

## 2026-09-24 — PR #49 opened via GitHub MCP (user decision)

- **Decision**: Opened PR #49 (`claude/asd-sprint-4y74bx` → `main`) through the GitHub MCP tools and subscribed to its activity. The sprint stays active at its normal path; merge and closure are separate steps.
- **Rationale**: `gh`, the only PR path per `git-strategy.md`, is not installed in the cloud container. The user explicitly chose the MCP route.
- **Affected docs**: state.json
