---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:0cc859b30c3ac2ebad9b373368a9f189136001b6521e160bcc07ea14cc3d8166 content_digest=sha256:e53e58fe3eb7ea7663c2494efe2dcde86d5a1f9bdedaf7b6d274aba19c70f6c5 asd_version=1.1.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: dispatches asd-pm to verify the Definition of Done and compose+open (or prepare) the PR per git config, then on a later re-entry archives the sprint folder once the PR is merged. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-pr.md`.
