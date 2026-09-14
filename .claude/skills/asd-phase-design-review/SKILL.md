---
# ASD generated. Edit .asd/skills/asd-phase-design-review/SKILL.md. source_digest=sha256:367fa12c3530d84f93ec2bb7dde1e548f47369bb5070d48853dc6ac2bbcf4c33 content_digest=sha256:8fc00dda640eb8490d8765095e9ee6419537cd2a9add86111a0599738872e644 asd_version=7.2.0 schema=1
name: asd-phase-design-review
description: "Runs the ASD design-review phase iteratively until DoD met, scoped to whichever drafts documents.* actually enabled this sprint: always dispatches asd-reviewer-documentation + asd-reviewer-efficiency + asd-reviewer-correctness for any non-empty draft set (and asd-external-review when enabled) — correctness's UI section is n/a unless a ux-spec/design-system draft is in scope, never an agent-level skip — aggregates verdicts, and routes CONCERNS to creator autofix or FAIL to user escalation. Never dispatched after a design-block collapse (skip_design_phases enabled, or every design documents.* disabled); this phase's own no-op path is only a defensive fallback for a direct/explicit re-dispatch. Use when asd-sprint dispatches design-review, or when the user explicitly asks to run or re-run design-review for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-design-review.md`.
