---
{
  "name": "asd-phase-retro",
  "description": "Runs the ASD retro phase: the phase orchestrator reads the sprint friction log, derives a root cause per F-N entry plus consumer-project and ASD-framework recommendations traced to those ids, writes retrospective.html and posts a short chat summary. Unconditional and never no-op — an absent or entry-free log takes the empty-log branch and still completes to pr. Use when asd-sprint dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint. Execute workflow `.asd/workflows/asd-phase-retro.md`.
