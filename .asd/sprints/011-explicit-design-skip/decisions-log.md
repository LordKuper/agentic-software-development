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

## 2026-09-14 — Scope intent clarified: explicit skip of the design block

- **Decision**: The setting skips `design`, `design-review` and `design-promote` explicitly, without loading their skills or workflows; the document-driven skip stays because it also covers partial document sets. Enabled for this repo.
- **Rationale**: The user chose this reading when told that this repo already skips all three phases implicitly in every sprint, at the cost of loading `asd-phase-design` for one no-op write.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/sprint.md`

## 2026-09-14 — Audit phase runs (documents.audit: auto → true)

- **Decision**: `documents.audit: auto` normalizes to running the audit; `state.json.documents.audit` frozen to `true`.
- **Rationale**: The scope changes phase routing, the config schema, the frozen state shape and the precondition chain — behaviour and contract impact, not mechanical.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/state.json`

## 2026-09-14 — Sprint 011 scope accepted

- **Decision**: The user accepted `sprint.md` AC-1 … AC-7 unchanged at the hard scope gate.
- **Rationale**: The initial scope gate is hard in both policy modes. Per-criterion cost was stated before the decision: 0 iterations, 0 fix rounds for every criterion, this being a new sprint.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/sprint.md`, `.asd/sprints/011-explicit-design-skip/state.json`

## 2026-09-14 — Audit accepted adaptively

- **Decision**: `audit.md` accepted by the orchestrator under `user_gates: adaptive`; BA not dispatched. Carried to plan: field outside the `documents` group (G-1), effective design documents frozen `false` when the setting is on (G-3), audit workflow exit owns the skip write and returns `NEXT: <design | plan>` (G-4 option A), AC-6 delivered as a manual `/asd-init` step (R-1).
- **Rationale**: The architect found no material product/domain ambiguity, and each carried recommendation is the evidence-forced implementation of an already accepted criterion (AC-1, AC-3, AC-4, AC-6), so no new authority is needed. Field and state names stay open for plan.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/audit.md`, `.asd/sprints/011-explicit-design-skip/state.json`

- 2026-09-14 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-14 — `.asd/sprints/011-explicit-design-skip/plan.md` accepted

- **Decision**: The user accepted the plan: six tasks in four waves, config field `skip_design_phases: enabled | disabled` at top level (absent = disabled), frozen as state boolean `skip_design_phases` (absent = false). No open stub touches the scope.
- **Rationale**: The field name is a new public config contract and a naming preference, so it went to the user rather than an adaptive pass.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/plan.md`, `.asd/sprints/011-explicit-design-skip/state.json`

## 2026-09-14 — MS-1 validated as a necessary manual step

- **Decision**: Task 6 blocks on MS-1: the user runs `/asd-init` diff mode to set `skip_design_phases: enabled`. Tasks 1-5 are complete; build (`sync --check`) and lint are clean, and the suite passes 184/184.
- **Rationale**: Settings are writable only through `/asd-init`, which no dispatched agent can invoke, so the action needs authority the chain does not hold.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/manual-steps.md`, `.asd/sprints/011-explicit-design-skip/plan.md`

## 2026-09-14 — Impl assessment approved (adaptive)

- **Decision**: Initial impl complete: Tasks 1-6 done, MS-1 done (user ran `/asd-init` diff mode; `skip_design_phases: enabled` committed). Advance to impl-test.
- **Rationale**: Every plan checkbox is ticked, build (`sync --check`) and lint are clean, the round's diff touches only task-authorised paths, and no sprint stub was introduced, so the routine gate's evidence rule is met without a new user decision.
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/plan.md`, `.asd/sprints/011-explicit-design-skip/manual-steps.md`
- 2026-09-14 — impl-test: impacted set green (187/187, full suite by safety valve; sync --check 72/72 current; lint clean), 3/0 tests added/removed

## 2026-09-14 — impl-review iter-01: CONCERNS, routed to impl review-fix

- **Decision**: Efficiency APPROVE (latched). Correctness (COR-1, COR-2), Testing (TST-01), Documentation (DOC-1) and External (EXT-1) return CONCERNS, with no FAIL. `review_fixes_pending = "iter-01"`, `NEXT: impl`.
- **Rationale**: Every finding is autofixable within scope, so no escalation is needed. COR-1 and EXT-1 share one root cause in the audit two-write sequence; COR-2 is the resume rule and plan precondition reading `skipped_phases` as current status; DOC-1 is two stale collapse attributions; TST-01 is the unpinned AC-3 decisions-log line. Iteration cap is not reached (iter 2 floor medium).
- **Affected docs**: `.asd/sprints/011-explicit-design-skip/reviews/impl/iter-01/`
- 2026-09-14 — impl fix for iter-01: findings resolved (EXT-1, COR-1 in 8d28cbb; COR-2 in b6e7f8e; DOC-1 in bfe09d9; TST-01 plus the EXT-1/COR-2 test contract in 318ffca; every premise verified at HEAD, no mismatch)
- 2026-09-14 — impl-test: impacted set green (187/187, full suite by safety valve; sync --check 72/72 current; lint clean), 0/0 tests added/removed (1 assertion added)
- 2026-09-14 — impl-review iter-02: all reviewers APPROVE (efficiency latched from iter-01); reviewer DoD met, dispatching terminal full-suite gate
