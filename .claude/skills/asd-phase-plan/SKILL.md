---
# ASD generated. Edit .asd/skills/asd-phase-plan/SKILL.md. source_digest=sha256:1b1b2cf4f668081e92480faeb1b93c9c8bee48e2097777726c5581bbcfbc5a92 content_digest=sha256:b9c8571496fa1d84906b984dae4c68b2be3e5086c7cea2b2ef3c9f6624a59b20 asd_version=5.0.0 schema=1
name: asd-phase-plan
description: "Runs the ASD plan phase: the phase orchestrator authors plan.md from sprint design docs, decomposing work into Task N sections with checkbox subtasks traced to acceptance criteria. Always runs, never no-op. Use when asd-sprint dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the plan phase, or when the user explicitly asks to run or re-run plan for the active sprint. Execute workflow `.asd/workflows/asd-phase-plan.md`.
