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

## 2026-09-04 — Accepted Codex runtime support scope

- **Decision**: Accepted the sprint scope covering Codex-primary runtime support, the reproduced unsupported-model failure, the existing bootstrap fix, all phase and provider surfaces, regression coverage, documentation, and preservation of Claude support.
- **Rationale**: The scope makes the known failure testable while requiring a complete audit before treating the bootstrap change as sufficient.
- **Affected docs**: [sprint.md](sprint.md)

- 2026-09-04 — scope documents disabled: prd, ux_spec, adr, c4

## 2026-09-04 — Approved Codex runtime support audit

- **Decision**: Approved the audit of Codex-primary runtime support, including the validated bootstrap model correction and the documented remaining gaps and risks.
- **Rationale**: The audit establishes sufficient evidence and a bounded implementation surface for the sprint to proceed.
- **Affected docs**: [audit.md](audit.md)

- 2026-09-04 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-04 — Accepted Codex runtime support plan

- **Decision**: Accepted the six-task implementation plan covering every confirmed audit gap and AC-1 through AC-8, with bootstrap commit `1a2c008` recorded as completed baseline work that remains subject to implementation, test, and review validation.
- **Rationale**: The plan is cohesive, dependency-aware, keeps tests in `impl-test`, and routes all provider changes through shared canonical sources and generated mirrors.
- **Affected docs**: [plan.md](plan.md)

## 2026-09-05 — Impl assessment approved

- **Decision**: Approved the initial implementation assessment and advanced the sprint to `impl-test`.
- **Rationale**: All plan tasks are complete, the build and lint completion gate is green, and no sprint-introduced stubs remain open.
- **Affected docs**: [plan.md](plan.md), [state.json](state.json)

- 2026-09-05 — impl-test: impacted set green (111/111), 6 added/0 removed tests

- 2026-09-05 — external review unavailable: claude — OAuth session expired and could not be refreshed; workspace trust not accepted

- 2026-09-05 — impl-review iter 01: CONCERNS (correctness F-1; testing T-01) → impl fix

- 2026-09-05 — impl fix for iter-01: findings F-1 and T-01 resolved

- 2026-09-05 — external review unavailable at invocation: claude — OAuth session expired; workspace trust not accepted; retry failed

- 2026-09-05 — impl-review iter 02: CONCERNS (correctness C-1) → impl fix

- 2026-09-05 — impl fix for iter-02: finding C-1 resolved

- 2026-09-05 — external review unavailable at invocation: claude — OAuth session expired; workspace trust not accepted; retry failed

- 2026-09-05 — impl-review iter 03: APPROVE, full suite green

## 2026-09-05 — Opened PR #23

- **Decision**: Approved and opened the sprint PR against `main` with the accepted title and description.
- **Rationale**: The Definition of Done is satisfied and release `v4.0.1` is ready for review and merge.
- **Affected docs**: [PR #23](https://github.com/LordKuper/agentic-software-development/pull/23), [state.json](state.json)
