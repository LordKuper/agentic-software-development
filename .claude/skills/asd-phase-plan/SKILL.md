---
# ASD generated. Edit .asd/skills/asd-phase-plan/SKILL.md. source_digest=sha256:4942831e185831c560e1fe4d16c7571f399e489372f427e8af58a97061e8d796 content_digest=sha256:4e14b881cf2d717021032b1a01202f28d20cc5e9b77999dde397b48a1919b942 asd_version=2.0.0 schema=1
name: asd-phase-plan
description: "Runs the ASD plan phase: dispatches asd-pm to author plan.md from the sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to acceptance criteria (PRD AC-N when documents.prd enabled, else sprint.md's own AC-N list). Always runs, never no-op. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
