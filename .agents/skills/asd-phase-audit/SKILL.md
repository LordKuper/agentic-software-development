---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:0ee2ef71d4625cbbf95b1799f6c7bf54dd8be488814676a05eac491c9cbd454b content_digest=sha256:45ef65105e0e7aad4ea582a64b4c2bb7e4189364cb3667bc5a9053afaaf94e51 asd_version=13.10.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: the main orchestrator scans code and documentation itself and resolves product/domain ambiguity its sources can settle, then gates audit.md. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-audit.md`.
