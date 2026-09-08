---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-08 — scope: retrospective rows verified against HEAD before acceptance

- **Decision**: All sixteen rows of the sprint 008 retrospective's two tables were re-checked against HEAD `f1b15bf` before being written into `sprint.md`. Fifteen carried as `AC-1`..`AC-15`; the `F-6` remaining row closed as already satisfied (`providers.md:47` states host-honoured vs emitted-on-trust frontmatter fields); the `S4` agent-memory row narrowed to its undelivered half and carried as `AC-13`.
- **Rationale**: Sprint 008's own `F-2` — a retrospective's rows are written against the HEAD of the sprint that produced them and carry no verification that they are still unresolved when a later sprint picks them up. `AC-3` makes this verification a rule; this sprint performs it by hand ahead of that rule existing.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-08 — scope: audit enabled

- **Decision**: `documents.audit` (config `auto`) resolves to enabled for this sprint; frozen as `true` in `state.json`.
- **Rationale**: Scope changes workflow contracts, review routing and gate policy across nine rule and workflow files — not a complete mechanical scope with no behaviour, contract or gate impact.
- **Affected docs**: [state.json](state.json)

## 2026-09-08 — scope accepted

- **Decision**: The user accepted sprint 009's scope as written — `AC-1`..`AC-18`, including the `F-6` remainder closed at scope and the `S4` row narrowed to `AC-13`.
- **Rationale**: Initial scope is a hard gate in both policies; it establishes the authority the adaptive policy reuses for the rest of the sprint.
- **Affected docs**: [sprint.md](sprint.md), [state.json](state.json)

## 2026-09-08 — audit gate: four scope-affecting decisions

- **Decision**: (1) `AC-7` declares `* text=auto eol=lf` in a root `.gitattributes` — the working tree normalizes to LF on next checkout; no index blob changes. (2) `AC-7` covers this repository only: no template, no `/asd-init` seeding, no `managed_paths` entry. (3) `AC-9` is closed with no deliverable — no cross-sprint availability history is stored; each sprint probes availability itself. (4) `AC-15` is delivered as a surfacing obligation on existing gates with no new state, counting off `reviews/<phase>/iter-NN/` and `decisions-log.md`.
- **Rationale**: Decisions (1) and (2) settle the AC-6/AC-7 contradiction the audit found — `eol=lf` falsifies "canon is CRLF on disk", so `AC-6` is rewritten platform-neutrally in the same pass. (3) removes an AC the audit showed undeliverable: every candidate storage surface either ships to consumers via `managed_paths`, is frozen legacy, or would be a new document type `t_decisions-log.md` forbids. (4) keeps the least-specified AC honest — gate bookkeeping is keyed by gate, not by `AC-N`, so a counter would be new state with no existing key.
- **Affected docs**: [sprint.md](sprint.md) (`AC-6`, `AC-7`, `AC-9`, `AC-15`, Out of scope), [audit.md](audit.md)

## 2026-09-08 — audit gate: AC-3 verification is recorded in decisions-log only

- **Decision**: The HEAD-verification record `AC-3` mandates lives in `decisions-log.md` alone. `t_sprint.md` gains no "Staleness verification" section; this sprint's own such block in `sprint.md` stays as narrative context, not as a template-mandated shape.
- **Rationale**: Advanced adaptively under `user_gates: adaptive` — a bounded placement choice with no material alternative: mandating both channels is the duplication `sprint-lifecycle.md` exists to prevent, and `decisions-log.md` already holds the entry with no template change.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md)

## 2026-09-08 — audit accepted

- **Decision**: `audit.md` accepted; sprint advances to design.
- **Rationale**: Adaptive policy — audit acceptance is a routine gate; the material questions it surfaced were escalated and answered above, leaving no unresolved alternative. Evidence: measured `git ls-files --eol` over 583 files, measured `git diff --check` staged/unstaged behaviour, file:line citations for every gap.
- **Affected docs**: [audit.md](audit.md)

- 2026-09-08 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-08 — plan.md accepted

- **Decision**: `plan.md` accepted with eleven tasks cut by file rather than by AC. `AC-9` gets no task (closed at the audit gate); `AC-17` gets no task (tests are selected in `impl-test`); the `tests/run.js:3045` reconciliation Task 5 forces is recorded as a sprint-specific DoD addition rather than as a plan task.
- **Rationale**: Advanced adaptively — the plan adds no scope, and its only judgment call is task granularity, which the audit's collision finding settles: four ACs land in `review-policy.md` and three more collide pairwise, so file-grouped sequential tasks are the shape that avoids the very cost `AC-10` exists to remove.
- **Affected docs**: [plan.md](plan.md), [audit.md](audit.md)

