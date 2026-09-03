---
# ASD generated. Edit .asd/skills/asd-phase-impl-test/SKILL.md. source_digest=sha256:21e41bb90741941d0fc52daf651803e94708665c52da85712bf3c3f0bc88b37f content_digest=sha256:37d8fff8ae7cbcd989a3ccf435f555b8b65fd084152c96a7bf0f7d9d897a1261 asd_version=3.1.0 schema=1
name: asd-phase-impl-test
description: "Runs the ASD impl-test phase: dispatches asd-tester to pick the test approach for the whole change scope after the code exists, prune redundant tests, author missing ones, and run the full suite. Green suite routes to impl-review; code defects are recorded in test-plan.md and route back to impl test-fix mode. Use when asd-sprint dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-test.md`.
