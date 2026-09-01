---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:c160a5999dcfc9fc5b4c8ae28a47ed54b1db50d66dcde6698230893dfcc09918 content_digest=sha256:9c8daf74b7452a3367d5318be3ab886f834d1cab7a0f6edd5f7abe12e6a191a0 asd_version=2.0.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: dispatches seven internal reviewers (and asd-external-review when enabled) in parallel against the sprint's code and tests, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-review phase, or when the user explicitly asks to run or re-run impl-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
