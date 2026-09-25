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

## 2026-09-25 — Audit decisions and scope expansion

- **Decision**: External Review stalemate keeps the two-outcome contract (`FAIL` + `Stalemate` block, orchestrator asks). Scope expanded (AC-7..AC-9): design-phase accept loops, concept/stack user prompts, a `QUESTION` re-dispatch protocol and manual-verification collection move to the orchestrator; BA/UX Bash is bounded with commits and promote git ops kept with the orchestrator; web grants get scoped policy lines. Codex renders `web_search = "live"` for the seven web-granted agents, `"disabled"` for the other four.
- **Rationale**: Subagents cannot reach the user on either host, so every user-contact path must route through the orchestrator; the chosen carriers keep the reviewer verdict and External Review outcome contracts intact (MINOR release). Live/disabled gives full Claude↔Codex parity as AC-3 asked.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md)

- 2026-09-25 — audit reevaluated after scope expansion: stays true
- 2026-09-25 — design/design-review/design-promote skipped (no documents enabled)
