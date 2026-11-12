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

- 2026-11-05 — cleanup checkpoint 77a8a757a77340c19e2d91a648ff870b00ebbd23
- 2026-11-05 — cleanup: removed none; reverted none; verified n/a: no removals

## 2026-11-05 — retro written

- **Decision**: `retrospective.html` written on the analysed branch: 2 entries, 2 actions, 2 systemic proposals, one of them a `covered by:` row. Step 7 skipped under `self_hosting: enabled`.
- **Rationale**: Rows stay proposals; the next scope's retro intake takes their dispositions.
- **Affected docs**: `retrospective.html`, `friction-log.md`

## 2026-11-05 — PR opened

- **Decision**: Version bumped to 14.4.0 with its CHANGELOG section; PR 87 opened for `sprint/032-auto-sync-auto-merge`, then merged in this run per `git-strategy.md` "Merging a PR".
- **Rationale**: The scope gate named this sprint's own PR under the new rule; DoD checks pass. The first `gh pr create` failed with a GraphQL server error and made no PR, confirmed by a head-branch lookup; one retry opened it.
- **Affected docs**: `CHANGELOG.md`, `.asd/release-manifest.json`

## 2026-11-11 — sprint closure

- **Decision**: Sprint closed: PR #87 merged as 5f3dd335c5dbbbc668f7c1c10528e33eae18f5ab; folder archived, `phase=done`, `pr.state=merged`.
- **Rationale**: Merged-unclosed detected at sprint 033 start; release v14.4.0 tagged on the merge commit and published, included issues #80-#85 closed, so no release retry.
- **Affected docs**: `state.json`
