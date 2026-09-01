---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:d00d66e90d5d1bb7949246ddc4715e4010ddaf6754c13f96241377bdbf4e4c06 content_digest=sha256:1fce3ecff3b68c86e3ed3594b3c820e9c3b895c823e0916f97d0f23e4ff837c9 asd_version=2.0.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: dispatches asd-pm to verify the Definition of Done, compose+open (or prepare) the PR per git config, and archive the sprint folder onto the same branch, then on a later re-entry sets the terminal state once the PR is merged. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-pr.md`.
