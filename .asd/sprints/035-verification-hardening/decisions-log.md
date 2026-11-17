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
- 2026-11-17 — route Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9, Task 10, Task 11: standard, dispatch HEAD fb9fecd7fa0aeb882ff2401ac2b6c7d1060784dc
- 2026-11-17 — impl wave 1 flagged accepted: Task 4 (SKILL.md Bash grant suffices; latch-refresh before iteration head write; base-ref on External context only; issue repo = release-manifest repo under self_hosting, else origin owner/repo), Task 5 (smoke via asd-tester-runner at step 10; Manual-verification 'smoke check' renamed 'manual-verification check', artifact-layout mirror added to Task 9).
- 2026-11-17 — impl wave 1 done: Tasks 1–11 COMPLETED; flagged accepted: Task 1 (latch-refresh skips .asd/sprints/**; stricter comment-line test; markers on every reviewer, workflow filters), Task 3 (resolved kind written `issue` token, `issue #<N>` in prose; valve wording no longer 'mandatory'). Views synced, full suite 375/375, D13 4/4.
- 2026-11-17 — route Task 12: standard, dispatch HEAD eb10b8bc8d106a6d07a40f7d3d34885953e183ba; risk artifact: README mirror via node tests/run.js
- 2026-11-17 — impl wave 2 done: Task 12 COMPLETED (README mirrors), suite 375/375.
- 2026-11-17 — impl assessment approved (adaptive): all plan.md checkboxes ticked; AC map — AC-2 T1/2/4/7/8/9, AC-3 T5/8/10, AC-4 T1/7, AC-5 T1/2/3/4, AC-7 T5, AC-8 T12 + sync, AC-9 T1, AC-10 T3, AC-11 orchestrator fb9fecd7, AC-12 T11, AC-13 T8/9 + git-2.56.md, AC-14 T3/5/6/8/10, AC-15 T1/3/4, AC-16 T1/2/4; build and lint clean; round diff within authorised paths; flagged choices all accepted above, none reverses an earlier disposition; no sprint stubs.
- 2026-11-17 — route asd-tester impl-test#1: standard, dispatch HEAD d39397f5d35e4b9741ebcebc729f54f3a9b6097b
- 2026-11-17 — impl-test: impacted set green (390/390, full via safety valve), 15/0 tests; smoke absent, skipped
