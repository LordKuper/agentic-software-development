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
- 2026-09-25 — route Task 1: critical, dispatch HEAD b069c22
- 2026-09-25 — Task 1 flagged choices resolved: upstream_hashes refreshed in-task (Task 6 regenerates all hashes anyway); unauthenticated codex exec probe (401, no tokens) accepted
- 2026-09-25 — route Task 2, Task 3, Task 4, Task 5: critical, dispatch HEAD 6f80eb7
- 2026-09-25 — reconstruction: landed Task 3 (2a43f0a), Task 4 (d199edd), Task 5 (4af5c78); Task 2 left staged after sibling sweep/reset, re-dispatched to commit (072df1f, memory d0f7cb4)

## 2026-09-25 — Wave 2 flagged choices resolved

- **Decision**: Accepted: BA Do's line 62 deleted as redundant; reviewer-testing Do's line deleted; carrier citations by section name (headings verified present); "no secret in URL/search query" clause in core.md; advisor listed among roles holding no commit tool; design-system.md:83 left as is (does not name the asker, core.md governs); stalemate options mapping (accept as-is → findings resolved without fix, override → findings stay in fix set, abort → ABORT); manual-verification results asked per row; new creator `QUESTION` routes in design-review and design-promote; token-gate citation corrected to `checkpoints.md` "Gate mechanics". Routed back and fixed: asd-dev stop condition now "QUESTION (token owned by asd-ux)" (a8480bb).
- **Rationale**: Each choice stays inside AC-4/AC-5/AC-7/AC-9 and the user's audit answers; the one misstatement of the new routing was corrected by its dev.
- **Affected docs**: [plan.md](plan.md), [friction-log.md](friction-log.md)

- 2026-09-25 — route Task 6: standard, dispatch HEAD a8480bb
- 2026-09-25 — Task 6 README corrected in-task (dfb9370): per-agent Bash bounds (Architect likec4 only, no commit tool), no temporal wording

## 2026-09-25 — impl assessment approved

- **Decision**: Impl assessment passed adaptively: Tasks 1-6 ticked; AC-1..AC-9 implemented (AC-6's test portion pending impl-test); build `sync --check` clean, lint clean, round diff inside authorised paths; no stubs introduced.
- **Rationale**: Every flagged choice was resolved or routed back and fixed; remaining red tests (`tests/run.js` 3335, 5459) are planned impl-test updates.
- **Affected docs**: [plan.md](plan.md)
