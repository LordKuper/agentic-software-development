---
# ASD generated. Edit .asd/skills/asd-phase-audit/SKILL.md. source_digest=sha256:e08e4505589ca00b04730d2f3f271c02386a7c6de049f82b122409b9de2744c3 content_digest=sha256:74e12d59fbc4c1c64be42c43a29e2cf0e833c49c93ef7883f2ec007f691e73ff asd_version=14.4.0 schema=1
name: asd-phase-audit
description: "Runs the ASD audit phase for the active sprint: the main orchestrator scans code and documentation itself (read-only `asd-scout` summaries allowed) and resolves product/domain ambiguity its sources can settle, then gates audit.md. Use when asd-sprint dispatches the audit phase, or when the user explicitly asks to run or re-run audit for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-audit.md`.
