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

## 2026-09-07 — Scope accepted

- **Decision**: Sprint 007 adds a per-sprint friction log (workflow/tooling/agent problems, not feature defects) and a new `retro` phase between `impl-review` and `pr` that analyses it, emits consumer-side and ASD-side recommendations into a templated user-facing HTML artifact, posts a chat summary, then routes to `pr`. Two templates are in scope: friction log and retrospective output.
- **Rationale**: Process friction is currently lost with the transcript; nothing in the sprint shape captures or acts on it. Explicit user acceptance after one revision tightening AC-5 to require a dedicated output template.
- **Affected docs**: `sprint.md`, `state.json`

## 2026-09-07 — Audit accepted; three material design questions resolved

- **Decision**: Audit accepted. (1) `retro` is an UNCONDITIONAL phase — no `documents.retro` flag; an empty friction log is handled by the phase itself, not by a config skip. (2) Retro output is sprint-scoped only — nothing is promoted to a persistent home, matching sprint.md Out-of-scope; cross-sprint friction memory is explicitly not delivered. (3) `state.json.escalations` is RETIRED and subsumed by the friction log: drop the key from `t_state.json`, rewrite `asd-phase-impl.md:87` to append a friction entry, refresh `upstream_hashes`, and clear the stale key via the AC-9 migration.
- **Rationale**: Unconditional avoids a config flag, a no-op-table row, a state field and a migration branch for a phase that is cheap when empty. Skipping persistence keeps the sprint inside its declared scope. Retiring `escalations` removes a second, unread channel for the same fact and prevents an SSoT violation the Documentation reviewer would FAIL.
- **Affected docs**: `audit.md` (G-2, G-6, G-7), `sprint.md`, `state.json`

- 2026-09-07 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-07 — plan.md accepted (adaptive pass)

- **Decision**: `plan.md` accepted with seven tasks; advance to impl. Version target recorded as MAJOR, confirmed at pr per git-strategy.
- **Rationale**: Routine plan-acceptance gate under `user_gates: adaptive`. Every task traces to an AC the user already authorized at the scope gate, and the three material questions the audit surfaced were answered by the user before planning. No unresolved material alternative remains; no new scope, subsystem, contract or waiver introduced.
- **Affected docs**: `plan.md`, `state.json`

## 2026-09-07 — Scope expanded: retro emits systemic improvement proposals

- **Decision**: AC-10 added. The retro phase also proposes systemic changes that would make a future sprint faster and cheaper, as an output class distinct from remediating recorded friction, produced even when the friction log is empty. Implemented as Task 8, since Tasks 1-3 were already complete when the expansion was requested.
- **Rationale**: Explicit user request during impl. Audit reevaluation: `documents.audit` stays enabled; the expansion adds no behaviour outside the retro phase and no new contract, so no earlier phase is invalidated.
- **Affected docs**: `sprint.md` (AC-10), `plan.md` (Task 8)

## 2026-09-07 — impl assessment approved

- **Decision**: Impl accepted; advance to impl-test. Eight tasks closed across eight commits; AC-1..AC-10 covered; build and lint clean; no stubs and no manual steps registered.
- **Rationale**: Explicit user approval at the impl assessment gate.
- **Affected docs**: `plan.md`, `state.json`

- 2026-09-07 — impl-test: impacted set green (132/132, full-suite scope via shared-infrastructure safety valve), 5 tests added, 0 removed

- 2026-09-07 — impl-review iter-1: external review skipped (unavailable: quota; codex CLI usage limit, negative cache set, retry-after +1h)

- 2026-09-07 — impl-review iter-1: 4 internal reviewers CONCERNS (33 findings), external skipped; routing to impl review-fix mode

- 2026-09-07 — impl fix for iter-01: all 33 findings resolved (CORR-A-01..08, CORR-B-1..2, EFF-1..6, TST-01..08, DOC-1..9); CORR-A-06/TST-06 deferred to pr as the asd_version bump
