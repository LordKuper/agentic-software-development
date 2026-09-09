---
{
  "name": "asd-phase-pr",
  "description": "Runs the final ASD pr phase: the phase orchestrator verifies DoD, handles PR and merge recovery, then requires explicit closure approval before finalization and archival. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint.",
  "claude": { "allowed-tools": "Read Glob Grep AskUserQuestion Task" },
  "codex": {}
}
---

Execute workflow `.asd/workflows/asd-phase-pr.md`.
