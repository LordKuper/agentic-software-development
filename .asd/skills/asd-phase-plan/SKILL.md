---
{
  "name": "asd-phase-plan",
  "description": "Runs the ASD plan phase: the phase orchestrator authors plan.md from sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to acceptance criteria. Always runs, never no-op. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit AskUserQuestion Task" },
  "codex": {}
}
---

Execute workflow `.asd/workflows/asd-phase-plan.md`.
