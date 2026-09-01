---
{
  "name": "asd-phase-pr",
  "description": "Runs the final ASD pr phase: dispatches asd-pm to verify the Definition of Done, compose+open (or prepare) the PR per git config, and archive the sprint folder onto the same branch, then on a later re-entry sets the terminal state once the PR is merged. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint.",
  "claude": { "allowed-tools": "Read Glob Grep AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-pr.md`.
