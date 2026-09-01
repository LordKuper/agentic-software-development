---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:5a0d749ebf5774bef83ea2954a235953e75f9894564a3de6a54c3ba8c553ea8d content_digest=sha256:01a8b2b4587fc27c6a3a0c56f0cea70f28183ab2b21e032ca0520ce68fc0e221 asd_version=2.0.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint: dispatches creators sequentially, one per document independently enabled via documents.* (asd-ba for prd.html, a design-system gate only if ux_spec enabled, asd-ux-designer for ux-spec.html, asd-architect for adr.html and c4-full/) — when every document is disabled, one deterministic check collapses design/design-review/design-promote into a single no-op write (phase=design-promote, NEXT=plan), and neither of the other two phases is dispatched separately. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
