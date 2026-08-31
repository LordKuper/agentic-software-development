---
# ASD generated. Edit .asd/skills/asd-phase-impl-test/SKILL.md. source_digest=sha256:6f6cfb233540a8740f4047d13b644b52eb02ddb50c2992ad28cbc358b63daa9d content_digest=sha256:274038d061ebed42aea61a06b432222a132781688f13270701cb5e88ad8b601f asd_version=1.1.0 schema=1
name: asd-phase-impl-test
description: "Runs the ASD impl-test phase: dispatches asd-test-engineer to pick the test approach for the whole change scope after the code exists, prune redundant tests, author missing ones, and run the full suite. Green suite routes to impl-review; code defects are recorded in test-plan.md and route back to impl test-fix mode. Use when asd-sprint dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint."
allowed-tools: "Read Bash AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-test.md`.
