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
- 2026-09-25 — route Task 1: critical, dispatch HEAD 9cd9fe8
- 2026-09-25 — route Task 2: critical, dispatch HEAD 11a2a3d
- 2026-09-25 — route Task 3, Task 4, Task 5: critical, dispatch HEAD f4eb7ed
- 2026-09-25 — route Task 6: standard, dispatch HEAD f4eb7ed
- 2026-09-25 — route wave-3 reconciliation (orchestrator request-changes on Tasks 3/4/6 cross-citations): critical, dispatch HEAD fc19c89
- 2026-09-25 — route Task 7: standard, dispatch HEAD 421b41b

## 2026-09-25 — Retro backlog seeded (AC-4)

- **Decision**: The orchestrator wrote `.asd/project/retro-backlog.md` from `t_retro-backlog.md`, with 15 rows decided in 019: 10 `included`, 3 `deferred` (016#P-1, 017#P-1, 017#P-3), 2 `rejected` (016#P-3, 017#A-1). Guardrail text comes from `retroRows`. `retro-candidates --self-hosting` now returns exactly the 3 deferred rows (DoD check).
- **Rationale**: The backlog is orchestrator-owned, and no dispatched agent writes it (plan Overview). The seed applies the triage recorded in decisions-log.001.md.
- **Affected docs**: [retro-backlog.md](../../project/retro-backlog.md)

## 2026-09-25 — Wave flagged choices resolved

- **Decision**: Accepted every dev flagged choice from Tasks 1-7 and the reconciliation round (commit 421b41b):
  - Task 1 edited its own memory, and the `index.lock` retry was left out of the rule.
  - Task 2 kept `effort` "emitted on trust".
  - Task 5 fixed a backtick edge in the shared `tableCells`, which changes the `defect-stalemate` digest for cells with inner backticks; the effect is fail-safe (the question is re-asked).
  - Task 3 placed each home where the sibling cites point.
  - The reconciliation round classified External Review as a no-write-tool memory owner.
- **Rationale**: Each choice stays inside plan scope and the accepted ACs. Two gaps are left for impl-review and not fixed here: who flips the `test-plan.md` Status of a reviewer-owned memory `D-N` after a memory-fix, and the `t_retrospective.html` comment restating the row-id ordinal.
- **Affected docs**: [plan.md](plan.md)

## 2026-09-25 — Impl assessment approved (adaptive)

- **Decision**: Initial impl complete: Tasks 1-7 plus one reconciliation round, every plan checkbox ticked. Build (`sync.js --check`) is ok and lint (`git diff --check`) is clean. The round diff holds only authorised paths plus orchestrator bookkeeping and the backlog seed. No sprint stubs. AC coverage: AC-1..AC-5, AC-7 (Tasks 3, 4, 5); AC-6 (Task 4); AC-8 (Task 1); AC-9/10 (Task 2); AC-11..AC-16 (Tasks 3, 4, 6); AC-17 (Task 7; tests pending impl-test).
- **Rationale**: `user_gates: adaptive`; every flagged choice was resolved above and nothing material is open. The suite is at 225/229, and the four red tests are the wording pins the plan's Risks section assigns to impl-test.
- **Affected docs**: [plan.md](plan.md)
- 2026-09-25 — route impl-test entry 1: critical, dispatch HEAD f9d31d7
- 2026-09-26 — reconstruction: landed none; re-dispatched impl-test entry 1
- 2026-09-26 — impl-test: defects D-1, D-2 → impl test-fix (digest 3ec2fc12df1ccac02262dab533d64e635d766ebf5270c2b5e8c74556ec4b83c5)
- 2026-09-26 — route D-1: memory-fix dispatch to owner asd-reviewer-testing, then D-2 to owner asd-reviewer-documentation, dispatch HEAD ebae6b3
- 2026-09-26 — memory-fix applied: D-1 asd-reviewer-testing returned text, applied verbatim in 1353ea8
- 2026-09-26 — memory-fix applied: D-2 asd-reviewer-documentation returned text, applied verbatim in 1353ea8; second return (the first quoted the sweep's own patterns) applied in 3cf27e5
- 2026-09-26 — impl test-fix: defects D-1, D-2 resolved
- 2026-09-26 — route impl-test entry 2: critical, dispatch HEAD 4cb9331
- 2026-09-26 — impl-test: impacted set green (238/238), 0/0 tests (entry 2)

## 2026-09-26 — impl-review wave-1/iter-01: user answers and routing

- **Decision**: COR-1/DOC-1 → option (b). On Claude a reviewer holds `Write` for its own memory via `memory: project`, and canon will say so truthfully: policy, not the host, keeps it to its own memory directory. A finding in its memory is fixed by that owner in a fresh memory-fix dispatch, and the orchestrator commits. `disallowedTools` are unchanged. External FAIL #1 (multi-owner memory-fix order) and #2 (deferred `acts_on` source) are accepted for fix. Verdicts: correctness/efficiency/testing/documentation CONCERNS, external FAIL. Routed to impl review-fix (`review_fixes_pending = wave-1/iter-01`).
- **Rationale**: The reviewer dispatches themselves showed the host serving `Write`, so the AC-14 claim was false. Keeping memory writes preserves reviewer learning, which is the purpose of `memory: project`.
- **Affected docs**: [correctness.md](reviews/impl/wave-1/iter-01/correctness.md), [documentation.md](reviews/impl/wave-1/iter-01/documentation.md), [external.md](reviews/impl/wave-1/iter-01/external.md)
- 2026-09-26 — route review-fix wave-1/iter-01 dev chain (COR-1..7, DOC-1..5 canon parts, EFF-1, external #1/#2): critical, dispatch HEAD 5851906
- 2026-09-26 — route review-fix wave-1/iter-01 tester chain (testing.md TST-1-1, TST-1-2): critical, dispatch HEAD 1fc1abe
- 2026-09-26 — route review-fix wave-1/iter-01 memory-fix: asd-reviewer-documentation (COR-1/DOC-1/DOC-2 memory sites), then asd-reviewer-testing (COR-1/DOC-1), dispatch HEAD 694c28f
- 2026-09-26 — memory-fix applied: asd-reviewer-documentation edited own memory (5c48db2), asd-reviewer-testing edited own memory (b06232a); orchestrator committed
- 2026-09-26 — impl fix for wave-1/iter-01: findings resolved (dev chain 0f9f77c..1fc1abe: COR-1..7, DOC-1..5, EFF-1, external #1/#2; tester 694c28f: TST-1-1, TST-1-2 + pins; memory-fix 5c48db2, b06232a); flagged choices accepted — the `pendingMemoryFix` sweep exemption must be removed at impl-test entry 3, and the COR-4 removal carry-over row survives rotation only if entry 3's tester reads the rotated segment
- 2026-09-26 — route impl-test entry 3: critical, dispatch HEAD b06232a
- 2026-09-26 — impl-test: impacted set green (238/238), 0/0 tests, assertions extended in 4 tests (entry 3)
