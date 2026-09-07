---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:89799247fdfa0e6d0ea1275e467f2d9f2121f271c454177a99370025dc651e62 content_digest=sha256:c22f3150d4c40ef80e35adec82ea6fbe178cbf8157882b1ee68cdc6cacda3787 asd_version=5.0.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: Architect scans code and documentation; BA joins only for material product/domain ambiguity. The phase orchestrator merges and gates audit.md. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint. Execute workflow `.asd/workflows/asd-phase-audit.md`.
