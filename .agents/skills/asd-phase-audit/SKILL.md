---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:05387f8dc726b653f2155a5232e303f7d18f555406b67b16d15265ca10f290f2 content_digest=sha256:895e42416bcd8e1c1c67b257a82336f4f63ca80d03bc95d60b710f271162feb1 asd_version=1.1.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: dispatches asd-ba to scan existing docs and asd-architect to scan existing code, merges findings into audit.md, then dispatches asd-pm for user approval — no-op (no dispatch, no approval gate) when the sprint's frozen documents.audit is disabled. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint. Execute workflow `.asd/workflows/asd-phase-audit.md`.
