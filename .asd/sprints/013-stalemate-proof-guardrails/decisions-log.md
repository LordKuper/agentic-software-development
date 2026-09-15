---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-15 — Scope accepted: stalemate breaker, grounded fail-first proof, retro dedup-then-guardrail

- **Decision**: Sprint 013 scope is AC-1..AC-9 in `sprint.md`, as fully specified by the user in chat (three items plus retro dedup before drafting). Recorded as already-authorized; no further scope gate.
- **Rationale**: The user named every change, its target files and the retro ordering. Premises verified at `HEAD` 68b4659: impl⇄impl-test is uncapped (`sprint-lifecycle.md`), the `Regression proof` cell accepts a bare `fail-first vs D-N` (`t_test-plan.md`), and retro has no dedup step nor guardrail/home fields (`asd-phase-retro.md`, `t_retrospective.html`).
- **Affected docs**: [sprint.md](sprint.md)

- 2026-09-15 — audit `auto` → true: scope changes gate behaviour and template contracts, not mechanical.
- 2026-09-15 — design, design-review, design-promote suppressed by `skip_design_phases`; PRD/UX-spec/ADR/C4 already disabled in config.
