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

## 2026-09-16 — Retro rows of Glings 002 verified against HEAD 1421e34

- **Decision**: Framework rows of `D:\Projects\Glings\.asd\sprints\002-world-map-generation\retrospective.html` checked at `HEAD` 1421e34. Carried open: F-4 (AC-1), F-6 (AC-2), F-11 (AC-3), F-12 (AC-4), change-surface cap (AC-5), state/log/test-plan bloat (AC-6, AC-7). Closed: F-1, F-2, F-5/F-8 (retro's own "covered by", re-confirmed) and F-3.
- **Rationale**: F-4 open: `external-review.md` "Outcome contract" permits only a verdict or an availability skip. F-6 open: no rule in `sprint-lifecycle.md`/`asd-phase-impl*.md` reconstructs landed work after an agent failure. F-11 open: `runtime.js` `defectStalemate` splits on the first `## Defects` only. F-12 open: `NA_TARGETS` holds no entry for `Template adherence` or `Framework mode`, so split parts grant them only `outOfPart`. Cap open: no change-surface limit in scope/plan. Bloat open: no rotation for `decisions-log.md`/`test-plan.md`, no machine-only rule for `state.json` (`t_state.json` defines no prose key, the consumer added one). F-3 closed: waves are a consumer-invented cross-iteration partition. ASD's native split merges parts inside one iteration under `review-policy.md` union check, and DoD reads `verdicts["iter-NN"]` plus latches, so the gap does not exist upstream, and AC-5 removes the need for waves.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-16 — Scope accepted: Glings 002 retro framework remediation

- **Decision**: Sprint 014 scope is AC-1..AC-9 in `sprint.md`, accepted explicitly by the user at the hard scope gate. Audit runs (`documents.audit: auto`, scope has behaviour, contract and migration impact).
- **Rationale**: User asked to implement the framework-level proposals of the Glings 002 retrospective; still-open rows were verified at HEAD 1421e34 (entry above).
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-16 — Audit contradiction settled: narrow External Review skip

- **Decision**: `sprint-lifecycle.md` wins over `external-review.md`: the availability skip applies only to a non-ready preflight or an active negative cache. A failure after invocation is an interrupted dispatch and is re-dispatched; a recorded quota/auth negative cache makes that re-dispatch skip. AC-1 narrows `external-review.md` "Outcome contract" and `asd-external-review.md` accordingly.
- **Rationale**: User decision at the hard contradiction gate (canonical vs canonical, `sprint-lifecycle.md` "Audit phase").
- **Affected docs**: [audit.md](audit.md), [friction-log.md](friction-log.md)

## 2026-09-16 — Audit accepted (adaptive)

- **Decision**: `audit.md` accepted by the orchestrator under `user_gates: adaptive`. Its AC-5 cap value (100) and AC-7 rotation recommendation stay proposals for plan.
- **Rationale**: Routine gate: findings are factual with path:line evidence within accepted scope, the only unsettled contradiction was decided by the user, and no new scope or authority is implied.
- **Affected docs**: [audit.md](audit.md)
- 2026-09-16 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-16 — Plan choices decided by user

- **Decision**: AC-1: External Review reviews scope above `SPLIT_THRESHOLD_FILES` in sequential batches inside one dispatch (Complication Approval: **What** batch loop in the wrapper; **Why** n/m must be deterministic; **Justification** a self-reported count is unverifiable and absent on crash; **Alternatives** reviewed-files report line, rejected), and unreviewed files carry into the next iteration's manifest. AC-5: change-surface cap 100 files. AC-7: decisions-log rotated by rename at phase entry, test-plan narrative sections rotated per Entry log number.
- **Rationale**: User chose the recommended option on each material trade-off at plan.
- **Affected docs**: [plan.md](plan.md), [audit.md](audit.md)

## 2026-09-16 — `plan.md` accepted (adaptive)

- **Decision**: 8 Tasks in 6 waves cover AC-1..AC-9; no migration script, AC-8 met by a CHANGELOG manual step at `pr`. Commit trailer `ASD-Task: <id>` chosen for AC-2 commit→task mapping.
- **Rationale**: Routine gate: every AC traced, material alternatives settled by the user, remaining choices bounded inside accepted scope; audit lists no related open stubs and `stubs.md` is empty.
- **Affected docs**: [plan.md](plan.md)
