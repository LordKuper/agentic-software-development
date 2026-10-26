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
- 2026-10-26 — route Task 12: standard, dispatch HEAD b8a75426
- 2026-10-26 — impl wave 5: Task 12 COMPLETED (55d162dc), full suite 304/304; flagged accepted: reviewer-memory tests sweep live reviewers, dev-critical CRLF pin dropped with its file, transient fail-first mutations restored
- 2026-10-26 — route wave-5 follow-up: standard, dispatch HEAD 55d162dc; risk artifact: leftover role names via grep
- 2026-10-26 — wave-5 follow-up COMPLETED (e8212cb6): leftover roster mentions fixed in artifact-layout.md, git-strategy.md, providers.md; sync --apply AGENTS.md refreshed manifest ledgers

## 2026-10-26 — impl assessment approved (adaptive)

- **Decision**: Initial impl accepted: Tasks 1-12 plus wave-3 and wave-5 follow-ups COMPLETED, every plan checkbox ticked, AC-1..AC-20 traced to Tasks, build (`sync.js --check`: 60 current) and lint (`git diff --check main..HEAD`) clean, diff within authorised paths, no sprint stubs; NEXT impl-test.
- **Rationale**: Every flagged choice resolved or routed to a follow-up dispatch; no unresolved material alternative; the dev-run full suite 304/304 is self-verification only, impl-test owns the gate.
- **Affected docs**: plan.md
- 2026-10-26 — route impl-test entry 1: standard, dispatch HEAD 5b98726f
- 2026-10-26 — impl-test entry 1 step 7a: asd-reviewer-combined memory-fix for 3 leftover-term hits (enumerated-reach, in-body-comment-sweep, dispatch-payload), committed 8359218a
- 2026-10-26 — impl-test: defects D-1 → impl test-fix (digest bea4fd1ed8c4eb4af0b829c113a782311fa5c07a79dbeeaf90b2fa88caf37dbd); orchestrator re-run after step 7a 312/313, only D-1 red
- 2026-10-26 — route test-fix D-1: standard, dispatch HEAD 402db21f; risk change: advisor consult sites in impl-review
- 2026-10-26 — impl test-fix: defects D-1 resolved (043e4301, row 111c8d13); flagged accepted: dev refreshed the one upstream_hashes entry its edit staled (orchestrator sync output, same as sync --apply AGENTS.md); gate: sync --check 60 current, diff --check clean, paths authorised
- 2026-10-26 — route impl-test entry 2: standard, dispatch HEAD 111c8d13
- 2026-10-26 — impl-test: impacted set green (313/313, full suite via safety valve), entry 2 0 added/0 removed tests; no Manual verification rows
- 2026-10-26 — impl-review division: 3 waves (lines 4342, files 124, bytes 900604): wave 1 roster and runtime (agents, runtime.js, sync.js, migration, hook, manifest, deleted memory; 73 files), wave 2 rules and templates (23), wave 3 workflows, skills, README/AGENTS, tests (28)
- 2026-10-26 — impl-review wave-1/iter-01: combined CONCERNS (F-1..F-3 medium, F-4 low), external APPROVE (latched) → impl review-fix (wave-1/iter-01); F-3 reverses the wave-1 flagged acceptance "test-plan paths count toward combined's documentation scope" (decisions-log.003 impl wave 1 line): the docs predicate must judge the scope list only
- 2026-10-26 — route review-fix wave-1/iter-01: standard, dispatch HEAD ac4d1f1a; risk change: migration
- 2026-10-26 — impl fix for wave-1/iter-01: findings resolved (F-1, F-2 f396b4dd; F-3 2d222460; F-4 8fe2f48e); flagged accepted: only the docs predicate reads the scope list, templated/html/ui/perf still see test-plan paths (reverses the wave-1 docs-scope acceptance per F-3); sync --apply regenerated efficiency views
- 2026-10-26 — route impl-test entry 3: standard, dispatch HEAD 8fe2f48e
- 2026-10-26 — impl-test: impacted set green (313/313, full suite), entry 3 2 asserts added/adapted/0 removed
- 2026-10-26 — impl-review wave-1/iter-02: combined CONCERNS (F-1 medium, test-only: AC-18 fixture lost the wave-K directory case), external latched APPROVE → impl review-fix (wave-1/iter-02), test-file chain to asd-tester
- 2026-10-26 — route review-fix wave-1/iter-02: standard, dispatch HEAD acf62fd5
