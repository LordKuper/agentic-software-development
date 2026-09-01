---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:93c7182546b27aba8a27948740a32d1f955f39fc64b84865c82e4a148445496b content_digest=sha256:637790c04ea1bdabd342b928480cfcccb72ea19cc9640836fe9798483eb503c0 asd_version=2.0.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: dispatches asd-reviewer-documentation + asd-reviewer-simplification for any non-empty draft set, asd-reviewer-ui only when a ux-spec/design-system draft is in scope (and asd-external-review when enabled), aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Never dispatched at all when every documents.* is disabled — the design phase's collapsed no-op check (Task 14) already advanced past it; this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
