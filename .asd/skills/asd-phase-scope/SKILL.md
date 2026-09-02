---
{
  "name": "asd-phase-scope",
  "description": "Runs the ASD scope phase of a sprint: creates the sprint folder, state.json, and git branch, then dispatches asd-pm to refine the raw user scope into a sprint.md accepted via write-then-review-accept (write, then user replies accept). Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint.",
  "claude": { "allowed-tools": "Read Glob Bash AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-scope.md`.
