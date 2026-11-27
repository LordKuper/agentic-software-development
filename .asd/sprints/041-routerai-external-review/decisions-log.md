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

- 2026-11-27 — route Task 1: standard, dispatch HEAD 4b4014a705a9a1ff8c63ddecf3cca352e68e8e9d; risk change: public contract, change: authentication
- 2026-11-27 — Task 1 committed bff4888c; generated views synced 11fb45ac; syntax, lint, context ceilings and sync check pass. RouterAI profile unavailable locally; live inference unverified. Contract callers route to Task 2.
- 2026-11-27 — route Task 2: standard, dispatch HEAD 5f6e2c793add9b7e9cd45c46541b7dd159e59177
- 2026-11-27 — Task 2 committed e3482c79; runtime-routing and runtime-timing passed 47/47. New behavior regression coverage remains for impl-test.
- 2026-11-27 — route Task 3: escalated, dispatch HEAD ba3cdbe785f18b8efc044399ec7f323b177e153f; risk change: workflow gate, change: broad-reasoning
- 2026-11-27 — Task 3 committed 107c87dd; generated views synced 62dfa94c; build, lint, context ceilings and six researcher bundles pass. Live researcher dispatch remains unverified.
- 2026-11-27 — route Task 4: standard, dispatch HEAD fccee4ac9b2c3228d78ba5b93372d7cdf3a5875f
- 2026-11-27 — Task 4 uncovered malformed researcher metadata; Task 3 owner corrected it in b7f5d4f8, views synced in 9eabd037. Task 4 committed 47f24f65; impacted tests 142/142 including executable update cases. Two redundant assertions removed; surviving checks detected both injected omissions (cleanup transition and missing reviewer).
- 2026-11-27 — Task 4 pruning proof: `tests/contract-workflows.test.js` test `workflow definitions are the single source for the phase set` failed the injected missing impl-review → cleanup edge; `tests/contract-agents.test.js` test `read-only agents (AC-3)` failed the injected missing reviewer. Each mutation ran exactly one selected test and exited 1; unmodified impacted suite passed. Evidence `.asd/tmp/041-routerai-external-review-Task-4-suite-impl-4-2-{route,roster}.runner.log`.
- 2026-11-27 — Initial implementation build, cached-diff lint and context check pass; agnix strict 0 errors, 0 warnings. All plan Tasks completed; adaptive assessment routes to impl-test for independent regression coverage.
- 2026-11-27 — route impl-test entry 1: standard, dispatch HEAD 9e615958234fc603184a26d2d3b1401f59698653
- 2026-11-27 — route impl-test entry 1 author: standard, dispatch HEAD ab834ad9bc8ab53624bbc31f65baae7fb716b896
- 2026-11-27 — impl-test entry 1 defect digest b694b1006217c4ea65cb6eb35d5620f9daba7203ed0b094d7fd60a698323ca78; D-1 and D-2 route to test-fix. Regression tests and fail-first evidence committed f7970f63; suite 295/297 recorded c822fed5.
- 2026-11-27 — impl-test: defects D-1,D-2 -> impl test-fix
