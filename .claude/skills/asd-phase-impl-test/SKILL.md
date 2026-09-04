---
# ASD generated. Edit .asd/skills/asd-phase-impl-test/SKILL.md. source_digest=sha256:9d8b4de905f4b8feb1105e14ffe40476a8883d0738e2ddbc35d4b42fc3c257ec content_digest=sha256:e81bd5bf95b0547e3e86f755eef1bb94f4a596b8c1551150677bfafd20e1e477 asd_version=3.1.0 schema=1
name: asd-phase-impl-test
description: "Runs the ASD impl-test phase: dispatches asd-tester to run the existing impacted tests first, pick the test approach for the whole change scope after the code exists, prune redundant tests, author missing ones, and run the impacted set (never the full suite, which runs once at the end of impl-review) as its suite gate. Green routes to impl-review; code defects are recorded in test-plan.md and route back to impl test-fix mode. Use when asd-sprint dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint."
allowed-tools: "Read Write Edit Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-test.md`.
