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

- 2026-10-26 — route Task 1: standard, dispatch HEAD 331c7c17
- 2026-10-26 — route Task 2: standard, dispatch HEAD 331c7c17
- 2026-10-26 — route Task 3: standard, dispatch HEAD 331c7c17
- 2026-10-26 — route Task 4: standard, dispatch HEAD 331c7c17
- 2026-10-26 — route Task 5: standard, dispatch HEAD 331c7c17
- 2026-10-26 — route Task 6: mechanical, dispatch HEAD 331c7c17
- 2026-10-26 — route Task 3: standard, dispatch HEAD b1f89e37
- 2026-10-26 — route Task 4: standard, dispatch HEAD b1f89e37
- 2026-10-26 — route Task 7: standard, dispatch HEAD 8c6f8a23

## 2026-10-26 — impl assessment (adaptive)

- **Decision**: Initial impl assessment passes adaptively: Tasks 1-7 done (commits 89bb70e4, cb1e444f, 484dc369+e3c8de4f, 7f8482ba+4c390d28, d13268ee, b1f89e37, df5d36af), plan.md fully ticked, `sync.js --check` ok after the wave-1 sync (8c6f8a23), `git diff --check` clean over 331c7c17..HEAD, every changed path within a Task's write scope or the orchestrator's sync/plan writes, no sprint stubs. Flagged choices resolved: Task 4 ensuring `wontfix` and skipping triage on a failing `gh auth status` accepted (consistent with AC-3's skip pattern and D5); Task 2's 53-char subject reworded at the pre-push squash (`git-strategy.md` "Commits"); Task 2's "runs only the missing steps" retry wording and `Refs #N` home in `git-strategy.md` accepted (match D6). Route-backs: Task 3 invalid Inputs JSON, Task 4 missing `duplicate` label (AC-4).
- **Rationale**: All plan work complete with objective checks green and no unresolved material alternative; 3 known pin failures in `tests/run.js` (scope step 4 wording, asd-tester Test plan grant, review-policy heading rename) are impl-test's to retarget.
- **Affected docs**: plan.md, friction-log.md
- 2026-10-26 — route impl-test entry 1: standard, dispatch HEAD 41464a07
- 2026-10-26 — impl-test: impacted set green (318/318, full suite via safety valve), 2/0 tests; 3 pins retargeted
