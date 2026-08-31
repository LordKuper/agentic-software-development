---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:f6b100afda8ea1488f145b8941dc98adfb98ff78d01adc39be1886bcd6f3cac4 content_digest=sha256:5fc1625e200d2827cf5676695abc68c8985be31faa79c22b9da8ebedfd4ae34f asd_version=1.1.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met: dispatches asd-reviewer-documentation, asd-reviewer-ui, asd-reviewer-simplification (and asd-external-review when enabled) in parallel against the sprint design drafts, aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
