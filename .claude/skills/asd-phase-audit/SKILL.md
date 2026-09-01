---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:05387f8dc726b653f2155a5232e303f7d18f555406b67b16d15265ca10f290f2 content_digest=sha256:9ac9a81976d6cd43f859e3b21c0f7c6b8ac3531022deefe72297480167018244 asd_version=1.1.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: dispatches asd-ba to scan existing docs and asd-architect to scan existing code, merges findings into audit.md, then dispatches asd-pm for user approval — no-op (no dispatch, no approval gate) when the sprint's frozen documents.audit is disabled. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
allowed-tools: "Read AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint. Execute workflow `.asd/workflows/asd-phase-audit.md`.
