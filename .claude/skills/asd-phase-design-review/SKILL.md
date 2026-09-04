---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:cb33139190aa30f6a565975164705690be0487727c859c9e81149492cdc4367c content_digest=sha256:8c8f741c3060769a07be6cad25b8bc34febafe9161a509c2b98fb85fc99c57ba asd_version=3.1.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: always dispatches asd-reviewer-documentation + asd-reviewer-efficiency + asd-reviewer-correctness for any non-empty draft set (and asd-external-review when enabled) — correctness's UI section is n/a unless a ux-spec/design-system draft is in scope, never an agent-level skip — aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Never dispatched at all when every documents.* is disabled — the design phase's collapsed no-op check already advanced past it; this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
