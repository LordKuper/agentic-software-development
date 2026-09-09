---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:1546ffbcf7420fc9bd974f26857b4915dac363dcf86ae99ce2ac5e5fb6d431bf content_digest=sha256:7e5bc517918e580c72b24d5f49a8899dc82a7f521015bea12a2b45fa92f90c28 asd_version=7.1.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: always dispatches four internal reviewers (correctness, efficiency, testing, documentation — and asd-external-review when enabled) in parallel against the sprint's code and tests, degrading a diff-derived rubric section to n/a inside correctness/efficiency rather than skipping either agent, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Once every reviewer is APPROVE/latched, dispatches asd-tester for the cycle's one full-suite run; green completes to retro, red exits to impl (test-fix mode) and clears every APPROVE latch. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
