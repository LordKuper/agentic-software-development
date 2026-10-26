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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-10-22 — sprint opened

- **Decision**: Sprint 028 opened on workflow `lite` (user choice); 027-staged-design-retro-intake closed by this branch's first commit (PR #63 merged at d0171111, release v13.10.0 published, no retry).
- **Rationale**: User chose the cheaper roster; the design block would collapse under `standard` anyway (prd/ux_spec/adr disabled).
- **Affected docs**: state.json

## 2026-10-22 — approach choice

- **Decision**: Cleanup phase follows the diff-scoped sweep with a checkpoint; verification is build + lint plus the tests the removals impact, failures fixed or reverted autonomously.
- **Rationale**: User choice at stage (c); impacted tests added so a removed fixture breaks inside cleanup, not at PR open.
- **Affected docs**: research.md

- 2026-10-22 — retro intake verified at HEAD 9814d382: 027#A-1 open (asd-external-review.md return text states no empty-table rule; only review-policy.md "Findings table" does); 027#P-1 open (no stage write-point/re-entry-evidence rule in sprint-lifecycle.md or asd-phase-plan.md); 027#P-2 open (no universal-reach site-listing rule in sprint-lifecycle.md or asd-phase-plan.md)
- 2026-10-22 — audit frozen true: documents.audit=auto and scope changes behaviour, phase chain and gates

## 2026-10-22 — scope gate

- **Decision**: sprint.md AC-1..AC-10 accepted as one sprint (no split): cleanup phase AC-1..AC-7, retro 027 rows AC-8..AC-10.
- **Rationale**: User accepted the scope; all cleanup criteria form one phase, retro rows are small rule edits; iterations 0, fix rounds 0 for every criterion.
- **Affected docs**: sprint.md

## 2026-10-22 — retro intake

- **Decision**: 027#A-1, P-1, P-2 included (AC-8..AC-10); none rejected or deferred.
- **Rationale**: User decision per row after cause, edits and consequences were shown.
- **Affected docs**: .asd/project/retro-backlog.md
