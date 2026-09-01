---
{
  "name": "asd-phase-design-review",
  "description": "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: dispatches asd-reviewer-documentation + asd-reviewer-simplification for any non-empty draft set, asd-reviewer-ui only when a ux-spec/design-system draft is in scope (and asd-external-review when enabled), aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Never dispatched at all when every documents.* is disabled — the design phase's collapsed no-op check already advanced past it; this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
