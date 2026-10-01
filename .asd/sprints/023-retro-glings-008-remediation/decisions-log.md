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
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-10-01 — Sprint 023 opened: Glings 008 upstream rows + retro intake

- **Decision**: Scope: process the upstream (`asd`) rows of Glings sprint 008 (A-1, A-4, A-6, A-8, P-2, P-3) together with this project's retro intake (022#P-1..P-3, deferred 021#A-1 and 021#P-1). Workflow: `lite`, a user decision. Before seeding, the closure write for 022 ran (beb0fc2; PR 58 merged at f106867, release v13.5.0 present: tag on origin, host release published).
- **Rationale**: User request in chat; Glings 008 rows that are consumer-only or already-covered (A-2, A-3, A-5, A-7, P-1) are out of scope.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-10-01 — Retro-derived criteria verified at HEAD beb0fc2

- **Decision**: All nine criteria are unresolved at HEAD. AC-1: `review-waves` divides on lines only (`WAVE_THRESHOLD_LINES`, `sprint-lifecycle.md` "Review iteration counters"); the payload carries a `Turn budget:` line, no turn plan, and `asd-reviewer-combined` keeps `maxTurns: 50`. AC-2: `asd-sprint` Step 1 detects from the local tree plus `gh`; its fetch is only the release-retry check. AC-3: `external-review.md` lines 13/21-22 still render the manifest inline in a heredoc/here-string. AC-4: `artifact-layout.md` "Agent memory" has no content rule and `runtime.js` has no memory check; the Glings "method-only" rule is project-local (not in canon). AC-5: no test-only Task shape in "Plan file format" or `asd-phase-impl.md`. AC-6: `code-style.md` §17 and its fail-first line state no run bound. AC-7: `providers.md` "Agent tier matrix" and the README table are hand-mirrored. AC-8: `runtime.js retroCandidates` drops `asd` rows unless `--self-hosting`. AC-9: `providers.md` routing keeps the `priorTier` clamp for every re-entry. Glings AC-1…AC-6 text taken from its 008 retrospective (read at `D:\Projects\Glings\.asd\sprints\008-debt-stubs-retro-cleanup\retrospective.html`, 2026-10-01). Host behaviour in AC-3 (the wrapped CLI reads repo paths itself) is evidenced by `external-review.md` line 23 and by every prior iteration's `external.md`, which read the `files[]` and the `.diff` by path.
- **Rationale**: `sprint-lifecycle.md` "Orchestration and adaptive gates" requires re-verification of retro-derived criteria at scope.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-10-01 — Scope gate accepted; retro intake dispositions

- **Decision**: The user accepted sprint.md AC-1…AC-9 as written and declined the offered split of AC-7 (tier-table generation) into its own sprint. Retro intake, 5 candidates, all included: 022#P-1 → AC-1 (merged with Glings 008 A-4 and P-3), 022#P-2 → AC-6, 022#P-3 → AC-7, 021#A-1 → AC-8, 021#P-1 → AC-9. Glings 008 A-1, A-6, A-8 and P-2 became AC-2, AC-4, AC-3 and AC-5. Criterion cost of each included row: 0 iterations charged, 0 fix rounds charged. Documents frozen: audit true; prd, ux_spec, adr, c4 false (config).
- **Rationale**: Hard scope and retro-intake gates (`checkpoints.md` "Gate policy"), decided by the user.
- **Affected docs**: [sprint.md](sprint.md), [.asd/project/retro-backlog.md](../../project/retro-backlog.md)

## 2026-10-01 — Audit contradictions settled; AC-2, AC-4 and AC-7 amended

- **Decision**: The user settled three audit contradictions. AC-2 narrowed to "rules, workflows and phase skills read after Step 0", with the skill's own text and the session-start files stated as the pre-fetch copy and an unreachable remote warning and continuing. AC-4 keeps its runtime check at the orchestrator's memory commit; the false "no hook" premise is dropped and a dev's or tester's self-commit is not gated by it. AC-7 narrowed: remove `providers.md` "Agent tier matrix" (home becomes agent frontmatter plus manifest `model_families`), the README tier table stays as the one mirror, no generator. Audit accepted by the orchestrator (adaptive): every section present, all nine criteria deliverable.
- **Rationale**: Hard audit-contradiction and scope-change gates (`checkpoints.md` "Gate policy"), decided by the user; the AC-7 amendment is pre-division, so no `floor_base`.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md)

## 2026-10-01 — plan.md accepted (adaptive)

- **Decision**: `plan.md` accepted: 6 Tasks in 3 waves (wave 1 Tasks 1-3: runtime.js; sprint-lifecycle.md + providers.md; git-strategy/artifact-layout/external-review/code-style. Wave 2 Tasks 4-5: workflows and skills; agents and templates. Wave 3 Task 6: README). Designs D1-D9 follow the audit's recommendations as settled with the user. Change surface 21 files (`surface-check`, cap 100). `.asd/project/stubs.md` holds no open stub. Orchestrator-only lines: per-wave `sync.js --apply`, a memory-fix dispatch to the `asd-external-review` owner after wave 2, `tests/run.js` repoints owned by impl-test.
- **Rationale**: Adaptive plan gate (`checkpoints.md`): no new authority, preference or material tradeoff beyond the user's audit decisions; evidence is the audit-to-plan site mapping and the surface measurement.
- **Affected docs**: [plan.md](plan.md)

- 2026-10-01 — route Task 1, Task 2, Task 3: critical, dispatch HEAD 86e7706
