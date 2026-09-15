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

## 2026-09-15 — Scope accepted: stalemate breaker, grounded fail-first proof, retro dedup-then-guardrail

- **Decision**: Sprint 013 scope is AC-1..AC-9 in `sprint.md`, as fully specified by the user in chat (three items plus retro dedup before drafting). Recorded as already-authorized; no further scope gate.
- **Rationale**: The user named every change, its target files and the retro ordering. Premises verified at `HEAD` 68b4659: impl⇄impl-test is uncapped (`sprint-lifecycle.md`), the `Regression proof` cell accepts a bare `fail-first vs D-N` (`t_test-plan.md`), and retro has no dedup step nor guardrail/home fields (`asd-phase-retro.md`, `t_retrospective.html`).
- **Affected docs**: [sprint.md](sprint.md)

- 2026-09-15 — audit `auto` → true: scope changes gate behaviour and template contracts, not mechanical.
- 2026-09-15 — design, design-review, design-promote suppressed by `skip_design_phases`; PRD/UX-spec/ADR/C4 already disabled in config.

## 2026-09-15 — Scope expanded: audit analyses all relevant docs/ with canonical precedence

- **Decision**: AC-10..AC-12 added at the user's request. Audit reads every relevant `docs/` document; canonical ASD documents win contradictions; residual contradictions go to the user as a hard decision.
- **Rationale**: At `HEAD` 68b4659 `sprint-lifecycle.md` "Audit phase" scans `docs/` but sets neither a completeness bar nor a precedence rule, and `t_audit.md` has no place to record a contradiction. "Canonical ASD document" is taken as a persistent doc at its path-map location, plus `.asd/rules/` under self_hosting.
- **Affected docs**: [sprint.md](sprint.md)

- 2026-09-15 — audit re-evaluated after scope expansion: stays true.

## 2026-09-15 — Scope expanded: configuration revision

- **Decision**: AC-13..AC-20 added. The user accepted every revision recommendation except one: `git.gh_enabled` and `git.auto_pr` are removed outright, so PRs are always ASD-managed through `gh`, instead of merged into a `git.pr` mode.
- **Rationale**: At `HEAD` 68b4659 `system.os`, `system.tools.designmd` and `system.tools.likec4` have no reader outside `/asd-init` (`runtime.js` uses `process.platform`). `documents.c4` duplicates `project.diagram_tool`, and `skip_design_phases` duplicates an all-disabled design document set. Removing legacy audit aliases follows the "keep" row's migration note, which the user accepted.
- **Affected docs**: [sprint.md](sprint.md)

- 2026-09-15 — audit re-evaluated after scope expansion: stays true (config schema break, migration).

## 2026-09-15 — Audit questions resolved by user; AC-2, AC-3, AC-7, AC-19, AC-20 amended

- **Decision**: AC-2 compares file path (line dropped), runner failure line and failing test name in a `runtime.js` subcommand. AC-3 reuses only the External Review detection rule; its own options are continue with guidance, accept as debt (hard waiver, `stubs.md`) or abort, answer logged against re-trigger. AC-7 home list gains `custom-design-rules.md`, Claude-only agent memory and consumer-mode "upstream ASD", with `Guardrail`/`Home` columns; AC-19 sanctions a release migration run by `/asd-update` as config writer (`core.md`, `t_AGENTS.md`, `asd-update`); AC-20 rewrites this repo's `config.yaml` by running the migration as a plan task; Goal count corrected to 28 → 20.
- **Rationale**: Audit found `file:line` identity fails open, "accept as-is" is a hidden quality waiver, AC-7 homes lose findings, and C5 (only `/asd-init` writes settings) blocks AC-19/AC-20. The user chose the recommended option for each except AC-20, where running `9.0.0.js` here was chosen over a new `<key>=<absent>` settings form; the migration header must therefore not restrict it to consumer projects.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md)

## 2026-09-15 — Audit accepted adaptively; frozen diagram state and invalid audit value

- **Decision**: Audit gate passed by orchestrator. `state.json.documents.c4` stays as the frozen effective boolean (`diagram_tool != none` AND decomposition enabled); only the config key is removed. A legacy or unknown `documents.audit` value blocks scope, matching the invalid-`user_gates` rule.
- **Rationale**: Every hard item from audit was answered by the user above; the two remaining choices are in-bounds plan-level defaults that keep active-sprint readers and hook unchanged and follow the existing `checkpoints.md` "Invalid or unreadable policy blocks" precedent.
- **Affected docs**: [audit.md](audit.md)

- 2026-09-15 — design/design-review/design-promote skipped (skip_design_phases enabled)

## 2026-09-15 — `plan.md` accepted

- **Decision**: Plan of 9 tasks in 6 waves accepted adaptively. Fixed at plan: Defects `Entry` column; step 9 routing exit fills `HEAD analysed`; `runtime.js defect-stalemate` with digest-keyed answer suppression; `external-preflight` returns `platform`; unknown audit value blocks; `9.0.0.js` touches config only and maps `c4: enabled` with no `diagram_tool` to `likec4`; `/asd-init` requires `gh auth status`.
- **Rationale**: Every task traces to user-authorized AC-1..AC-20 (as amended at audit); the fixed choices are bounded readings of those ACs or follow existing precedent (`checkpoints.md` invalid-policy block, `6.0.0.js` contract, `t_config.yaml` default), and no material alternative remains open. No open stubs (`stubs.md` empty).
- **Affected docs**: [plan.md](plan.md)

## 2026-09-15 — impl assessment approved

