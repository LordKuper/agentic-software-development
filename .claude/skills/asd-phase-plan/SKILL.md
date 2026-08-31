---
# ASD generated. Edit .asd/skills/asd-phase-plan/SKILL.md. source_digest=sha256:8088e619c115e018ebefccc1f9cb905cdffde6c8cf5dca60d129cbdeac8128ea content_digest=sha256:e89163190ab282505ca365e0665e9e10e6dce292a5b612f72165dfb244f8fcac asd_version=1.1.0 schema=1
name: asd-phase-plan
description: "Runs the ASD plan phase: dispatches asd-pm to author plan.md from the sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to PRD acceptance criteria. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint."
allowed-tools: "Read AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
