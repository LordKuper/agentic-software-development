---
{
  "name": "asd-phase-design-promote",
  "description": "Runs the ASD design-promote phase: asd-pm orchestrates user-approved per-subsystem decomposition, then asd-architect, asd-ba, and asd-ux-designer promote sprint drafts to persistent design/ in parallel, gated by a final user confirmation. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint.",
  "claude": { "allowed-tools": "Read AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