- **Decision**: Initial impl passed adaptively at HEAD b6df00a: Tasks 1-9 done (35/35 subtasks), AC-1..AC-20 covered, build (`sync.js --check`) and lint clean, round diff limited to task-named paths plus `.asd/project/config.yaml` (Task 8, user-authorized migration run), no stubs added. Flagged choices resolved: Task 1 digest suppression and Task 7 stale shipped comments routed back and fixed (8f1c760, 60184bd); Task 5 dead boolean rule removed (4c452e5); every other flagged choice accepted as a bounded reading of plan/ACs.
- **Rationale**: No unresolved material alternative remains. Tasks 2 and 9 were raised from standard to critical tier after two stalled standard dispatches (F-2); tier never lowered. Seven `tests/run.js` content contracts still assert the removed schema — impl-test input, not an impl gate.
- **Affected docs**: [plan.md](plan.md), [friction-log.md](friction-log.md)

- 2026-09-15 — impl-test: defects D-1 → impl test-fix (digest fde48b3c55eb87f00ab4e85f8307eb2925c6cf8b9fe5fc7cc7d878a5570c0053)

- 2026-09-15 — impl test-fix: defects D-1 resolved

- 2026-09-15 — impl-test: impacted set green (full suite 203/203), 7/0 tests

- 2026-09-15 — impl-review iter-01: external interrupted attempt 1 (agent stream stalled 600s, no verdict)

- 2026-09-15 — impl-review iter-01: external review skipped (external review unavailable: quota exhausted), sprint 013-stalemate-proof-guardrails iteration 1

## 2026-09-15 — impl-review iter-01 routed to impl review-fix

- **Decision**: Iteration 1 verdicts: correctness, efficiency, testing, documentation CONCERNS (split into 2 parts each, ledgers validated, union property held); external APPROVE (skipped: quota). 12 findings at floor `low` route to impl review-fix (`review_fixes_pending = "iter-01"`). No FAIL, so no escalation; COR-1-1 and COR-1-2 are resolved by their option (a) code/wording fixes, which need no risk acceptance or AC change.
- **Rationale**: Every finding is autofixable per `review-policy.md`; DOC-P1-1 (widen the writer licence to the value mappings/insertions carrying a removed key's intent) and EFF-1 (drop the three pre-9.0.0 comment rewrites) are compatible and applied together.
- **Affected docs**: [reviews/impl/iter-01/](reviews/impl/iter-01/)

- 2026-09-15 — impl fix for iter-01: findings resolved (COR-1-1, COR-1-2, COR-1-3, COR-1-P2-1, COR-1-P2-2, COR-1-P2-3, EFF-1, DOC-P1-1, DOC-1, DOC-2, DOC-3 no edit needed, TST-2-1, TST-2-2)

- 2026-09-15 — impl-test: impacted set green (full suite 203/203), 0/0 tests

- 2026-09-15 — impl-review iter-02: external review skipped (external review unavailable: quota exhausted), sprint 013-stalemate-proof-guardrails iteration 2

## 2026-09-15 — AC-19 writer bound widened (user)

- **Decision**: AC-19's sanctioned config-writer bound now reads "release-mandated key renames and removals, plus the value mappings, key insertions and shipped-comment rewrites that carry a renamed or removed key's or value's intent", matching canon since the iter-01 review-fix (DOC-P1-1). Resolves COR-2-1 without a canon edit.
- **Rationale**: The user approved the wider wording at the hard acceptance-criteria gate; it describes what AC-19's own mappings require. The widening had first entered as an autofix without that gate — an orchestration miss. Evidence stated before the decision: AC-19 iterations charged ≥2 (iter-01, iter-02; lower bound), fix rounds charged 1.
- **Affected docs**: [sprint.md](sprint.md), [reviews/impl/iter-02/correctness.md](reviews/impl/iter-02/correctness.md)

## 2026-09-15 — impl-review iter-02 routed to impl review-fix

- **Decision**: Iteration 2 (floor medium, 24-file diff, no split): efficiency APPROVE (latched at 2); correctness CONCERNS (COR-2-1 resolved by the user AC-19 decision above, no fix); testing CONCERNS (TST-1 missing fail-first record for the COR-1-2 fix, TST-2 stale AC-16 assert message); documentation CONCERNS (F-1 stale `9.0.0.js` header clause); external skipped (quota). TST-1, TST-2, F-1 route to impl review-fix (`review_fixes_pending = "iter-02"`).
- **Rationale**: No FAIL; remaining findings are autofixable and change no AC bound.
- **Affected docs**: [reviews/impl/iter-02/](reviews/impl/iter-02/)

- 2026-09-15 — impl fix for iter-02: findings resolved (F-1, TST-1, TST-2; COR-2-1 resolved by user AC-19 decision)

- 2026-09-15 — impl-test: impacted set green (full suite 203/203), 0/0 tests

- 2026-09-15 — impl-review iter-03: external review skipped (external review unavailable: negative-cache quota), sprint 013-stalemate-proof-guardrails iteration 3

## 2026-09-15 — impl-review DoD met; green handoff to retro

- **Decision**: impl-review complete at iteration 3: correctness, efficiency (latched 2), testing, documentation APPROVE; external availability-skipped (quota) in all three iterations; terminal full suite green at HEAD 78b6a7b (`node tests/run.js` exit 0, 203/203; lint and `sync.js --check` clean; recorded 888373c). Green handoff passed adaptively.
- **Rationale**: Every required reviewer verdict for `iter-03` is satisfied per `sprint-lifecycle.md` "State recovery"; the only hard decision in the cycle (AC-19 bound) was taken by the user; no waiver, debt or cap override is involved.
- **Affected docs**: [reviews/impl/iter-03/](reviews/impl/iter-03/), [test-plan.md](test-plan.md)
