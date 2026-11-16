---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:2d1f9c45dc4a88a6b9001baca727ab47e71a63a038dce71007c8aab847651cb2 content_digest=sha256:6d0b4cfa9ad9cc406d184c11f707f0caffa419b04e6286c04524a498d6b447b6 asd_version=14.5.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: the main orchestrator asks the user to choose the sprint workflow (standard or lite, frozen into state.json), creates the sprint folder, state.json and branch, runs staged solution design (requirements interview, its own best-practice research, approach choice into research.md), and refines scope under the active gate policy; at the retro intake it triages the project's own open GitHub issues in every project, and under self-hosting the open ASD retro issues too. Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-scope.md`.
