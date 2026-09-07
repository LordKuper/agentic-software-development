---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:d93ccdb9ff9fbfb13e3fa92e64f36a453b51f2db03e52781d6cacd88b19e8b97 content_digest=sha256:1e2d1ca1f2a0ee34b6e378ac4cba854f2bc4d39bb7c2144c40cf1ade19567c41 asd_version=5.0.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: the phase orchestrator verifies DoD, handles PR and merge recovery, then requires explicit closure approval before finalization and archival. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-pr.md`.
