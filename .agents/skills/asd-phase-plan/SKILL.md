---
# ASD generated. Edit .asd/skills/asd-phase-plan/SKILL.md. source_digest=sha256:8088e619c115e018ebefccc1f9cb905cdffde6c8cf5dca60d129cbdeac8128ea content_digest=sha256:9cd12a8a4c415311af7b28289aebef2a7ece4fc55150c3a2e4c59acf5e786e08 asd_version=1.1.0 schema=1
name: asd-phase-plan
description: "Runs the ASD plan phase: dispatches asd-pm to author plan.md from the sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to PRD acceptance criteria. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
