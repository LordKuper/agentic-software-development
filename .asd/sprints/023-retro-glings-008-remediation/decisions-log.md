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

- 2026-10-01 — route Task 4, Task 5: critical, dispatch HEAD 4148bf9

- 2026-10-01 — route Task 6: standard, dispatch HEAD 3a3d147

## 2026-10-01 — impl assessment (initial mode) accepted adaptively

- **Decision**: Tasks 1-6 done in 3 waves (1: runtime.js, rule docs, git/layout/external/style; 2: workflows and skills, agents and templates; 3: README plus one phrase in sprint-lifecycle.md), a memory-fix by the `asd-external-review` owner after wave 2's sync (`memory-check` clean), per-wave `sync.js --apply`; build, lint and sync clean at 1f3bb74; every round path authorised. Flagged choices dispositions, no earlier decision reversed (searched the log): Task 1's `thresholds` replacing `threshold` in `waves.json` (readers use `waves` and `head` only; Task 2 text matches), case-folded `wave`/`iter`/`iteration` patterns, `_` as a word break in file names, extra git flags with an exit-2 guard, `line: null` for name hits — accepted; Task 2's `Test-only` placement, D9 "none declared → standard" carried literally, turn plan scoped to impl-review — accepted; its open items closed (Task 5 orders `Test-only` after `Material risk` and before `Reachability` in `t_plan.md`; Task 6 reads the "Impl phase" wave rule as covering the Task's agent); Task 3's three citations-only choices, Task 4's step 6 "dev reads as that agent", dropped ", not restated here" at scope step 2a, impl-review steps 8-9 reusing impl-test step 1a for routing, Task 5's `; runs: <n>` in both proof forms — accepted. `tests/run.js` repoints and new asserts are left to impl-test (audit "Risks").
- **Rationale**: Adaptive impl assessment gate (`checkpoints.md`): all dev signals COMPLETED, no unresolved material alternative, evidence recorded.
- **Affected docs**: [plan.md](plan.md)

- 2026-10-01 — route impl-test entry 1: critical, dispatch HEAD e585822

## 2026-10-01 — Scope amendment: AC-10 removes the change-surface cap

- **Decision**: The user asked in chat to remove the change-surface cap from ASD entirely: it never led to a real decision, is always overridden and is a gate with no value. AC-10 is added to sprint.md. Tasks 7 (`runtime.js`) and 8 (rules, workflows, template, README) form a new last wave 4 in plan.md; D10 fixes the boundary: the cap mechanism goes, the review/test "change surface" diff concept and wave division stay, `WAVE_THRESHOLD_FILES` becomes the literal 34 because it was derived from the cap. Amendment accepted before impl-review's division point, so no `floor_base`. The audit boolean stays true. The running impl-test entry 1 is not interrupted; its pins on the cap tests are retired in the next impl-test entry, after wave 4.
- **Rationale**: Hard `new or changed scope` gate (`checkpoints.md` "Gate policy"), decided by the user in chat. In this repo's archived sprints no `change-surface-cap-override` record exists; the user's stated experience (overrides in consumer projects) is taken as the evidence of purpose.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)

- 2026-10-01 — impl-test: impacted set green (273/273), 9 added/0 removed tests (entry 1, HEAD analysed 24141f5); no defects, no manual-verification row
- 2026-10-01 — impl-test entry 1 flagged choices accepted (Codex-host manifest read stays a post-merge orchestrator check; extra git, ledger-turn and standard-tier pins; sandbox pin literal against frontmatter); the wave-4 scope amendment AC-10 re-enters impl before impl-review (new Tasks 7 and 8 sit in a wave not yet dispatched)

- 2026-10-01 — route Task 7, Task 8: critical, dispatch HEAD ef99e3f

## 2026-10-02 — impl assessment (wave 4, AC-10) accepted adaptively

- **Decision**: Tasks 7 and 8 done (runtime.js: `SURFACE_CAP_FILES`, `surface-check`, `surfaceCheck` and the helpers only they used removed, `WAVE_THRESHOLD_FILES` the literal 34; rule docs, workflows, template and README: cap, declaration, override gate and amendment step removed, the review/test "change surface" diff concept untouched). Build, lint and sync clean at 3857b0d, no flagged choices, every round path authorised, plan fully ticked. Five `tests/run.js` pins on the removed mechanism are red by design and go to impl-test entry 2 with the citations Task 8 listed.
- **Rationale**: Adaptive impl assessment gate (`checkpoints.md`): all dev signals COMPLETED, nothing unresolved.
- **Affected docs**: [plan.md](plan.md)

- 2026-10-01 — route impl-test entry 2: critical, dispatch HEAD 8da5341

- 2026-10-02 — impl-test: defects D-1 → impl test-fix (digest 020af157636f61ae66eb6ba03188280ba9d0c4c9b1f9a32f9ed5f7b83b76d42c)

- 2026-10-02 — memory-fix: asd-reviewer-documentation owner rewrote feedback_no-shell-doc-review-method.md (D-1: removed surface-cap examples, legacy ordinals made method-only), orchestrator committed 887bbb1 after memory-check clean; D-1 fixed
- 2026-10-02 — impl fix for impl-test defects: impl test-fix: defects D-1 resolved

- 2026-10-01 — route impl-test entry 3: standard, dispatch HEAD c0d2125

- 2026-10-02 — impl-test: impacted set green (272/272), 0 added/0 removed tests (entry 3, HEAD analysed 53e7ffe); no defects, no manual-verification row (the Codex-host manifest read stays a post-merge orchestrator check)

## 2026-10-02 — impl-review division: 2 waves

- **Decision**: First impl-review entry measured 1084 lines, 30 files, 315074 bytes against thresholds 3000 lines, 34 files, 300000 bytes (the new AC-1 axes: the byte axis fires) → n = 2. Wave 1 "engine and rules" (16 files): `.asd/runtime.js`, `tests/run.js`, `.asd/release-manifest.json`, the seven rule docs and the six agent-memory files. Wave 2 "workflows, skills, agents, templates, README" (14 files).
- **Rationale**: `sprint-lifecycle.md` "Review iteration counters" Division; waves grouped by cohesion, neither above `LARGE_WAVE_FILES`.
- **Affected docs**: [reviews/impl/waves.json](reviews/impl/waves.json)

- 2026-10-02 — combined interrupted attempt 1 in wave-1/iter-01 (50-turn cap; partial output, no verdict token)

## 2026-10-02 — impl-review wave-1/iter-01 verdicts; scope amendment AC-11

- **Decision**: wave-1/iter-01: combined CONCERNS (F1 medium, F2-F4 low; one interrupted attempt, turn cap) and external CONCERNS (F1 medium, F2 low). The reviewer's question on F1 was put to the user, who chose to lower the two thresholds and raise `maxTurns` of every agent below 100 to 100. That is added as AC-11 with Tasks 9 and 10 in a new last wave 5 (D11); combined F1 is recorded resolved by that decision. The amendment is accepted after the division point, so `floor_base=wave-1/1` and wave 1's `latched` is cleared (it held nothing). The remaining findings (combined F2-F4, external F1-F2) route to impl review-fix mode.
- **Rationale**: Hard `new or changed scope` gate (`checkpoints.md` "Gate policy") and the reviewer-question protocol (`review-policy.md` "Gate Verdict Format"), decided by the user; amended AC-11 counts from iteration 1 for its own floor.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
