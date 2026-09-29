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
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-30 — Scope amendment: AC-14 (merged-unclosed at any phase)

- **Decision**: At the pr publication gate the user asked to fix, now, the residual that iter-05 dropped below the floor. It is added as AC-14, carried by Task 11 in the new wave 3: the head-branch lookup runs for every active sprint without `pr.number`, and a `MERGED` hit is merged-unclosed at any phase. The change surface is unchanged: Task 11 edits only `sprint-lifecycle.md` and the `asd-sprint` SKILL, both already counted (plan estimate 56, real scope 69/100). Audit stays true. The phase goes back to `impl`, which is not strictly earlier than impl-review's input phase, so review counters are kept (wave 1 continues at iteration 6, floor critical). Both review latches are cleared by this user-authorised amendment, because post-APPROVE code needs a review. The 13.4.0 bump commit stays: the pr step 2 bump is idempotent.
- **Rationale**: `sprint-lifecycle.md` "Scope amendment", run for the first time on the sprint that introduced it. The hard `new or changed scope` gate was satisfied by the user's explicit request.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-09-30 — route Task 11: critical, dispatch HEAD d590220
- 2026-09-30 — impl wave 3 (Task 11, 5645459) assessed adaptively. Flagged choices were accepted: plan D1 detection wording now lags canon (AC-14 supersedes it); the OPEN rule sits on the resume bullet; the "State recovery" sentence was aligned.
- 2026-09-30 — route impl-test entry 7: critical, dispatch HEAD 56db444
