---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:a2f93e960ce949320387e2ab446cbef23c64be2cdf9500870a4f2da22c2cbe74 content_digest=sha256:a226a1768d22e8f155bf0657388688e146d0f804edd8032eebe07b901cf8d157 asd_version=7.1.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: always dispatches asd-reviewer-documentation + asd-reviewer-efficiency + asd-reviewer-correctness for any non-empty draft set (and asd-external-review when enabled) — correctness's UI section is n/a unless a ux-spec/design-system draft is in scope, never an agent-level skip — aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Never dispatched at all when every documents.* is disabled — the design phase's collapsed no-op check already advanced past it; this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-design-review.md`.
