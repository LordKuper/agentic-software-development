---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:97da02ce77a269a0e8acf8790d515589c2bb75ee87a627127c9ab8a57b41e3cc content_digest=sha256:a57194ffa36c9b4203e9d29c96326ba2a1bf045df39f23d464426d8d3fa0362e asd_version=1.1.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: dispatches asd-reviewer-documentation + asd-reviewer-simplification for any non-empty draft set, asd-reviewer-ui only when a ux-spec/design-system draft is in scope (and asd-external-review when enabled), aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation — no-op when no draft is in scope. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the design-review phase, or when the user explicitly asks to run or re-run design-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-design-review.md`.
