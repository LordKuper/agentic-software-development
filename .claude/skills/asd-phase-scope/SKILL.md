---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:55c2cc419af90b0c66b6350bdf4955b3fc305c8d93e599ae2ebc2f8117e5ebf9 content_digest=sha256:9635c8b05c5626671d09bc1d860acfd5d1afc73bd89e91985102218da7d93717 asd_version=7.1.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: the phase orchestrator creates the sprint folder, state.json, branch, and refined scope under the active gate policy. Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
allowed-tools: "Read Glob Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-scope.md`.
