---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

## Entries

<!-- entries appended below this line -->

## 2026-11-21 — Workflow choice

- **Decision**: User selected the lite workflow for sprint 038.
- **Rationale**: The sprint concerns framework configuration, review invocation, and mockup routing.
- **Affected docs**: [state.json](state.json)

## 2026-11-21 — External review approach

- **Decision**: User approved a named Codex profile for external review and requested a role-by-role comparison before deciding model changes.
- **Rationale**: A named profile sets the provider and model for the review process independently of the primary session.
- **Affected docs**: [research.md](research.md)

## 2026-11-21 — Codex model assignments

- **Decision**: The user selected Sol/xhigh for escalated development, Sol/medium for test design and triage, Luna/medium for test execution, Astra/medium for advice, Luna/high for the external-review wrapper, and the rolling RouterAI Opus alias at medium for the example review profile.
- **Rationale**: Raise reasoning effort for escalated development, use Astra for ambiguous decisions, and use smaller or lower-effort models for repeatable checks and review orchestration.
- **Affected docs**: [Model selection](research.md#model-selection)

- 2026-11-21 — user confirmed all six model assignments and asked to continue to scope acceptance.
- 2026-11-22 — issue triage authorised: add `asd-retro` to #130–#145 and close #139 as resolved. `sprint-lifecycle.md` Operation timing covers inline decisions and manual handoffs at HEAD.
- 2026-11-22 — issue triage completed: added `asd-retro` to #130–#145, verified #139 closed as completed and the other 15 labeled issues open. No open PRs or due stubs.

## 2026-11-22 — Scope accepted

- **Decision**: The user accepted the seven base criteria and included every remaining intake candidate in one lite sprint, AC-1 through AC-30.
- **Rationale**: The scope gate covered eight rows from sprint 037 and 15 open issues. Each new criterion had a lower-bound cost of 0 review iterations and 0 fix rounds. The intake was rechecked at HEAD. A-3 still lacks stale hash-ledger reporting in check mode. #141 remains open because the caller applies exclusions before emitting the unchecked external manifest. #139 was already closed and is outside this intake.
- **Affected docs**: [sprint.md](sprint.md), [retro backlog](../../project/retro-backlog.md), [retrospective 037](../archived/037-quality-gates-ci-cost-ideas/retrospective.html)

- 2026-11-22 — issue dispositions: #130 include AC-8; #131 include AC-9; #132 include AC-10; #133 include AC-11; #134 include AC-12; #135 include AC-13; #136 include AC-14; #137 include AC-15; #138 include AC-16; #140 include AC-17; #141 include AC-18; #142 include AC-19; #143 include AC-20; #144 include AC-21; #145 include AC-22.
- 2026-11-22 — retrospective dispositions: 037#A-2 through A-7 included as AC-23 through AC-28; 037#P-1 and P-2 included as AC-29 and AC-30.
