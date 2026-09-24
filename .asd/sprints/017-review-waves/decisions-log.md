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

- 2026-09-24 — impl-review division: `review-waves` measured 1470 lines (threshold 3000) → n = 1, one unsplit wave; `reviews/impl/waves.json` written; legacy flat `reviews.impl` normalized into the wave shape at entry
- 2026-09-24 — External Review skipped for sprint 017-review-waves iteration wave-1/iter-01: external review unavailable: command-unavailable (`codex` not on PATH in this cloud container)

## 2026-09-24 — impl-review wave-1/iter-01 → impl review-fix

- **Decision**: No reviewer returned FAIL, and all four internal reviewers returned CONCERNS: correctness 6, efficiency 4, testing 3, documentation 3; External was availability-skipped. The 16 findings route to impl review-fix with `review_fixes_pending = "wave-1/iter-01"`. The cap is not reached (iteration 1 of 7 in wave 1).
- **Rationale**: Every finding sits at or above floor `low` and can be autofixed without escalation, per each reviewer's own escalation section.
- **Affected docs**: reviews/impl/wave-1/iter-01/

## 2026-09-24 — COR-4 routed to the memory-owning agents (adaptive)

- **Decision**: The stale agent-memory lines named in COR-4 are fixed by each owning agent (`asd-external-review`, `asd-reviewer-correctness`, `asd-reviewer-efficiency`, `asd-reviewer-documentation`) in its own `.claude/agent-memory/<agent>/`, through its memory channel. `asd-dev` does not fix them. The orchestrator commits those writes, because reviewers hold no commit tool.
- **Rationale**: `sprint-lifecycle.md` "Self-hosting" lets Dev write only its own agent memory, and `artifact-layout.md` "Agent memory" gives each agent its own directory. Impl review-fix has no route for another agent's memory (friction F-2).
- **Affected docs**: .claude/agent-memory/