## 2026-09-08 — impl assessment approved

- **Decision**: All eleven plan tasks COMPLETED and approved by the user; sprint advances to impl-test. No stubs introduced. Build (`node .asd/sync.js --check`) and lint (`git diff --cached --check`) clean; `node tests/run.js` 159/160, the single red being `tests/run.js:3031-3046`, invalidated by Task 5 by design and reconciled in impl-test.
- **Rationale**: Every AC that carried a deliverable landed in the single home the audit named, with citations rather than restatements elsewhere. Task 11 disproved the reported 94-entry ledger mismatch by measurement — `sync.js` hashes normalized text, so line endings cannot move a ledger entry; the real staleness was 14 entries from this sprint's own edits.
- **Affected docs**: [plan.md](plan.md), [friction-log.md](friction-log.md)

## 2026-09-08 — impl-test: impacted set green

- **Decision**: Full suite green at 170/170 (the shared-infrastructure safety valve degraded the impacted set to the full suite, since the change surface is framework-wide). 10 tests added, 1 rewritten in place, 1 extended; no test removed, so the removal gate did not fire. No code defects — no `D-N` rows.
- **Rationale**: The red `T-2` copy-count assertion was implementation-coupled — it measured how many times the agent-memory property was restated, which Task 5 deliberately reduced — so it was rewritten to the one-owner-plus-citations shape, never deleted. One recommended assertion was rejected after verification against source: `routeTask` takes a structured object and contains no plan-file parser, so a `Reachability`-vs-`Material risk` routing test would only prove a pure function deterministic.
- **Affected docs**: [test-plan.md](test-plan.md), tests/run.js

## 2026-09-08 — impl-review iter-01: external review interrupted (attempt 1)

- **Decision**: external interrupted attempt 1 (session-wide usage limit, mid-dispatch). No verdict entry, no latch; the same reviewer is re-dispatched fresh in the same iteration per `review-policy.md` "Interrupted dispatch".
- **Rationale**: Not the correlated-failure branch that rule now carries — the four internal reviewers had already returned their verdicts and ledgers before the limit hit, so exactly one dispatch was in flight and lost. Recorded at the moment of interruption, as the rule requires.
- **Affected docs**: [reviews/impl/iter-01/](reviews/impl/iter-01/)

## 2026-09-08 — impl-review iter-01: external availability skip, route to review-fix

- **Decision**: External Review recorded as `APPROVE (skipped: codex quota exhausted)` — the wrapped CLI returned an active quota error on the pass and on the one permitted retry. Failure recorded in the negative cache (`status: quota`, bounded retry-after). Internal verdicts: correctness CONCERNS (8), efficiency CONCERNS (4), testing CONCERNS (6), documentation CONCERNS (9). No FAIL, so no escalation gate. `review_fixes_pending = iter-01`; sprint routes to impl review-fix mode.
- **Rationale**: The skip satisfies DoD aggregation exactly like a bare APPROVE but is never latched, so External Review is re-dispatched at iteration 2 once availability returns. All 27 findings are creator-fixable; two carry conditional escalations whose default fix needs none (keeping the manifest-vocabulary digest injection would be a compat waiver; treating `tests/run.js` in-body comments as a convention would need a custom-rules carve-out).
- **Affected docs**: [reviews/impl/iter-01/](reviews/impl/iter-01/), [state.json](state.json), [friction-log.md](friction-log.md)

## 2026-09-08 — impl review-fix for iter-01: findings resolved

- **Decision**: All 27 iteration-1 findings resolved in one ordered chain — dev half (8 commits, `3c4e6c9`..`eb9034c`) then tester half (`d6e148f`), one agent in flight at a time, which is the shape `AC-10` now mandates. Suite 171/171. `review_fixes_pending` cleared.
- **Rationale**: Three prescriptions were verified as wrong before applying, per the "Verify before applying" rule this sprint added. (1) documentation F-9 asked to document the digest injection; the prose was right and the code was wrong, so the injection was removed instead. (2) The external agent's `ABORT` signal was kept, not dropped, and scoped to pre-invocation preconditions, with a matching exemption clause in the Outcome contract — returning an availability skip for a missing prompt template would pass a review gate on a broken artefact. (3) testing T-1 predicted its new assertion would be red at HEAD; the dev had already registered `<reviewer>.late.md`, so it shipped green as a standing guard, proved by mutation. Two of the five in-body comments carried content no assertion message held and were folded into those messages rather than deleted.
- **Affected docs**: [reviews/impl/iter-01/](reviews/impl/iter-01/), [test-plan.md](test-plan.md)

