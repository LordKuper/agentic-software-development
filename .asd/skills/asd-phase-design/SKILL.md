---
{
  "name": "asd-phase-design",
  "description": "Runs the ASD design phase for the active sprint: dispatches creators sequentially, one per document independently enabled via documents.* (asd-ba for prd.html, a design-system gate only if ux_spec enabled, asd-ux-designer for ux-spec.html, asd-architect for adr.html and c4-full/) — no-op when every document is disabled. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint.",
  "claude": { "allowed-tools": "Read Glob AskUserQuestion Task Skill" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
