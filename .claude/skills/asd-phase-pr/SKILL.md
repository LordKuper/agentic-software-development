---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:49e18f17eb18417dbe85120f9743c6763a753fab337b06e2646b40a22eb9d6bd content_digest=sha256:a933a02e8cd3cf52777bea07924a3cabe10431eaa4c48934670538085247af95 asd_version=7.1.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: the phase orchestrator verifies DoD, handles PR and merge recovery, then requires explicit closure approval before finalization and archival. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
allowed-tools: "Read Glob Grep AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-pr.md`.
