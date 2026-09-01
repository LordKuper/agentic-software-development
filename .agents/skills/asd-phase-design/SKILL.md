---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:66dbd5837838fe7218327d0f630803f8d08f3203bcba82af11a10d3aab78618d content_digest=sha256:49e4e69e93434c65d5eddffc2dc0ad817bfc5735ee035afa7b7aece99718fbc1 asd_version=1.1.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint: dispatches creators sequentially, one per document independently enabled via documents.* (asd-ba for prd.html, a design-system gate only if ux_spec enabled, asd-ux-designer for ux-spec.html, asd-architect for adr.html and c4-full/) — no-op when every document is disabled. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
