---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:c0ec84909d8e9be746836cf46d208d93e4d567fe887fbf064a7609485538d7b9 content_digest=sha256:13a2ca5db6d9e1ac82c07298bcc32940325de28fc52e129d57956484c51de9d0 asd_version=1.1.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: dispatches seven internal reviewers (and asd-external-review when enabled) in parallel against the sprint's code and tests, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-review phase, or when the user explicitly asks to run or re-run impl-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
