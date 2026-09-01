---
{
  "name": "asd-phase-design-promote",
  "description": "Runs the ASD design-promote phase: asd-pm orchestrates user-approved per-subsystem decomposition, then only the domain creators (asd-architect, asd-ba, asd-ux-designer) whose sprint draft is actually in scope this sprint promote to persistent docs/ in parallel, gated by a final user confirmation — no-op when nothing is in scope to promote. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint.",
  "claude": { "allowed-tools": "Read AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
