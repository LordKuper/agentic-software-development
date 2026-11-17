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

## 2026-11-16 — sprint opened

- **Decision**: Sprint 034 opened on `sprint/034-open-issue-triage` with workflow `lite` (user choice); scope: triage the open issues.
- **Rationale**: Design documents are disabled in this repo, so `standard`'s design block would collapse anyway; `lite` keeps one combined reviewer plus External Review.
- **Affected docs**: `state.json`

## 2026-11-16 — approach choice

- **Decision**: Scope = retro intake over the 12 open `[asd-retro]` issues and the 5 sprint-033 rows, plus #110 by approach A (every project lists its own open GitHub issues at scope; each non-marker issue goes to the user as include / reject / defer, no auto-close). Comments on a consumer project's issues use `language.docs`. One sprint, no split.
- **Rationale**: User answers in the requirements interview and the approach choice; A reuses the triage path and labels so a decided issue is never asked twice.
- **Affected docs**: `research.md`

## 2026-11-16 — retro intake verification at HEAD 6fc0e1e3

- **Decision**: 033#A-1..A-4 and 033#P-1 still unresolved (scope workflow has no host-permission or deliverability step; external-review.md still mandates a heredoc; `runtime.js` timing takes dispatch attrs only from flags; `t_test-plan.md` Scope is impacted|full by invocation). Issues #114, #115 (narrowed: an already-closed id is now skipped, a never-opened id still appends an unpaired close), #118, #119, #86 unresolved; #110 is raw scope.
- **Rationale**: Verified against `.asd/runtime.js` timing functions, `sprint-lifecycle.md` "Impacted test set" and "Review iteration counters", `artifact-layout.md` "Test plan", `agent-protocol.md` "Dispatch payload".
- **Affected docs**: `sprint.md`
- 2026-11-16 — issue triage: rewrote none; closed duplicate #117 of #114; closed resolved #76 (sprint-lifecycle.md Reuse), #95 (Scope amendment reviews.design reset), #96 (reset moves reviews/<node>.reset-<n>/), #100 (tester new suite id; runtime skips re-close), #108 (runtime cascades child closes), #111 (runtime `continued` close); to user #86, #114, #115, #118, #119; non-standard none

## 2026-11-16 — scope gate and retro intake dispositions

- **Decision**: User accepted `sprint.md` AC-1..AC-15 as one sprint and included every candidate: 033#A-1..A-4 and 033#P-1 (AC-6..AC-10, backlog rows written), issues #86 and #119 (AC-11), #114 (AC-12), #115 narrowed (AC-13), #118 (AC-14); #110 is AC-1..AC-5. Criterion cost: 0 iterations / 0 fix rounds each (new criteria).
- **Rationale**: All re-verified unresolved at HEAD 6fc0e1e3; each AC checked deliverable within the self-hosting canon allowlist at impl. Audit stays on (`documents.audit: auto`, behaviour and contract changes).
- **Affected docs**: `sprint.md`, `.asd/project/retro-backlog.md`
- 2026-11-16 — issue dispositions: #86 include AC-11; #119 include AC-11; #114 include AC-12; #115 include AC-13; #118 include AC-14; #110 include AC-1..AC-5
