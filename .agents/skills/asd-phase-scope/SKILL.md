---
# ASD generated. Edit .asd/skills/asd-phase-scope/SKILL.md. source_digest=sha256:3402aeb17b410578797ee5abc09a44388149f25ac14c8fd70451f0f80fb5051b content_digest=sha256:c5c233ac1603382481639935693d1804bea5ac2686afc6342947a4b4ada91252 asd_version=3.0.0 schema=1
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: creates the sprint folder, state.json, and git branch, then dispatches asd-pm to refine the raw user scope into a sprint.md accepted via write-then-review-accept (write, then user replies accept). Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint. Execute workflow `.asd/workflows/asd-phase-scope.md`.
