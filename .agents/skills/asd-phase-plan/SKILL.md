---
# ASD generated. Edit .asd/skills/asd-phase-plan/SKILL.md. source_digest=sha256:ff5a3777d1b2189e6261e66b89eac65a272cdfd1774b395cad883ef6e084107d content_digest=sha256:4b78754d7ebb045322f6ff49ccd664ae74629e4203b1d0070d3e336548ec0eda asd_version=1.1.0 schema=1
name: asd-phase-plan
description: "Runs the ASD plan phase: dispatches asd-pm to author plan.md from the sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to acceptance criteria (PRD AC-N when documents.prd enabled, else sprint.md's own AC-N list). Always runs, never no-op. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
