---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:95a7b432aa17e331d7d744bda1f2e2dfd502d5cbfa80a9237432d6d6f503b523 content_digest=sha256:025834e24e9fe6677009f37454cfd7ab4b85c8b5ca45dca964fc6f3607d7f2e5 asd_version=5.0.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: the phase orchestrator creates the sprint folder, state.json, branch, and refined scope under the active gate policy. Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
allowed-tools: "Read Glob Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-scope.md`.
