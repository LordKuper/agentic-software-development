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
- 2026-09-16 — EXT-4 (`runtime.js:186` retryAfter falsy default) rejected: pre-existing code outside the change surface, not made incorrect by it (`review-policy.md` "Change-surface rule")
- 2026-09-16 — iter-01 fix resolutions fixed by orchestrator within accepted AC-1/AC-2/AC-4 scope: one `ASD-Task` line per covered id plus an impl-review suite-fix id; reconstruction reads trailers with no sprint-path exclusion, names leftovers only among the failed dispatch's own authorised paths, and never treats an impl-test trailer as landed (resume from on-disk entry evidence); skip writes `Unreviewed files`; nested AGENTS.md/CLAUDE.md count as templated
- 2026-09-16 — route iter-01 dev chain: critical, dispatch HEAD dca1f37
- 2026-09-16 — iter-01 dev chain flagged choices accepted: root-only isTemplated clause deleted, skip external.md = token + Unreviewed files only, file-plus-number trailer ids for unnumbered findings
- 2026-09-16 — route iter-01 tester chain: critical, dispatch HEAD 6d96e90
- 2026-09-16 — tester chain flagged choices accepted: CLI real-list check (no templateNames export), sentence-return guard for asd-sprint, Suite run left to impl-review

## 2026-09-16 — impl fix for iter-01: findings resolved

- **Decision**: All iter-01 findings resolved except EXT-4 (rejected, outside change surface). Dev chain 8 commits, tester chain `ff33c76`; suite 207/207, `sync.js --check` ok, lint clean, diff paths within finding locations plus synced views and manifest.
- **Rationale**: Fix-mode finalize; every flagged choice resolved above.
- **Affected docs**: [reviews/impl/iter-01/](reviews/impl/iter-01/), [test-plan.md](test-plan.md)
