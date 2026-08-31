---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:ea7d2eee45e4324bfe577a73f9bae68c469290c2338f828a06c4542bc4bb5af7 content_digest=sha256:5a3a317564613121db1f0b401a2fc2091b2101c49db21d3a7daee47dc32feb05 asd_version=1.1.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: dispatches asd-ba to scan existing docs and asd-architect to scan existing code, merges findings into audit.md, then dispatches asd-pm for user approval. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
allowed-tools: "Read AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint. Execute workflow `.asd/workflows/asd-phase-audit.md`.
