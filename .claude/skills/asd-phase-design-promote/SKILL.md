---
# ASD generated. Edit .asd/skills/asd-phase-design-promote/SKILL.md. source_digest=sha256:1cd6282690f9b5ac51c8ba77e1ae86a6d6b9ffc7d97f1b2b9be09a4b383554f9 content_digest=sha256:5dc02cb2f71dbd0d909dc9871d87cce5b664b930c191bcfc3ddecfcf167000c1 asd_version=1.1.0 schema=1
name: asd-phase-design-promote
description: "Runs the ASD design-promote phase: asd-pm orchestrates user-approved per-subsystem decomposition, then only the domain creators (asd-architect, asd-ba, asd-ux-designer) whose sprint draft is actually in scope this sprint promote to persistent design/ in parallel, gated by a final user confirmation — no-op when nothing is in scope to promote. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint."
allowed-tools: "Read AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
