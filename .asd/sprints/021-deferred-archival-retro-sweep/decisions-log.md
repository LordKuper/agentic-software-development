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
- 2026-09-29 — route Task 1, Task 2, Task 3, Task 4, Task 5, Task 7, Task 8, Task 9: critical, dispatch HEAD 26b42d8
- 2026-09-29 — route Task 6: standard, dispatch HEAD 26b42d8

## 2026-09-29 — Wave 1 landed; flagged choices resolved; Task 10 scope widened

- **Decision**: Tasks 1–9 are complete. Commits: 4451a1f; d98f431 and e44e64c; a38b020 and fdfeb8a; 716db14; 8624b95 and 1143591; 71781e3; b9cd9af; 9dc3b19 and d75187d; 5b0ecf1 and 99365b3. The orchestrator sync is 056e1fa.
  - Flagged choices were accepted as returned, except where a follow-up closed a real gap:
    - the tests-only stub now rides a `Stub <ref> → impl-test` line in `plan.md` that impl-test reads (Task 8 and Task 9);
    - the sprint-closure approval has an explicit Context-hygiene exception (Task 2);
    - the manifest digest prose now excludes the `ledger` skeleton, and the Monitor deadline exceeds the interval (Task 3);
    - impl-review passes `--base/--head` to `surface-check` (Task 9);
    - `agent-liveness` honours `CLAUDE_CONFIG_DIR` (Task 5).
  - Task 10 gains two restating sites that no wave-1 Task owned: the root `AGENTS.md` tail, and the `t_decisions-log.md` stall line form.
  - The orchestrator edited `.asd/project/custom-coding-rules.md` (5097637), removing the per-task `--apply` rule, and deleted two ownerless `asd-pm` notes (f127267).
  - The orchestrator ticked the plan checkboxes because parallel devs cannot share `plan.md` (F-3).
- **Rationale**: Step 10 requires every non-`none` flagged choice to be resolved or routed back before the assessment. The follow-ups fixed reachability and SSoT gaps. The remaining choices are bounded, in-scope calls.
- **Affected docs**: [plan.md](plan.md), [friction-log.md](friction-log.md)
- 2026-09-29 — route Task 10: standard, dispatch HEAD 95aa33e

## 2026-09-29 — Impl assessment approved (adaptive)

- **Decision**: Initial impl is complete. All 10 Tasks are ticked; AC-1…AC-5 and AC-7…AC-13 are covered, and AC-6 was done at scope. Build (`sync.js --check`) and lint are clean. The authorised-paths gate over `d5d84b3..HEAD` is clean: canon, the orchestrator's sync outputs, owner memory fixes, the ownerless asd-pm deletions and `custom-coding-rules.md`. No stubs were introduced. Every flagged choice is resolved (entry above), and the extra ones (the ledger refresh for rules-only waves, the CRLF memory note) were closed by follow-ups 051e86e and 95aa33e. The orchestrator ran both syncs (056e1fa, 7d4fae0).
- **Rationale**: This is a routine adaptive pass under `checkpoints.md`: exact authority (sprint.md, plan.md), the checks pass, and no material alternative is left open. The known test breaks (prose pins, sandbox, hook token, retry-after, manual-verification payload) go to impl-test, not back to impl.
- **Affected docs**: [plan.md](plan.md)
- 2026-09-29 — route impl-test entry 1: critical, dispatch HEAD a67a295
- 2026-09-29 — impl-test: defects D-1, D-2, D-3, D-4 → impl test-fix (digest 9b55eeb7a5f954ec153d1cb8ff2b7f08b37e6535c980ae212a632a84333795dd)
- 2026-09-29 — route D-1, D-2, D-3: standard, dispatch HEAD 937fbc6
- 2026-09-29 — impl test-fix: defects D-1, D-2, D-3, D-4 resolved (4d3a7d3, b48906e); orchestrator sync: ledgers already current, no view change
- 2026-09-29 — route impl-test entry 2: critical, dispatch HEAD 1e1d34e
- 2026-09-29 — impl-test: impacted set green (253/253, full file; safety valve not triggered), 1/0 tests; no manual-verification rows
- 2026-09-29 — impl-review division: 1 wave (1193 lines, threshold 3000), surface 69/100 (`surface-check --base/--head`)

## 2026-09-29 — impl-review wave-1/iter-01: CONCERNS → review-fix

- **Decision**: combined returned CONCERNS with C-1 (medium: open mode must commit and push `state.json.pr` so merged-unclosed detection sees `pr.number` on base), C-2/C-3/C-4 (low). External returned CONCERNS with #1 (medium: `isGeneratedView`/consumer pathspec exclude `.claude/settings.json`/`.codex/hooks.json`, which are JSON-merge files that can hold user content), #2 and #3 (low). The findings go to impl review-fix. External #3 and combined C-2 are one README claim and are deduplicated in review-fix (`review-policy.md` "Autofix vs escalation" "Deduplication"). No low-severity test-only branch applies.
- **Rationale**: The iteration's DoD is not met. First live run of D6: combined wrote its return file itself and `persist-review --in` validated its ledger from that file, with no orchestrator re-typing.
- **Affected docs**: [reviews/impl/wave-1/iter-01/](reviews/impl/wave-1/iter-01/)
- 2026-09-29 — route combined.md C-1, C-2, C-3, C-4, external.md 1, 2, 3: critical, dispatch HEAD 50e4013
- 2026-09-29 — impl fix for wave-1/iter-01: findings resolved (combined C-1 f9df1c3; external 1 4d6286a; external 2 + combined C-4 9e88920; combined C-2 + external 3 deduplicated 73745d4; combined C-3 fcb9d2c). Flagged choices were accepted: the artifact-layout folder-map relabel came from the consumer search, the impl-test pathspec holds no concrete list, and the shared commit covers one function. Broken test L6711 and the missing `.ASD/` case go to impl-test re-entry.
- 2026-09-29 — route impl-test entry 3: critical, dispatch HEAD c393f2b
- 2026-09-29 — impl-test: impacted set green (253/253), 0/0 tests (3 adjusted); no manual-verification rows
- 2026-09-29 — impl-review wave-1/iter-02: combined APPROVE (latched at 2), external CONCERNS (1 medium: merge mode does not verify the remote branch carries the committed `state.json.pr`) → impl review-fix
- 2026-09-29 — route external.md 1: critical, dispatch HEAD 0dbfa45
- 2026-09-29 — impl fix for wave-1/iter-02: findings resolved (external 1 b0f0daf). Flagged choices were accepted: merge-mode step 2 "write nothing" is unchanged because step 1 only publishes open mode's existing write; an already-merged PR without `pr.number` on base stays a known residual (no base write is possible).
- 2026-09-29 — route impl-test entry 4: critical, dispatch HEAD 7a9b496
- 2026-09-29 — impl-test: impacted set green (253/253), 0/0 tests (1 extended); no manual-verification rows
- 2026-09-29 — route external.md 1: critical, dispatch HEAD 969e362
- 2026-09-29 — external interrupted attempt 1 in wave-1/iter-03 (persist-review rejected: severity cell `high (codex: major)` not a bare severity)
