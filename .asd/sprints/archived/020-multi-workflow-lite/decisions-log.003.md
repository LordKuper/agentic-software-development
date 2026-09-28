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

## 2026-09-28 — Lite internal reviewer scope refined by user (supersedes audit A1 answer)

- **Decision**: Lite's internal reviewer always applies the Correctness + Efficiency rubrics and gives an overall quality assessment of all changes; when a documentation file changed in scope it also applies the Documentation rubric to it. The Testing rubric is not a separate check. AC-4 reworded to match.
- **Rationale**: User message during plan; it narrows the earlier "Correctness+Efficiency only" answer by adding conditional documentation review.
- **Affected docs**: [sprint.md](sprint.md) AC-4

## 2026-09-28 — `.asd/sprints/020-multi-workflow-lite/plan.md` accepted

- **Decision**: User accepted plan.md explicitly: 7 Tasks in 3 waves (T1 / T2-T6 / T7), change surface 40 files (cap 100). Plan-level decisions: `.asd/workflows/{standard,lite}.json` definitions, `state.json.workflow` frozen by a hard scope-step-1 choice, `sprint-lifecycle.md` "Workflows" home, new `asd-reviewer-combined` agent with runtime-composed rubric, `persist-review` command (AC-9), `review-policy.md` "Low-severity test-only findings" (AC-8). No open stubs in scope.
- **Rationale**: Hard gate (material architecture and public contract change: new agent, state schema field, runtime CLI).
- **Affected docs**: [plan.md](plan.md)
