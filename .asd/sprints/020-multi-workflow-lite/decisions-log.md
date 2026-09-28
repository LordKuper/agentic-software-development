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

## 2026-09-28 — Sprint 020 opened: multi-workflow support with a lite workflow

- **Decision**: Scope = declarative per-workflow lifecycle definitions; `standard` unchanged; new `lite` (`scope → audit → plan → impl ⇄ impl-test → impl-review → design-promote → retro → pr`) with post-acceptance unreviewed doc writes and a two-reviewer impl-review (one combined internal + External). Workflow chosen by explicit user decision at every sprint start, frozen in `state.json`, no config default; absent field reads `standard`.
- **Rationale**: User clarifications at scope (phase set, selection, declarative form, lite review roster). This sprint itself runs on the current lifecycle.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-28 — Retro intake candidates verified at HEAD 7f9d4a1

- **Decision**: 7 candidates, all still unresolved: 019#A-1 (no plan-line/execution-point rule in sprint-lifecycle.md "Plan file format" or t_plan.md), 019#P-1 (retro-intake re-verification names no host-behaviour check), 019#P-2 (no plan-Overview home-heading rule), 019#P-3 (artifact-layout.md "Leftover-term check" still a free search, no pinned removed sentences), 016#P-1 (review-policy.md has no in-place low-severity test fix), 017#P-1 (no degenerate-input rule for plan formulas), 017#P-3 (runtime.js has no review-file persist command). None closed; all go to the scope gate.
- **Rationale**: `sprint-lifecycle.md` "Retro intake" re-verification rule; evidence = grep of each named home at HEAD.
- **Affected docs**: [.asd/project/retro-backlog.md](../../project/retro-backlog.md)

- 2026-09-28 — audit frozen true: `documents.audit: auto`, scope changes lifecycle behaviour, gates and state contract (not mechanical)
- 2026-09-28 — documents frozen: prd/ux_spec/adr disabled by config; c4 false (`diagram_tool: none`)

## 2026-09-28 — Scope gate accepted; retro intake dispositions

- **Decision**: User accepted sprint.md (AC-1..AC-7) explicitly. Retro intake: included 016-remove-terra-family#P-1 → AC-8 and 017-review-waves#P-3 → AC-9; deferred 019-retro-intake#A-1, #P-1, #P-2, #P-3 and 017-review-waves#P-1. Criterion cost for each included row: 0 iterations charged, 0 fix rounds charged.
- **Rationale**: Hard scope gate plus hard retro-intake gate (`checkpoints.md` "Gate policy"), decided by the user. The review-cost rows fit a sprint that already reworks impl-review; the plan-rule rows were deferred.
- **Affected docs**: [sprint.md](sprint.md), [.asd/project/retro-backlog.md](../../project/retro-backlog.md)
