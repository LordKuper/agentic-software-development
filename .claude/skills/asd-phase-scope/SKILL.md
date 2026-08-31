---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:3c7db8e48cf788a5e9ca59f12bba3e3173e5d5be9533da8606d20e50e7d2d1f1 content_digest=sha256:15b961169cdc6935dbaa02c13fa9c681fb5af95b50b4be46166c3715dbd8f53b asd_version=1.1.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: creates the sprint folder, state.json, and git branch, then dispatches asd-pm to refine the raw user scope into an approved sprint.md. Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
allowed-tools: "Read Glob Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-scope.md`.
