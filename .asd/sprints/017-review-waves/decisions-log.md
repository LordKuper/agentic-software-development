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
- 2026-09-24 — External Review skipped for sprint 017-review-waves iteration wave-1/iter-03: external review unavailable: command-unavailable (same cause as F-1); efficiency latched (iter 2), not dispatched

## 2026-09-24 — impl-review wave-1/iter-03: roster met, wave 1 of 1 closed

- **Decision**: Correctness, Testing and Documentation returned APPROVE and are now latched at iteration 3. Efficiency was latched at iteration 2, and External was availability-skipped. K = n = 1, so the phase goes to the terminal full-suite gate.
- **Rationale**: Every required reviewer is APPROVE or latched in `verdicts["iter-03"]`.
- **Affected docs**: reviews/impl/wave-1/iter-03/

- 2026-09-24 — route impl-review wave-1/iter-03 suite: critical, dispatch HEAD 0721b6c

## 2026-09-24 — impl-review DoD met (adaptive green handoff)

- **Decision**: The terminal full suite is green: test 225/225, lint and build clean at f6ad5fa, recorded in 1c91120. Reviewer DoD is met in wave 1 of 1, and the phase goes to retro.
- **Rationale**: This is a routine gate with complete machine evidence and no open finding. External Review was availability-skipped in every iteration (F-1).
- **Affected docs**: test-plan.md, reviews/impl/
