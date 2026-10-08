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

- 2026-10-08 — route Task 1, Task 2: critical, dispatch HEAD 8f9bff04
- 2026-10-08 — wave 1 flagged choices: Task 1 items 1-8 accepted (defaults and gaps reporting within D2-D7; gaps F-N and the retro summary command line handed to Task 4); Task 2 idle timeout and unbounded body sent back to meet D8 (fixed in 468af83c: 5 s total deadline, 1 MiB body cap), local-version warning accepted
- 2026-10-08 — route Task 3: critical; Task 4, Task 5, Task 6, Task 8: standard; Task 7: mechanical, dispatch HEAD 8561011a
- 2026-10-08 — wave 2 flagged choices: Task 3 items 1-2 accepted, items 3-4 sent back to meet step 3a and asd-sprint signal routing (fixed in cb0c629: full seed, post-update halt is FAILED); Task 5 t_AGENTS.md hard-rule mirror not edited (agent-facing ad-hoc-edit rule, a user-chosen /asd-update is the sanctioned writer, AGENTS.md is loaded every consumer session); Task 6 section placement and h3 tables accepted

## 2026-10-08 — impl assessment approved (adaptive)

- **Decision**: Initial impl accepted at b38ded98: Tasks 1-8 complete, plan fully ticked, `sync.js --check` and lint clean, every touched path authorised, no stubs introduced. AC coverage: AC-1/2/4/5 Task 1+5, AC-3 Tasks 3/4/7, AC-6 Tasks 1/4/6, AC-7 Tasks 5/8 + syncs, AC-8 Tasks 2/3/5/8. Suite 272/273: the one red pin (§18 empty-log TOC threshold) is the expected D9 consequence, left to impl-test.
- **Rationale**: `checkpoints.md` routine initial impl assessment, adaptive evidence; every flagged choice resolved above.
- **Affected docs**: [plan.md](plan.md)
- 2026-10-08 — route impl-test entry 1: standard, dispatch HEAD c8740b8a; risk artifact: content-contract pins
- 2026-10-08 — impl-test: impacted set green (280/280, full suite via safety valve), 7/0 tests (1 adapted)
- 2026-10-08 — impl-review wave-1/iter-01: combined CONCERNS (C1-C7), external CONCERNS (1-3); no FAIL, no low-severity test-only branch; route to impl review-fix (review_fixes_pending=wave-1/iter-01)
- 2026-10-08 — route review-fix wave-1/iter-01: standard, dispatch HEAD 48d6cb86; risk artifact: timing summary logic
- 2026-10-08 — review-fix flagged choices: C2 quote-the-value accepted; interval-nesting leaf rule rejected (parallel dispatches would drop long siblings from the slow set), fixed parent-based in b65766a
- 2026-10-08 — impl fix for wave-1/iter-01: findings resolved (external 1-3, combined C1-C7; external 3 = C3), commits 2f15dbb, b65766a; build and lint clean; suite 279/280, the sprint-025 AC-5 timingSummary pin left to impl-test
- 2026-10-08 — route impl-test entry 2: standard, dispatch HEAD ea969089; risk artifact: content-contract pins
- 2026-10-08 — impl-test: impacted set green (281/281, full suite via safety valve), 1/0 tests (1 adapted)
