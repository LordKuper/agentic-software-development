---
# ASD generated. Edit .asd/skills/asd-phase-plan/SKILL.md. source_digest=sha256:1b1b2cf4f668081e92480faeb1b93c9c8bee48e2097777726c5581bbcfbc5a92 content_digest=sha256:297d81d4caa078848a0bf1653d53ad7fada19d2248b3391d61030bddebb3c1a7 asd_version=5.0.0 schema=1
name: asd-phase-plan
description: "Runs the ASD plan phase: the phase orchestrator authors plan.md from sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to acceptance criteria. Always runs, never no-op. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
