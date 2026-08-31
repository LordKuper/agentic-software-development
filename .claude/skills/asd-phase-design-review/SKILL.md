---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:f6b100afda8ea1488f145b8941dc98adfb98ff78d01adc39be1886bcd6f3cac4 content_digest=sha256:5535c1d0b55cd1bebb529a84331ed33eedc1b61d601bf2bd08a253f242843749 asd_version=1.1.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met: dispatches asd-reviewer-documentation, asd-reviewer-ui, asd-reviewer-simplification (and asd-external-review when enabled) in parallel against the sprint design drafts, aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
