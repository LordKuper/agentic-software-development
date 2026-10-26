---
# ASD generated. Edit .asd/skills/asd-phase-design-promote/SKILL.md. source_digest=sha256:4bf2fa7042334fc5358e6287eebb3d4b2a441bd211e781921c386d2c8983e291 content_digest=sha256:38ae7df9eb9ce6990293443b4a6d13803d40c5b7ea302a60453626835c31388e asd_version=13.10.0 schema=1
name: asd-phase-design-promote
description: "Runs the ASD design-promote phase: the main orchestrator handles decomposition and gates and promotes persistent docs itself — from approved drafts after design-review (standard workflow), or from the accepted implementation after impl-review with no draft and no review (lite workflow), where it runs before cleanup. Standard continues to plan. Use when asd-sprint dispatches design-promote, or when the user explicitly asks to run or re-run design-promote for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task Bash(node .asd/runtime.js:*)"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-design-promote.md`.
