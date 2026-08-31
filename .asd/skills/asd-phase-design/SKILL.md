---
{
  "name": "asd-phase-design",
  "description": "Runs the ASD design phase for the active sprint: dispatches creators sequentially per the precondition chain (asd-ba for prd.html, a design-system gate, asd-ux-designer for ux-spec.html, asd-architect for adr.html and optional c4-full/) to author sprint design drafts. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint.",
  "claude": { "allowed-tools": "Read Glob AskUserQuestion Task Skill" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
