---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:1ab09787f67a6f33db8c248bd1439ebf47372c82f1900278d65f0f4c35fa0eb8 content_digest=sha256:5edf8fdcf0d16d165617544cf5eeee31a475c6eae68c22078f35fe96f16fbfe0 asd_version=1.1.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint: dispatches creators sequentially per the precondition chain (asd-ba for prd.html, a design-system gate, asd-ux-designer for ux-spec.html, asd-architect for adr.html and optional c4-full/) to author sprint design drafts. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
