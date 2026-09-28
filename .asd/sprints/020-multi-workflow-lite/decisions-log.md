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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

- 2026-09-28 — route Task 1: critical, dispatch HEAD dbfd199
- 2026-09-28 — route Task 2: standard, dispatch HEAD 848168f
- 2026-09-28 — route Task 3, Task 4, Task 5, Task 6: critical, dispatch HEAD 848168f
- 2026-09-28 — wave 2 runs 5 parallel dispatches; generated-view sync (`sync.js --apply`) deferred to Task 7 so concurrent devs never race on `.asd/sync-state.json`
- 2026-09-28 — route Task 7: standard, dispatch HEAD 913ef64

## 2026-09-28 — Impl assessment approved (adaptive)

- **Decision**: All 7 Tasks done (25/25 subtasks; commits 848168f..9f29356), build `sync.js --check` ok (74/74), lint clean, every touched path authorised, no sprint stubs. Flagged dev choices accepted as in-plan:
  - persist-review: optional `--manifest`, `.late` renames both outputs, findings JSON `[{id,severity,location}]`, column-position table parse, refuse-overwrite, reject empty CONCERNS/FAIL;
  - the combined agent copies correctness tools, and its n/a for docs covers in-code doc comments on a code-only scope;
  - AC-8 fires only with no FAIL and floor-filtered findings;
  - lite promotes into `{{STATUS}}` `approved`;
  - lite relaxes the asd-dev stop condition;
  - asd-sprint relays an unlisted `NEXT:` as FAILED;
  - manual verification is an orchestrator step for both workflows;
  - the rollback-reset table is replaced by the definition's `rollback_reset`.
- **Rationale**: Every choice stays inside the plan Overview decisions and the user's AC wording, and none opens a material alternative. `tests/run.js` is red by design (removed hook literal, new agent); that work belongs to impl-test. Commit 753325a's 53-char subject is left as is, since rewriting it would mean rewriting landed history under sibling commits.
- **Affected docs**: [plan.md](plan.md)
- 2026-09-28 — route impl-test entry 1: critical, dispatch HEAD 6a6d3f9
- 2026-09-28 — impl-test: defects D-1, D-2 → impl test-fix (digest ee5ac1d9979d0eb3c503434e1f405dd6967d7eb7a773da8535edfee632aeb0c1)
- 2026-09-28 — route D-1, D-2: standard, dispatch HEAD 758aa7a
- 2026-09-28 — impl test-fix: defects D-1, D-2 resolved (52c72ed, 3550328); build + lint green
- 2026-09-28 — route impl-test entry 2: critical, dispatch HEAD f6fa8b5
- 2026-09-28 — impl-test: impacted set green (full suite 245/245, safety valve), 0/0 tests
- 2026-09-28 — correctness ledger transcribed once (files rows `finding`→`checked`), re-run passed (F-3)
- 2026-09-28 — testing rejected attempt 1 in wave-1/iter-01 (findings table malformed: unescaped `|` in a cell); re-dispatched fresh (F-4)
- 2026-09-28 — impl-review wave-1/iter-01: correctness/efficiency/testing/documentation/external CONCERNS (4+2+6+4+2 findings); AC-8 test-only route not applicable (medium/high and non-test findings); → impl review-fix (review_fixes_pending=wave-1/iter-01)
- 2026-09-28 — route wave-1/iter-01 review-fix dev chain (correctness 1-4, efficiency 1-2, documentation F-1..F-4, external 1-2): critical, dispatch HEAD 64c8f8a
- 2026-09-28 — route wave-1/iter-01 review-fix tester chain (testing 1-6): critical, dispatch HEAD 2cecb8b
- 2026-09-28 — impl fix for wave-1/iter-01: findings resolved (dev chain 1a1a983..2cecb8b: correctness 1-4, efficiency 1-2, documentation F-1..F-4, external 1-2; tester chain c8a34db: testing 1-6)
