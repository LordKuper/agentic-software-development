---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:f7d196c031ba7e02cb9663c62f1352756a57b31314054c45556c67bdcf5f2757 content_digest=sha256:726749caac81baada6e0cc7ae5e412945d25ae4d39408975c267d30c45c46086 asd_version=3.1.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: always dispatches four internal reviewers (correctness, efficiency, testing, documentation — and asd-external-review when enabled) in parallel against the sprint's code and tests, degrading a diff-derived rubric section to n/a inside correctness/efficiency rather than skipping either agent, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-review phase, or when the user explicitly asks to run or re-run impl-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
