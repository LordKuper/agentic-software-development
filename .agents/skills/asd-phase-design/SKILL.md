---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:bb47025cf3c99aed393cc6692c208f29c73f2f15f59a5ad2b2ebf654a6ab588d content_digest=sha256:2b0a2df6020bacb4b7828d425846cddbdaf380cf1ba979c2c7e377bdad99252a asd_version=13.10.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint (standard workflow only; lite has no design phase): the main orchestrator drafts inline, section by section with lock-in, each document independently enabled via documents.* (prd.html, ux-spec.html if ux_spec enabled, adr.html, c4-full/) and runs the design-system gate only if design_system is enabled — when every document is disabled, one deterministic check collapses design/design-review/design-promote into a single no-op write (phase=design-promote, NEXT=plan), and neither of the other two phases is dispatched separately. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-design.md`.