## 2026-09-08 — noted for retro: stale link in asd-pm agent memory

- **Decision**: `.claude/agent-memory/asd-pm/MEMORY.md` indexes `feedback_flag-gate-semantics-before-applying.md`, which does not exist. Pre-existing, outside this sprint's change surface; left untouched and recorded here rather than pulled into scope.
- **Rationale**: Found while generalizing the memory index-link test. Fixing it would widen the diff past what any `AC-N` authorizes, and the new repo-wide test the tester considered would have gone red on it — so the test was scoped to the directories this sprint writes, with the reason recorded in `test-plan.md`.
- **Affected docs**: [test-plan.md](test-plan.md)

## 2026-09-08 — impl-test entry 2: full suite green

- **Decision**: Entry 2 (delta = the `iter-01` review-fix commits) complete: suite 171/171, build `ok: true`, lint clean, re-verified at `66a2a1f`. No new tests beyond the fix round's own; no removals; no `D-N` defects. `test_defects_pending` stays null.
- **Rationale**: The strategy, prune/author and suite passes for this delta were performed inside the fix round by the same tester agent, so entry 2 amends `test-plan.md` rather than re-deriving it. Entry 2's `HEAD analysed` was corrected from the delta tip to the post-authoring HEAD, so a later entry 3's delta excludes this entry's own test commits.
- **Affected docs**: [test-plan.md](test-plan.md)

## 2026-09-08 — impl-review iter-02: one APPROVE, four CONCERNS

- **Decision**: efficiency APPROVE (latched at iteration 2); correctness CONCERNS (3), testing CONCERNS (2), documentation CONCERNS (1), external CONCERNS (1, high). `review_fixes_pending = iter-02`; sprint routes to impl review-fix mode. External Review ran for real this iteration — the quota block from iteration 1 had expired and preflight returned local-ready.
- **Rationale**: The severity floor rose to medium, so low findings were dropped at source. External and correctness independently found the same defect: the fix-mode chain rule says "never a concurrent set" yet routes test-file findings to a second `asd-tester` chain without stating how the two chains serialize — the sprint avoided it by orchestrator judgment, not by the rule. External also confirmed every other iteration-1 class resolved and explicitly did not re-open them, so the AC-10 class is the only carry-over. The orchestrator additionally broke `test-plan.md` entry 2's provenance sha with a shell-quoting slip while filling it; the testing reviewer caught it and it is repaired here by the writer that broke it.
- **Affected docs**: [reviews/impl/iter-02/](reviews/impl/iter-02/), [state.json](state.json), [test-plan.md](test-plan.md)

## 2026-09-08 — impl review-fix for iter-02: findings resolved

- **Decision**: All seven iteration-2 findings resolved in one ordered chain, dev chain then tester chain, never concurrently — the serialization the dev chain itself landed. Suite 171/171. `review_fixes_pending` cleared; impl-test entry 3 recorded against `1fcf059`.
- **Rationale**: Two prescriptions were changed after verification. The dev chose to match fix-round entries on their stable tail rather than tighten the emitter, because step 11 already prescribed the exact literal and the orchestrator still drifted from it. The tester then declined the dev shape for the re-pinned test: it kept a second hardcoded literal, so instead the emitted string is derived from the workflow and required to end with the fragment the counter reads. Locators were keyed on citations rather than ordinals after the dev renamed one.
- **Affected docs**: [reviews/impl/iter-02/](reviews/impl/iter-02/), [test-plan.md](test-plan.md)

## 2026-09-08 — impl-review iter-03: one finding, three reviewers

- **Decision**: testing APPROVE (latched at iteration 3); efficiency latch-skipped from iteration 2 with its inherited APPROVE recorded; correctness, documentation and external each returned CONCERNS naming the SAME single high finding. `review_fixes_pending = iter-03`.
- **Rationale**: The floor rose to high, so only outcome-changing defects qualified — and all three dispatched reviewers independently landed on one: the late-duplicate-return binding was placed under a step header scoped "internal reviewers only", while the rule it cites explicitly holds for any replaced dispatch, External Review included. That is the exact sprint-008 iteration-5 case AC-14 exists for, so the acting site would discard the evidence its own rule mandates admitting. External also confirmed its iteration-2 finding resolved and declared no stalemate.
- **Affected docs**: [reviews/impl/iter-03/](reviews/impl/iter-03/), [state.json](state.json)
