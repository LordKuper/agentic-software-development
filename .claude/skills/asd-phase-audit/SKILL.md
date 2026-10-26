---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:0ee2ef71d4625cbbf95b1799f6c7bf54dd8be488814676a05eac491c9cbd454b content_digest=sha256:ddfd3132609eb814cdee529e702ce2b68ff49b969e0d5fddc82aba1e3601d853 asd_version=13.10.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: the main orchestrator scans code and documentation itself and resolves product/domain ambiguity its sources can settle, then gates audit.md. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task Bash(node .asd/runtime.js:*)"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-audit.md`.
