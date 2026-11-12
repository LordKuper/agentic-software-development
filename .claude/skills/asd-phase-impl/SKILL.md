---
# ASD generated. Edit .asd/skills/asd-phase-impl/SKILL.md. source_digest=sha256:c8bce7678c68dbed3b828279b1d83033f6dc832c934beeb0415eaa7092575f89 content_digest=sha256:4032defbc95bf3082f7069ef58c3db83628ff57a9fcfc6396a968080f9547ac9 asd_version=14.5.0 schema=1
name: asd-phase-impl
description: "Runs the ASD impl phase in one of three modes detected from state.json: initial mode dispatches plan.md Task blocks to devs, review-fix mode resolves impl-review findings, test-fix mode resolves code defects found by impl-test. Devs write production code only (no tests; a plan-declared Test-only Task goes to asd-tester instead), run build/lint, and commit; the phase enforces a build+lint completion gate before COMPLETED and always routes to impl-test. Use when asd-sprint dispatches the impl phase, or when the user explicitly asks to run or re-run impl for the active sprint."
allowed-tools: "Read Write Edit Glob Grep Bash AskUserQuestion Task Skill"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-impl.md`.
