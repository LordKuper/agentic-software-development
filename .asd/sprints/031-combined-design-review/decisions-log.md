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

- 2026-11-02 — route Task 1: standard, dispatch HEAD bccf75ed
- 2026-11-02 — route Task 2: standard, dispatch HEAD bccf75ed
- 2026-11-02 — route Task 3: standard, dispatch HEAD bccf75ed
- 2026-11-02 — route Task 4: standard, dispatch HEAD bccf75ed
- 2026-11-02 — route Task 5: standard, dispatch HEAD bccf75ed

## 2026-11-02 — AC-10 header check made language-neutral

- **Decision**: `reviewFindings` checks the findings header by column count (five) and `#` id column, not by English cell text; efficiency's return rule moves the keep-as-is/simplify/escalate category into the Description cell. Plan Task 5's AC-10 line is reworded; Task 5 and the efficiency file are routed back to a dev at the initial impl assessment.
- **Rationale**: `language-policy.md` Matrix puts reviews in `language.docs`, so a translated header must still persist; the exact-English check would reject every non-English consumer's review. Efficiency's "category column" instruction contradicts the five-column template and is the extra column issue #78 saw.
- **Affected docs**: `.asd/runtime.js`, `.asd/agents/asd-reviewer-efficiency.md`, `plan.md` Task 5

## 2026-11-02 — impl assessment approved (adaptive)

- **Decision**: Wave 1 accepted: Tasks 1-5 committed (302d2fa1, 33e47706, 2750e5bc, 40ee080e, cea4b4a9, rework 8b8acd0e), views synced (3d422d18, e87213fb); AC-7 landed at bccf75ed.
- **Rationale**: Every subtask ticked, every flagged note resolved (beyond-brief edits stay inside AC-3/AC-6 and the plan homes), no sprint stubs, build and lint clean, round diff inside the dispatched write scopes plus synced views and sprint files.
- **Affected docs**: `plan.md`
- 2026-11-02 — route impl-test entry 1: standard, dispatch HEAD 9f4e4e4c
- 2026-11-02 — impl-test: impacted set green (330/330, full suite via safety valve), 5/0 tests
