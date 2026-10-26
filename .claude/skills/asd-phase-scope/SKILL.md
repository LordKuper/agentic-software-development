---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:3cc9b87ea63c0e35ed34a327eb8058fe11a21a9945ddeb7bf1f9cb74764e9847 content_digest=sha256:457621f80d5e4df4d8b8edead4f12068bdc736e92c3f20eea384446ac120b26d asd_version=13.10.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: the main orchestrator asks the user to choose the sprint workflow (standard or lite, frozen into state.json), creates the sprint folder, state.json and branch, runs staged solution design (requirements interview, its own best-practice research, approach choice into research.md), and refines scope under the active gate policy. Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
allowed-tools: "Read Glob Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-scope.md`.
