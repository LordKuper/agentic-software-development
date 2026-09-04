---
# ASD generated. Edit .asd/skills/asd-phase-design-promote/SKILL.md. source_digest=sha256:6cd9dbc6d917ccaac31fc9de7f30719ef8a924dfeb5115f155c7f79d27fa7ad8 content_digest=sha256:d19aa71c5e5d49071ba9cd7fe102ac1c05b88e73645bfd67b57f61f48a24fcb2 asd_version=3.1.0 schema=1
name: asd-phase-design-promote
description: "Runs the ASD design-promote phase: asd-pm orchestrates user-approved per-subsystem decomposition and new-subsystem approvals, then only the domain creators (asd-architect, asd-ba, asd-ux) whose sprint draft is actually in scope this sprint promote to persistent docs/ in parallel, with no final confirmation gate — the workflow itself writes decisions-log entries and state.json then posts a non-blocking post-promotion summary. Never dispatched at all when every documents.* is disabled — the design phase's collapsed no-op check already advanced past it to plan; this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-promote phase, or when the user explicitly asks to run or re-run design-promote for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
