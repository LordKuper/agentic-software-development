---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:47346b2b04e19868ba3a726def827f11d8e3709f8f33285a3b0c1c9c264b4660 content_digest=sha256:35576cafa41c2574f6af900b00db6245ee49df7455c88dbef0209c5b0e6a2fb5 asd_version=13.3.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: the phase orchestrator verifies DoD, opens the sprint PR and later merges it, then hands closure back to asd-sprint; it never archives or marks the sprint done. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
allowed-tools: "Read Glob Grep AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-pr.md`.
