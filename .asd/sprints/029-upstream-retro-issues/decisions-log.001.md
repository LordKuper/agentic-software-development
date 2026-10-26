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

## 2026-10-26 — sprint opened

- **Decision**: Sprint 029 opened on workflow `lite` (user choice); 028-cleanup-phase closed by this branch's first commit (PR #64 merged at a3cf2231, release v14.0.0 published, no retry).
- **Rationale**: User chose the cheaper roster; the design block would collapse under `standard` anyway (prd/ux_spec/adr disabled).
- **Affected docs**: state.json

## 2026-10-26 — approach choice

- **Decision**: Approach A: one GitHub issue per consumer `asd` retro row, published automatically at retro after a framework-only content check, marker-identified; ASD self-hosting scope closes clear duplicates and HEAD-resolved issues, puts the rest (doubtful matches annotated with similar-issue links, off-format ones flagged non-standard) to include/reject/defer; included issues close after the release with its version and link.
- **Rationale**: User choice at stage (c); per-row issues map 1:1 to the existing intake and keep close-after-release simple.
- **Affected docs**: research.md
- 2026-10-26 — retro intake verified at HEAD 569c1bd5: 028#A-2 open (.claude/agent-memory/asd-dev/ holds no build/lint note); 028#P-1 open (review-policy.md "Low-severity test-only findings" fires for low severity only); 028#P-2 open (asd-phase-impl.md step 10 checks a flagged choice against the decisions log only, not agent definition, README or rule text); 028#P-3 open, narrowed (sprint-lifecycle.md "Decomposition rules" requires the universal-reach grep but names no grep forms)
- 2026-10-26 — audit frozen true: documents.audit=auto and scope changes behaviour, phase routing and gates

## 2026-10-26 — scope gate

- **Decision**: sprint.md AC-1..AC-13 accepted as one sprint (no split): upstream issues AC-1..AC-8 (AC-8 a consumer config key turning publication off, absent = enabled, user choice), retro 028 rows AC-9..AC-12.
- **Rationale**: User accepted the scope; consumer projects may be private, so publication to the public repo needs an opt-out; iterations 0, fix rounds 0 for every criterion.
- **Affected docs**: sprint.md

## 2026-10-26 — retro intake

- **Decision**: 028#A-2 included with its fix moved from asd-dev agent memory to this repo's AGENTS.md tail (AC-9); 028#P-1 included against the defer recommendation (AC-10); 028#P-2, 028#P-3 included (AC-11, AC-12).
- **Rationale**: User choice per row; the "No build / lint" self-description in AGENTS.md is the root cause of 028 F-2, so fixing it there reaches every agent, not only asd-dev.
- **Affected docs**: sprint.md, .asd/project/retro-backlog.md
