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

## 2026-09-06 — Scope accepted

- **Decision**: User accepted sprint.md (AC-1 through AC-23) and requested continuation. PM removal is unconditional; task-class agent variants and adaptive gates are approved, with explicit user approval required for sprint finalization and archival.
- **Rationale**: Explicit user message: «Принимаю. Идем дальше.» following the final gate-policy revision. Audit remains enabled; PRD, UX-spec, ADR and C4 are disabled.
- **Affected docs**: sprint.md, state.json

## 2026-09-06 — Batch rejected

- **Decision**: Do not implement Batch in this sprint; user explicitly chose «Тогда batch не делаем. Продолжай.» AC-16 feasibility decision is complete.
- **Rationale**: Official OpenAI and Anthropic Batch APIs advertise 50% discounts against synchronous API requests, with asynchronous processing up to 24 hours and possible expiry. This repository has no Batch transport; adapting CLI-driven interactive phases would require submission, recovery and stale-snapshot handling. Rejecting Batch avoids that integration and latency, forgoing its eligible API-request discount. No Batch requests were submitted.
- **Affected docs**: sprint.md (AC-16); sources checked 2026-09-06: https://developers.openai.com/api/docs/guides/batch ; https://platform.claude.com/docs/en/build-with-claude/batch-processing

## 2026-09-06 — audit.md adaptive acceptance

- **Decision**: decision_actor=orchestrator; accepted audit.md, sha256=efd83df76b979ae79e242dd97bab32232d7319577958e3764d2fa8ae47a9b4ab.
- **Rationale**: Explicitly adopted AC-18..AC-23 permits routine audit/plan progression after scope acceptance. Artifact preserves AC-1..AC-23, rejected Batch decision, provider restrictions and closure approval. No new product direction, subsystem, debt waiver or scope expansion; no open stubs. Source inspection and AC mapping are recorded in the artifacts; implementation quality checks remain pending and are not claimed passed.
- **Affected docs**: audit.md, state.json

## 2026-09-06 — plan.md adaptive acceptance

- **Decision**: decision_actor=orchestrator; accepted plan.md, sha256=d258a2f5f57bd76347f5a905d4ef57154d3fa76ad610c9221dce72f60a63f06f.
- **Rationale**: Explicitly adopted AC-18..AC-23 permits routine audit/plan progression after scope acceptance. Artifact preserves AC-1..AC-23, rejected Batch decision, provider restrictions and closure approval. No new product direction, subsystem, debt waiver or scope expansion; no open stubs. Source inspection and AC mapping are recorded in the artifacts; implementation quality checks remain pending and are not claimed passed.
- **Affected docs**: plan.md, state.json

- 2026-09-06 — design/design-review/design-promote skipped (no design documents enabled).

## 2026-09-07 — Resume implementation

- **Decision**: Continue accepted scope from partial canonical edits; no task is yet marked complete. Batch remains rejected.
- **Rationale**: User requested continuation after delegated agents hit usage limits. Bootstrap delegates use the installed asd-dev configuration (Terra/high); new critical variants are not available to the current host registry yet. Plan wording now records this limitation instead of claiming critical-model execution. Strong independent review remains required; no unavailable-agent result counts as review.
- **Affected docs**: plan.md, state.json

## 2026-09-07 — Implementation handed to testing

- **Decision**: decision_actor=orchestrator; implementation tasks complete, adaptive assessment advances to impl-test. Independent testing/review remain outstanding.
- **Rationale**: Canonical edits integrated; 58 generated targets applied, including PM orphan removal. Sync check and diff check exited 0; hook runs clean; canonical JSON and config YAML parse (delta template validated after placeholder substitution). Self-sourced AGENTS.md remains the existing documented modified-foreign exemption, not generated drift.
- **Affected docs**: plan.md, state.json, canonical/provider changes
