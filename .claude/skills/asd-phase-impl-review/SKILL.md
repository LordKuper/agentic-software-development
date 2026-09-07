---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:5dc26aac3ec3ad85dca4d696b37300fb78c5af9efa51aac766e78acaf4f2c69e content_digest=sha256:e33222bdb0c8fe136a70aa2c2a89bb1f8efb5ec6648f2046d19c705e0518fa64 asd_version=5.0.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: always dispatches four internal reviewers (correctness, efficiency, testing, documentation — and asd-external-review when enabled) in parallel against the sprint's code and tests, degrading a diff-derived rubric section to n/a inside correctness/efficiency rather than skipping either agent, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Once every reviewer is APPROVE/latched, dispatches asd-tester for the cycle's one full-suite run; green completes to retro, red exits to impl (test-fix mode) and clears every APPROVE latch. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
allowed-tools: "Read Write Edit Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-review phase, or when the user explicitly asks to run or re-run impl-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
