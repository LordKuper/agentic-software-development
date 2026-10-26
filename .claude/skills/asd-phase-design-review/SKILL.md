---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:317e0201fd7f3c61c47472cc61dd836264ca626f82727af243c699442037e353 content_digest=sha256:e2ea71b6c4851584beb8b52f88821fe2c83719738e58b006a3ca67cdc8f980b0 asd_version=13.10.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: always dispatches asd-reviewer-quality + asd-reviewer-efficiency for any non-empty draft set (and asd-external-review when enabled) — quality's UI section is n/a unless a ux-spec/design-system draft is in scope, never an agent-level skip — aggregates verdicts, fixes CONCERNS inline, and escalates FAIL to the user after an advisor consult. Never dispatched after a design-block collapse (every design documents.* disabled, effective c4 included); this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task Bash(node .asd/runtime.js:*)"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-design-review.md`.
