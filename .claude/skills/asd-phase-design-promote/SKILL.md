---
# ASD generated. Edit .asd/skills/asd-phase-design-promote/SKILL.md. source_digest=sha256:f9c8e7303f928cb6a4110f0d8d69330267a48603073f8be531fded88cbcdcc84 content_digest=sha256:8c30cce643e5c98aa0f16735be85cdc4bc116bb793d68192149d0f2f7a93bc03 asd_version=2.0.0 schema=1
name: asd-phase-design-promote
description: "Runs the ASD design-promote phase: asd-pm orchestrates user-approved per-subsystem decomposition, then only the domain creators (asd-architect, asd-ba, asd-ux-designer) whose sprint draft is actually in scope this sprint promote to persistent docs/ in parallel, gated by a final user confirmation. Never dispatched at all when every documents.* is disabled — the design phase's collapsed no-op check (Task 14) already advanced past it to plan; this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
