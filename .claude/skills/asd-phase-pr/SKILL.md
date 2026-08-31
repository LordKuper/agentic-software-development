---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:0cc859b30c3ac2ebad9b373368a9f189136001b6521e160bcc07ea14cc3d8166 content_digest=sha256:ac573af92ff69d9ca55c1311b03cf70c640cf9c82f274b0140f1aafebb9f6b99 asd_version=1.1.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: dispatches asd-pm to verify the Definition of Done and compose+open (or prepare) the PR per git config, then on a later re-entry archives the sprint folder once the PR is merged. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
allowed-tools: "Read Glob Grep AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-pr.md`.
