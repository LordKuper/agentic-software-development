---
# ASD generated. Edit .asd/skills/asd-phase-impl/SKILL.md. source_digest=sha256:57af24d0e8e9744411743115cf079deeef7104835649877f618f2162bb0f4f4a content_digest=sha256:1800c18926c29044b07f3bcbcebb95b58a3bb786fb9cd4f1981f7853b7f672a0 asd_version=1.1.0 schema=1
name: asd-phase-impl
description: "Runs the ASD impl phase in one of three modes detected from state.json: initial mode dispatches plan.md Task blocks to devs, review-fix mode resolves impl-review findings, test-fix mode resolves code defects found by impl-test. Devs write production code only (no tests), run build/lint, and commit; the phase enforces a build+lint completion gate before COMPLETED and always routes to impl-test. Use when asd-sprint dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl.md`.
