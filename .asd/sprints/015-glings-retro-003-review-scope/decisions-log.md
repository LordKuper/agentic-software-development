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

## 2026-09-22 — Glings retro 003 rows verified at HEAD 8649c9c

- **Decision**: Carry F-1 (AC-8), F-3 (AC-7), F-4 (AC-6), F-7/F-8 (AC-4), F-9 (AC-5), systemic cleanup-criteria (AC-10), all unresolved. F-2 narrowed to its audit half (AC-9); systemic fan-out narrowed to a concurrency ceiling plus cap-override disclosure (AC-11). F-5, F-6 and the consumer systemic row are excluded as consumer scope.
- **Rationale**: F-1: no per-sprint skip exists, only config `documents.*`. F-2: reviewers already split at `SPLIT_THRESHOLD_FILES`=25, but architect `maxTurns` is 50 and the audit payload has no batched-read rule. F-3: `asd-sprint` SKILL step 2A.3 still collects scope via a request-user-decision prompt, and this session reproduced it. F-4: `asd-ba`/`asd-ux` tools have no Bash, and design-promote has no rename/delete route. F-7/F-8: the impl-review payload passes "the diff" to Read/Glob/Grep-only reviewers. F-9: the ledger has no rename row class. Cleanup criteria: the scope workflow has no such prompt. Fan-out: `SURFACE_CAP_FILES`=100 (sprint 014) bounds default fan-out to about 17 dispatches, but a cap override is unbounded.
- **Affected docs**: sprint.md AC-4..AC-11

- 2026-09-22 — audit frozen `true`: scope changes behaviour, contracts and gates (not mechanical)
- 2026-09-22 — prd, ux_spec, adr skipped: disabled in config; c4 `false` (diagram_tool none)

## 2026-09-22 — Scope accepted

- **Decision**: User accepted sprint.md AC-1..AC-13 at the hard scope gate.
- **Rationale**: Explicit `accept`; the AC-2 per-reviewer file subset and the AC-11 ceiling-plus-waves interpretation were surfaced for review before accept.
- **Affected docs**: sprint.md

## 2026-09-22 — Audit contradictions settled

- **Decision**: C-1: Correctness owns the AC→code trace and Testing owns the AC→check coverage. C-2: incremental scope everywhere, so design-review internal reviewers also get only the changed drafts on iteration 2+. C-3: "the wrapped CLI self-scopes". C-4: the gate answer is written to disk before any further work.
- **Rationale**: Hard user decisions on canonical-vs-canonical contradictions (`sprint-lifecycle.md` "Audit phase"). C-2 overrides the architect's proposed resolution.
- **Affected docs**: audit.md "Contradictions"

## 2026-09-22 — Audit accepted (adaptive)

- **Decision**: Orchestrator advanced the routine audit gate.
- **Rationale**: Every `t_audit.md` section was returned, every contradiction was settled by the user, there is no product ambiguity, and decomposition is disabled. The plan carries the open choices the audit named: design-review Correctness with an empty list, patch files committed vs gitignored, c4 skippable under AC-8.
- **Affected docs**: audit.md

- 2026-09-22 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-22 — `plan.md` accepted

- **Decision**: The user accepted a plan of 7 Tasks in 4 waves, with a change surface of 25 files. The plan settles the choices the audit left open:
  - design-review Correctness gets every changed draft and a new "Draft correctness" rubric entry.
  - Only Testing narrows in impl-review.
  - Compact rows cover R100 renames only.
  - Patch files are committed.
  - `c4` is skippable.
  - Architect `maxTurns` is 150.
  - Version 11.0.0, with no migration.
- **Rationale**: These are material choices the user had not authorized before, so the gate was explicit rather than adaptive. No open stubs.
- **Affected docs**: plan.md
