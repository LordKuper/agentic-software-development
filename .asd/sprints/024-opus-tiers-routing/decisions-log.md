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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-10-07 — route Task 1, Task 2: critical, dispatch HEAD 11f92e0
- 2026-10-07 — route Task 3: standard, dispatch HEAD 11f92e0
- 2026-10-07 — route Task 4: mechanical, dispatch HEAD 11f92e0
- 2026-10-07 — wave 1 done: Task 1 (8e82efb, f0eb735), Task 2 (377b7de), Task 3 (bdf64d8), Task 4 (1d2a90e); views synced (4 Claude agent views, manifest hashes), sync --check clean
- 2026-10-07 — flagged choices accepted: Task 1 extra L123 sentence on prose/test-only deltas (asked by D3); Task 1 log-line claim replaced by `task_routing[id].reason` (f0eb735, log format unchanged); Task 2 D6 paragraph after the audit-reevaluation sentence, the `change` bullet relying on the doubt bound for "ambiguous judgment" (consistent with providers.md L129 class names), Modes clause citing "Scope amendment"
- 2026-10-07 — route Task 5: critical, dispatch HEAD 44bcf76
- 2026-10-07 — route Task 6, Task 7: standard, dispatch HEAD 44bcf76
- 2026-10-07 — wave 2 done: Task 5 (91b1d00), Task 6 (a8485d5), Task 7 (b3d8875); no generated view changed, manifest upstream_hashes recomputed via --apply AGENTS.md, sync --check clean

## 2026-10-07 — impl assessment approved (adaptive)

- **Decision**: Initial impl is complete. All seven Tasks are ticked, build and lint are clean, `sync.js --check` is clean, and the self-check `node tests/run.js` passes 272/272. The round touched only authorised paths. There are no sprint stubs, and every flagged choice is resolved (wave 1 entry above).
- **Rationale**: `checkpoints.md` routine initial impl assessment in adaptive mode, with valid evidence.
- **Affected docs**: [plan.md](plan.md)
- 2026-10-07 — route impl-test entry 1: standard, dispatch HEAD 6d3b882
- 2026-10-07 — impl-test: impacted set green (273/273), 1/0 tests added/removed, 2 adjusted (entry 1, HEAD analysed 64c1898); no defects, no manual-verification row
- 2026-10-07 — impl-review division: 1 wave (119 lines, 15 files, 70465 bytes; under every threshold)

## 2026-10-07 — impl-review wave-1/iter-01 → impl review-fix

- **Decision**: combined CONCERNS (F1 low, `tests/run.js` hardcoded reserved-class list) and external CONCERNS (F1 medium `providers.md:123` derived-id declaration not durably recorded; F2 high, F3 high: the AC-3 and AC-6 tests do not reject the old rule / missing sequencing). Low-severity test-only branch not fired (external medium/high), so `review_fixes_pending=wave-1/iter-01`.
- **Rationale**: `asd-phase-impl-review.md` step 8; `review-policy.md` "Low-severity test-only findings" condition unmet.
- **Affected docs**: [reviews/impl/wave-1/iter-01/](reviews/impl/wave-1/iter-01/)
- 2026-10-07 — route review-fix wave-1/iter-01 external.md F1: critical, dispatch HEAD b29d2ad
- 2026-10-07 — route review-fix wave-1/iter-01 tests (external.md F2, F3; combined.md F1): standard, dispatch HEAD b29d2ad
- 2026-10-07 — flagged choices accepted (review-fix wave-1/iter-01): a derived id's routing line carries `; risk <declaration>` with `via <check>` after `none`/`artifact`, ids prefixed when one line names several (56b6d84); this reverses the 2026-10-07 "flagged choices accepted" entry's "log format unchanged" (f0eb735), on external.md F1's evidence that `reason` drops `none` vs absent and the named check
- 2026-10-07 — impl fix for wave-1/iter-01: findings resolved (external.md F1 by 56b6d84; external.md F2, F3 and combined.md F1 by 63ee0c8); manifest upstream_hashes recomputed, sync --check clean, suite self-check 273/273, lint clean, authorised paths only
- 2026-10-07 — route impl-test entry 2: standard, dispatch HEAD e7f8eca; risk artifact: content-contract pins via node tests/run.js
- 2026-10-07 — impl-test: impacted set green (273/273), 0/0 tests added/removed (entry 2, HEAD analysed 888bdf3); no defects, no manual-verification row
- 2026-10-07 — impl-review wave-1/iter-02: combined APPROVE, external APPROVE; iteration-1 findings verified resolved; wave 1 (last) roster met → terminal full-suite gate
- 2026-10-07 — route impl-review wave-1/iter-02 suite: standard, dispatch HEAD 34f5b0c; risk none via node tests/run.js

## 2026-10-07 — impl-review DoD met

- **Decision**: Wave 1 of 1 met its roster at iter-02, with combined and external both APPROVE after one review-fix round. The terminal full suite ran green: `node tests/run.js` exit 0, 273/273 at 3d9c1be, recorded in 6b095ca. Lint and `sync.js --check` are clean. The green handoff is recorded adaptively. Next is design-promote (lite, all documents disabled, so it is a no-op).
- **Rationale**: `sprint-lifecycle.md` "Review iteration counters" and "Impacted test set".
- **Affected docs**: [test-plan.md](test-plan.md)
