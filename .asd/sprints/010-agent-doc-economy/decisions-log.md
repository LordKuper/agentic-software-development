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

## 2026-09-09 — Retrospective-derived criteria re-verified against HEAD 28343c32899cbdf639404084c3001c688d325132

- **Decision**: All nine sprint-009 retrospective actions carried into sprint 010, two of them narrowed. Row-by-row outcome at the verified HEAD: F-1 (wave ordering for contract-changing tasks) — unresolved, no wave concept in `sprint-lifecycle.md` plan format or `asd-phase-plan.md`. F-2 (whole-tree git commands) — PARTIAL: `git-strategy.md` line 39 already bans `git add -A`/`-u` and `commit -a` for a dispatched agent, so the criterion is narrowed to the uncovered half — `git add --renormalize` and `git stash` are unnamed, and no rule ties any of them to "no sibling dispatch in flight" or reaches the orchestrator. F-2b (consumer mirror) — unresolved, `custom-coding-rules.md` carries no staging rule. F-3 (memory-commit owner) — PARTIAL: the same line covers a dispatched reviewer's agent-memory writes because a reviewer holds no commit tool; the concurrent co-author case the retrospective identified is uncovered, so the criterion is narrowed to it. F-4 (availability skip as friction entry) — unresolved, `external-review.md` contains no occurrence of "friction". F-5a (fail-first mutation restored) — unresolved, `code-style.md` §17 requires the fail-first proof but says nothing about restoring the mutation. F-5b (fix-round-exit diff read) — unresolved, `asd-phase-impl.md` contains no diff step. F-6a (ledger enforcement split) — unresolved, the enforcement paragraph still routes every invalid ledger to reject-and-re-dispatch as one case. F-6b (row shape example in manifest) — unresolved, the manifest carries `vocabulary` but no row-shape example, and `runtime.js` exports none.
- **Rationale**: `sprint-lifecycle.md` "Orchestration and adaptive gates" requires every retrospective-derived row to be checked against current `HEAD` before it becomes an `AC-N`, because a retrospective states what was true at the HEAD that produced it. Evidence for each row above is a grep over the named target file at that sha.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/sprint.md` (AC-1 … AC-6), `.asd/sprints/archived/009-retro-008-remediation/retrospective.html`

## 2026-09-09 — Audit phase runs (documents.audit: auto → true)

- **Decision**: `documents.audit: auto` normalizes to running the audit for this sprint; `state.json.documents.audit` frozen to `true`.
- **Rationale**: `auto` skips only a complete, verifiably mechanical scope with no behaviour, contract, migration or gate impact. This scope changes the dispatch contract (AC-1), the staging and commit-ownership contract (AC-2, AC-3), the review enforcement contract (AC-6), and adds a rule the documentation reviewer enforces (AC-7) — none of it mechanical.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/state.json`

## 2026-09-09 — Sprint 010 scope accepted

- **Decision**: The user accepted `sprint.md` AC-1 … AC-9 unchanged at the hard scope gate.
- **Rationale**: The initial scope gate is hard in both policy modes because it establishes the authority the adaptive policy later reuses. Per-criterion cost was stated before the decision: 0 iterations, 0 fix rounds for every criterion, this being a new sprint.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/sprint.md`, `.asd/sprints/010-agent-doc-economy/state.json`
