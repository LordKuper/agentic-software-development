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

- 2026-09-24 — stub inclusion skipped: `audit.md` has no Related open stubs; `.asd/project/stubs.md` empty

## 2026-09-24 — Scope changed: review waves replace split parts

- **Decision**: AC-5 rewritten: split dispatch parts are removed entirely in both review phases, and review waves are the one mechanism for splitting a large review scope. The design-review out-of-scope line now says it is reviewed unsplit. Plan D7 covers the knock-on: twice-interrupted escalation, `surface-check` without `dispatches`, and `EXTERNAL_BATCH_FILES` for the wrapped-CLI batches.
- **Rationale**: Explicit user instruction at the plan gate, which serves as authority for the scope change.
- **Affected docs**: sprint.md, plan.md

## 2026-09-24 — Scope changed: External batches and Dispatch ceiling removed

- **Decision**: AC-5 also removes External Review's in-dispatch file batches, together with its `partial` outcome, and the Dispatch ceiling (`DISPATCH_CEILING`). Plan D7 covers the knock-on: one wrapped-CLI invocation per dispatch; a legacy recorded partial token still reads as satisfied; impl Task waves dispatch fully concurrently.
- **Rationale**: Explicit user instruction at the plan gate, which serves as authority for the scope change.
- **Affected docs**: sprint.md, plan.md

## 2026-09-24 — `.asd/sprints/017-review-waves/plan.md` accepted

- **Decision**: User explicitly accepted plan.md (D1..D10, Tasks 1-6 in 5 impl waves) together with the AC-5 scope changes made at this gate. This covers the hard items: the public External Review scope-manifest change (D9b), the state schema change with reader fallback (D3), and the removal of parts, External batches and the Dispatch ceiling (D7).
- **Rationale**: Hard gate items (public contract, compatibility, scope) need explicit user approval.
- **Affected docs**: plan.md, sprint.md
