---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:3402aeb17b410578797ee5abc09a44388149f25ac14c8fd70451f0f80fb5051b content_digest=sha256:a5bad5720b1e461974f4f569ca0088fb720656a006d0cfefd6c73932aa9f83d7 asd_version=3.0.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: creates the sprint folder, state.json, and git branch, then dispatches asd-pm to refine the raw user scope into a sprint.md accepted via write-then-review-accept (write, then user replies accept). Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
allowed-tools: "Read Glob Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-scope.md`.
