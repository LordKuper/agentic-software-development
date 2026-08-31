---
{
  "name": "asd-phase-plan",
  "description": "Runs the ASD plan phase: dispatches asd-pm to author plan.md from the sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to PRD acceptance criteria. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint.",
  "claude": { "allowed-tools": "Read AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
