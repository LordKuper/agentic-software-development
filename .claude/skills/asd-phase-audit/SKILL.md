---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:f495aa255be636331a1f6da41ec91df4cddfb65e421e4d7ac8125377fb3b37cc content_digest=sha256:851fb1ca529951fc55a9cf0838f372f185f232b4928f389b2076b9c9f073b260 asd_version=2.0.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: dispatches asd-ba to scan existing docs and asd-architect to scan existing code, merges findings into audit.md, then dispatches asd-pm for user approval — no-op (no dispatch, no approval gate) when the sprint's frozen documents.audit is disabled. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint. Execute workflow `.asd/workflows/asd-phase-audit.md`.
