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

## 2026-09-24 — Review-wave scope choices

- **Decision**: Review waves apply to `impl-review` only. The orchestrator divides the scope at `impl-review` entry when it exceeds a size threshold, into at most 3 logical waves. A later fix that touches an approved wave's files is reviewed in the current wave, and approved waves are never reopened. The review wave is the same concept as today's review-dispatch wave (split parts plus Dispatch ceiling): it refines that mechanism rather than adding a new term. No separate cleanup criteria.
- **Rationale**: User answers at scope. The recommended option was chosen for phases and for cross-wave fixes. For timing, the user picked split-at-entry over the plan-declared recommendation, and clarified that "wave" means the review-dispatch wave.
- **Affected docs**: sprint.md

## 2026-09-24 — Sprint branch deviates from git.branch_pattern

- **Decision**: The sprint runs on `claude/asd-sprint-4y74bx` instead of `sprint/017-review-waves`.
- **Rationale**: The hosting session requires all commits and pushes on that branch. `main` == HEAD `8654fa7` (fast-forward verified), tree clean.
- **Affected docs**: state.json

- 2026-09-24 — audit frozen true: `documents.audit: auto`, scope changes review behaviour, state schema and gate routing (not mechanical)
- 2026-09-24 — prd, ux_spec, adr frozen false (config-disabled); c4 frozen false (`project.diagram_tool: none`)

## 2026-09-24 — Scope expanded: per-reviewer file list

- **Decision**: AC-8 added. In both review phases the orchestrator builds, for each reviewer agent (External Review included), the explicit file list to review, and that list is the agent's only scope source, with one canonical home. Audit stays frozen true; the expansion does not change that.
- **Rationale**: User request at the scope gate, before accept.
- **Affected docs**: sprint.md

## 2026-09-24 — Scope refined: diff-volume threshold and scope hand-off triple

- **Decision**: AC-1: the wave threshold measures diff volume, not file count; metric and value are set at plan. AC-8: hand-off is list = normative scope, runtime-precomputed per-list diff file = content, whole files = on-demand context; External Review gets the same list and diff, with no self-computed diff from refs.
- **Rationale**: User accepted the token-economy analysis at the scope gate. Dispatch cost is dominated by content read and per-dispatch fixed overhead, not the list; file count is a poor proxy for review size.
- **Affected docs**: sprint.md
