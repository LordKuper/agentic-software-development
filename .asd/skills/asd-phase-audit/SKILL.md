---
{
  "name": "asd-phase-audit",
  "description": "Runs the ASD audit phase for the active sprint: dispatches asd-ba to scan existing docs and asd-architect to scan existing code, merges findings into audit.md, then dispatches asd-pm for user approval — no-op (no dispatch, no approval gate) when the sprint's frozen documents.audit is disabled. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint.",
  "claude": { "allowed-tools": "Read AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint. Execute workflow `.asd/workflows/asd-phase-audit.md`.
