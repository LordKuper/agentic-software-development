---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:2542c8fa06f4afb9eba4e54e0b4240a23ab181daa63cc095cc0a9cd8afd2b130 content_digest=sha256:0018d18d8677f8967fc40ebe5b58bbf980ff7829fdf57d89bd328d37f0ffdc8c asd_version=12.0.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: always dispatches four internal reviewers (correctness, efficiency, testing, documentation — and asd-external-review when enabled) in parallel against the sprint's code and tests, degrading a diff-derived rubric section to n/a inside correctness/efficiency rather than skipping either agent, reviews a large scope as up to 3 sequential review waves with a counter each, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Once the last wave's reviewers are all APPROVE/latched, dispatches asd-tester for the cycle's one full-suite run; green completes to retro, red exits to impl (test-fix mode) and clears every APPROVE latch. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
allowed-tools: "Read Write Edit Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
