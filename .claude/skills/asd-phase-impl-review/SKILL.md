---
# ASD generated. Edit .asd/skills/asd-phase-impl-review/SKILL.md. source_digest=sha256:5a7ff3b6275e5a5c9810e14d7a4019c62fcd16aee6e3906747eb16beb5e0023d content_digest=sha256:6da1c008ce315ba544b5514c1bad01b60fb52ce81930c476c5992dc4690ce513 asd_version=13.10.0 schema=1
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: always dispatches the frozen workflow's impl roster in parallel (standard: quality, efficiency; lite: one combined reviewer; plus asd-external-review when enabled) against the sprint's code and tests, degrading a diff-derived rubric section to n/a rather than skipping an agent, reviews a large scope as up to 3 sequential review waves with a counter each, aggregates verdicts, fixes low-severity test-only findings in place via asd-tester, and on other unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Once the last wave's reviewers are all APPROVE/latched, dispatches asd-tester for the cycle's one full-suite run; green completes to cleanup (standard) or design-promote (lite), red exits to impl (test-fix mode) and clears every APPROVE latch. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
allowed-tools: "Read Write Edit Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
