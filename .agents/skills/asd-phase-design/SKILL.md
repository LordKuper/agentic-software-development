---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:395973314485206ddfb9d87a9e451188ee157fdee88234e01176e761bf6c113e content_digest=sha256:1b0bee62252d3f3779654c2b050d3f379029a61cf7fb3d9c5dc46f1706ae3d04 asd_version=3.1.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint: dispatches creators sequentially, one per document independently enabled via documents.* (asd-ba for prd.html, a design-system gate only if ux_spec enabled, asd-ux for ux-spec.html, asd-architect for adr.html and c4-full/) — when every document is disabled, one deterministic check collapses design/design-review/design-promote into a single no-op write (phase=design-promote, NEXT=plan), and neither of the other two phases is dispatched separately. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
