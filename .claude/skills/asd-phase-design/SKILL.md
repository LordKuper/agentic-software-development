---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:395973314485206ddfb9d87a9e451188ee157fdee88234e01176e761bf6c113e content_digest=sha256:60516b6be9b66c6b0130b6e4642be36129c6c731b304fc6a382a1e5d23a1825f asd_version=3.1.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint: dispatches creators sequentially, one per document independently enabled via documents.* (asd-ba for prd.html, a design-system gate only if ux_spec enabled, asd-ux for ux-spec.html, asd-architect for adr.html and c4-full/) — when every document is disabled, one deterministic check collapses design/design-review/design-promote into a single no-op write (phase=design-promote, NEXT=plan), and neither of the other two phases is dispatched separately. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
allowed-tools: "Read Write Edit Glob AskUserQuestion Task Skill"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint. Execute workflow `.asd/workflows/asd-phase-design.md`.
