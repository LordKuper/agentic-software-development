---
{
  "name": "asd-phase-pr",
  "description": "Runs the final ASD pr phase: the phase orchestrator verifies DoD, opens the sprint PR and merges it in the same run, publishing the self-hosting release after the merge; it never archives or marks the sprint done, which the next sprint's scope does. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit Glob Grep Bash AskUserQuestion Task" },
  "codex": {}
}
---

Execute workflow `.asd/workflows/asd-phase-pr.md`.
