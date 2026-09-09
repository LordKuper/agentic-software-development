---
# ASD generated. Edit .asd/skills/asd-phase-design/SKILL.md. source_digest=sha256:30c104f7de3c4c12a1635aaecb458b60d7d11d7a49a3649f22788fba2783dcdc content_digest=sha256:4b1c12f28edec73f79a93ed24f5df801cdf4479dc5e999052cfd2f187d10d00e asd_version=7.1.0 schema=1
name: asd-phase-design
description: "Runs the ASD design phase for the active sprint: dispatches creators sequentially, one per document independently enabled via documents.* (asd-ba for prd.html, a design-system gate only if ux_spec enabled, asd-ux for ux-spec.html, asd-architect for adr.html and c4-full/) — when every document is disabled, one deterministic check collapses design/design-review/design-promote into a single no-op write (phase=design-promote, NEXT=plan), and neither of the other two phases is dispatched separately. Use when asd-sprint dispatches the design phase, or when the user explicitly asks to run or re-run design for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-design.md`.
