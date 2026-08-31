---
# ASD generated. Edit .asd/skills/asd-phase-design-promote/SKILL.md. source_digest=sha256:51ee882701a32d2cce8f7804287d25729ca56960d420cb66441282943855e363 content_digest=sha256:dd90f763e10674779f0daa85bd0504913f3bbd1565fc4b8d820e9fd537bb475f asd_version=1.1.0 schema=1
name: asd-phase-design-promote
description: "Runs the ASD design-promote phase: asd-pm orchestrates user-approved per-subsystem decomposition, then asd-architect, asd-ba, and asd-ux-designer promote sprint drafts to persistent design/ in parallel, gated by a final user confirmation. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
