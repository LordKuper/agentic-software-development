---
{
  "name": "asd-phase-pr",
  "description": "Runs the final ASD pr phase: the phase orchestrator verifies DoD, opens the sprint PR and later merges it, then hands closure back to asd-sprint; it never archives or marks the sprint done. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint.",
  "claude": { "allowed-tools": "Read Glob Grep AskUserQuestion Task" },
  "codex": {}
}
---

Execute workflow `.asd/workflows/asd-phase-pr.md`.
