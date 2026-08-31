---
{
  "name": "asd-phase-design-review",
  "description": "Runs the ASD design-review phase iteratively until DoD met: dispatches asd-reviewer-documentation, asd-reviewer-ui, asd-reviewer-simplification (and asd-external-review when enabled) in parallel against the sprint design drafts, aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint.",
  "claude": { "allowed-tools": "Read AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
