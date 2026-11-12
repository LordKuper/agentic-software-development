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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

- 2026-11-12 — route Task 1: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 2: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 3: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 5: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 6a: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 6b: standard, dispatch HEAD ebeac333

## 2026-11-12 — wave 1 flagged departures accepted

- **Decision**: Accept Task 5's one-command form with `git diff --cached --check -- <paths>` before `commit-check` and `git commit --only … -- <paths>`; accept Task 6a's `asd:vars` markers wrapping the whole `:root { … }` block (Task 9 emits the full block); leave 8e4018f0's 54-char header unrewritten. `t_review-report.md` below-floor wording joins Task 7's write scope.
- **Rationale**: The lint step and `--only` keep code-style.md §19 and the shared worktree safe; an HTML comment inside a CSS rule drops a declaration; rewriting a shared wave's history costs more than one over-long header.
- **Affected docs**: .asd/rules/git-strategy.md, .asd/templates/t_design-system.html, plan.md Task 7, Task 9
- 2026-11-12 — route Task 4: standard, dispatch HEAD ad03cb51
- 2026-11-12 — route Task 7: standard, dispatch HEAD ad03cb51
- 2026-11-12 — route Task 10: standard, dispatch HEAD ad03cb51

## 2026-11-12 — plan gap: rename-map declaration added to Task 8

- **Decision**: Task 8 gains a subtask documenting AC-24's plan-declared rename map (plan line, sprint tree entry, impl-review passing `--rename-map` to `review-waves` and `emit-manifest`); Task 7's map format (JSON object, longest key first) and its `review-waves --rename-map` extension are accepted.
- **Rationale**: Task 7 shipped the flag but no Task owned the declaration AC-24 names; wave 3 holds only Task 8, so the doc edits collide with nothing.
- **Affected docs**: plan.md Task 8, .asd/rules/sprint-lifecycle.md, .asd/rules/artifact-layout.md, .asd/workflows/asd-phase-impl-review.md
- 2026-11-12 — route Task 8: standard, dispatch HEAD 3d8f1ff4
- 2026-11-12 — route Task 9: standard, dispatch HEAD 64379c28
- 2026-11-12 — route Task 11: standard, dispatch HEAD 64379c28
