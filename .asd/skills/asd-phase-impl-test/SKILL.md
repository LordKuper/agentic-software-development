---
{
  "name": "asd-phase-impl-test",
  "description": "Runs the ASD impl-test phase: dispatches asd-test-engineer to pick the test approach for the whole change scope after the code exists, prune redundant tests, author missing ones, and run the full suite. Green suite routes to impl-review; code defects are recorded in test-plan.md and route back to impl test-fix mode. Use when asd-sprint dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit Bash AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-test.md`.
