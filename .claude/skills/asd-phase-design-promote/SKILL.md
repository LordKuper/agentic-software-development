---
# ASD generated. Edit .asd/skills/asd-phase-design-promote/SKILL.md. source_digest=sha256:5a53a83d76caf176d16b1b912a106b3e64460827b8c8406a7fa9cbd25260bb2b content_digest=sha256:e388670d7bfe60efa7c16a100658fdc7add89bab68e1c9ac222e8d76d2fd03f9 asd_version=5.0.0 schema=1
name: asd-phase-design-promote
description: "Runs the ASD design-promote phase: the phase orchestrator handles decomposition and gates, then in-scope domain creators promote persistent docs. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
