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

## 2026-09-14 — Retrospective rows 010/011 re-verified against HEAD 62464ac

- **Decision**: 010 F-4 (quota failure suppressing the next dispatch) is closed as already satisfied. `external-record-failure` accepts status `quota` with a bounded retry-after (`.asd/runtime.js` 152-157), preflight returns `negative-cache` while that retry-after stands (`.asd/runtime.js` 144), and both review workflows call it (`asd-phase-impl-review.md` 1a, `asd-phase-design-review.md` 3a). Every other row is still unresolved and is carried as written, as follows.
  - 010 F-1 → AC-1: only `LEDGER_VOCABULARY`/`LEDGER_ROW_EXAMPLE` are published; `n_a` is validated (`runtime.js` 218-238) but has no published shape.
  - 010 F-2 → AC-2: `review-policy.md` 115 has only "immutable manifest" persistence; nothing covers orchestrator re-stamping.
  - 010 F-3 split → AC-3: `review-policy.md` 154 says "No size threshold".
  - 010 F-3 record → AC-4: interrupted attempts are logged (`review-policy.md` 146), but the re-dispatch payload does not carry them.
  - 010 F-5 → AC-5/AC-6: no tool-policy statement in `providers.md`/`core.md`; no pre-write check in `artifact-layout.md` "Agent memory".
  - 011 F-1 → AC-7: `git-strategy.md` 39 says "every path it authored" but never names agent-memory writes.
  - 010 P2/P3/P4/P5/P6 and 011 P1/P2/P3 → AC-3, AC-12, AC-8, AC-9, AC-10, AC-11, AC-12, AC-13: none present (no `emit` subcommand in `runtime.js` 276-298; no sizing in `asd-phase-plan.md`; no non-binding statement in `review-policy.md`; no derive rule in `code-style.md`; no lag note in `t_test-plan.md`; no flagged-choice clause at `asd-phase-impl.md` step 10; no settings-task path).
- **Rationale**: `sprint-lifecycle.md` "Orchestration and adaptive gates" requires re-verification before a retrospective row becomes an AC.
- **Affected docs**: `.asd/sprints/archived/010-agent-doc-economy/retrospective.html`, `.asd/sprints/archived/011-explicit-design-skip/retrospective.html`, `sprint.md`

## 2026-09-14 — Proposal selection and subsystem-file maintenance point

- **Decision**: The user selected three proposal groups: the rule-text edits (010 P4, P5, P6 and 011 P1), the manifest emitter with review-scope sizing (010 P2, P3 and 011 P2), and settings changes through `/asd-init` (011 P3). 010 P1 (agent-memory audit) was not selected. The subsystem Markdown files are written at `design-promote` and backfilled at `audit`.
- **Rationale**: The user answered at scope. Backfilling at audit reaches projects that were decomposed before this change, with no migration script and no placeholder files.
- **Affected docs**: `sprint.md` AC-3, AC-8..AC-13, AC-16

## 2026-09-14 — Audit normalization and design-block freeze

- **Decision**: `documents.audit: auto` freezes as `true`. Frozen `skip_design_phases` is `true`, and `prd`/`ux_spec`/`adr`/`c4` freeze as `false`. No document is suppressed by the skip, because config already disables all four.
- **Rationale**: The scope changes behaviour, contracts and gates, so it is not a mechanical scope.
- **Affected docs**: `state.json`

## 2026-09-14 — Scope revision 2: subsystems.md becomes the subsystem registry

- **Decision**: `docs/architecture/subsystems.md` is the subsystem registry and replaces `docs/architecture/c4/` in that role. When C4 is disabled, `c4/` is neither written nor created. The subsystem criteria are renumbered AC-14..AC-19, and the maintenance-point decision above now maps to AC-17.
- **Rationale**: This is the user's revision at the scope gate. The subsystem registry must not depend on the C4 setting.
- **Affected docs**: `sprint.md` Goal, AC-14..AC-19, Out of scope

## 2026-09-14 — Scope revision 3: mermaid diagram lives in subsystems.md

- **Decision**: In mermaid mode, the diagram is written straight into `docs/architecture/subsystems.md`. No `c4/` folder, `subsystems.yaml` or `architecture.html` is created, and `t_subsystems.yaml` is retired.
- **Rationale**: This is the user's revision at the scope gate. Mermaid mode then needs no file beyond the registry itself.
- **Affected docs**: `sprint.md` AC-16

## 2026-09-14 — Scope accepted

- **Decision**: The user accepted `sprint.md` revision 3 (AC-1..AC-19) at the hard scope gate.
- **Rationale**: An explicit `accept` was given after two revisions. Every criterion is new, and its cost is 0 iterations and 0 fix rounds.
- **Affected docs**: `sprint.md`, `state.json` gate_decisions

## 2026-09-14 — Audit accepted (adaptive)

- **Decision**: `audit.md` is accepted by the orchestrator under adaptive gates. BA was not dispatched.
- **Rationale**: The audit is findings only and stays inside the accepted scope, and Architect reported no product/domain ambiguity. The open architecture, migration and gate tradeoffs it raises are decided in plan: registry bootstrap without C4, the fate of consumers' existing `c4/`, the mermaid draft path, the settings-task gate, and the split threshold.
- **Affected docs**: `audit.md`, `state.json` gate_decisions

- 2026-09-14 — design/design-review/design-promote skipped (skip_design_phases enabled)

## 2026-09-14 — Plan inputs: registry bootstrap, legacy c4/ removal, settings-task approval

- **Decision**: Registry bootstrap:
  - When decomposition is enabled, `/asd-init` creates an empty `docs/architecture/subsystems.md`, and `design-promote` fills it.
  - If decomposition is already enabled but there is no registry, `audit` creates the registry and does the first fill.
  - Every subsystem added to the registry needs explicit user confirmation.

  A legacy `docs/architecture/c4/` that the new rules make redundant (C4 disabled, or mermaid mode) is deleted at `audit` after its content has moved to the registry. A plan task that declares a settings change is approved by plan acceptance; `/asd-init` then applies only the declared key/value pairs and shows the diff, with no second `accept-all`.
- **Rationale**: The user decided all three at the plan phase.
- **Affected docs**: `plan.md` Tasks 5 and 6

## 2026-09-14 — Split threshold value and partition shape (adaptive)

- **Decision**: The split threshold is a `.asd/runtime.js` constant of 25 scope files, applied when a manifest is emitted. A manifest above it is partitioned before its first dispatch into `ceil(files / 25)` disjoint parts in manifest order, never recursively. The existing trigger of two interruptions still halves a manifest that is below the threshold.
- **Rationale**: Sprint 010 evidence: a 56-file scope exhausted a whole dispatch, and a 21-file scope ran cleanly. An N-part partition closes the "above 2× threshold" gap that `audit.md` raised, without recursion.
- **Affected docs**: `plan.md` Task 2

## 2026-09-14 — `.asd/sprints/012-retro-010-011-subsystem-docs/plan.md` accepted

- **Decision**: The user accepted plan.md: 7 tasks in 5 waves, covering AC-1..AC-19. AC-3 is kept whole.
- **Rationale**: The user gave an explicit `accept` at the plan gate. There were no open stubs, so no stub decisions were needed.
- **Affected docs**: `plan.md`
