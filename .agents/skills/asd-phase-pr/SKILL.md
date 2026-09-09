---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:49e18f17eb18417dbe85120f9743c6763a753fab337b06e2646b40a22eb9d6bd content_digest=sha256:e5a39d624e00fa4264ff1e52be389ae43f58b6259651816056021f71297bc273 asd_version=7.1.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: the phase orchestrator verifies DoD, handles PR and merge recovery, then requires explicit closure approval before finalization and archival. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-pr.md`.
