---
# ASD generated. Edit .asd/skills/asd-phase-impl/SKILL.md. source_digest=sha256:dfb8a174d37c0d7e9aade10e8c3e299d166c953758e6e5f748a94d0be630d725 content_digest=sha256:d6025dddd8adbaf741458a8aba12c1b3c6992e4490c7026a5232733cbb51116b asd_version=2.0.0 schema=1
name: asd-phase-impl
description: "Runs the ASD impl phase in one of three modes detected from state.json: initial mode dispatches plan.md Task blocks to devs, review-fix mode resolves impl-review findings, test-fix mode resolves code defects found by impl-test. Devs write production code only (no tests), run build/lint, and commit; the phase enforces a build+lint completion gate before COMPLETED and always routes to impl-test. Use when asd-sprint dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl.md`.
