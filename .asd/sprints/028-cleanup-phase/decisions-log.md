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

- 2026-10-26 — route Task 1: critical, dispatch HEAD 67ee7529

- 2026-10-26 — impl wave 1: Task 1 COMPLETED (96e2eb1e, 5fa6600f, be729735); flagged accepted: test-plan paths count toward combined's documentation scope, advisor Signals keep ABORT only, failed objective check routes standard (no critical tier), quality's test-plan.md-missing ABORT, manual-verification row rule homed in quality; sync --apply regenerated 16 views and removed 18 orphan views; ownerless memory of asd-architect, asd-dev-critical, asd-reviewer-correctness/-documentation/-testing, asd-tester-critical, asd-pm deleted (user decision)
- 2026-10-26 — route Task 2, Task 3, Task 4, Task 5, Task 6, Task 7: standard, dispatch HEAD d8de20a1
- 2026-10-26 — impl wave 2: Tasks 2-7 COMPLETED (1846ac03, 4c4692bb, 88f44005, 84738461, d2fc356f, 731c4960); flagged accepted: t_review-report sample row kept with a cell-shape comment (test pins it), t_audit/t_review wording, design-system.md §12 cites "Optional documents", orchestrator rows carry the creators' unconditional refs, risky classes route standard; plan Task 8 gains the session-start.js collapse-test subtask D14 names but no Task held; sync --apply AGENTS.md refreshed manifest ledgers
- 2026-10-26 — route Task 8, Task 9, Task 10: standard, dispatch HEAD 9499b39a
- 2026-10-26 — impl wave 3: Tasks 8-10 COMPLETED (da7e799a, 16902e01, 9d4e1c0e); flagged accepted: cleanup skips verification when nothing was removed (`verified n/a: no removals`), re-entry restores tracked paths only, c4-full keeps no lock-in (checkpoints.md canonical over D12), asd-sprint declares asd-advisor, standalone skills' tools widened for inline authoring; commit da7e799a/16902e01 subject over 50 chars → reword at pre-push squash; defects routed to a wave-4 follow-up dispatch: providers.md still treats impl-test/test-fix ids as routed (Task 4 residue), session-start.js collapse test ignores the absent-design_system → ux_spec fallback (Task 8); sync --apply regenerated 26 views
- 2026-10-26 — route Task 11, wave-3 follow-up: standard, dispatch HEAD 8fac81ee; risk Task 11 artifact: mirror counts and tables via node tests/run.js, wave-3 follow-up change: routing prose and hook fallback
- 2026-10-26 — impl wave 4: Task 11 COMPLETED (d776d047), wave-3 follow-up COMPLETED (d2db4eb4: providers.md tester ids unrouted, hook design_system → ux_spec fallback); sync --apply regenerated both hook views
