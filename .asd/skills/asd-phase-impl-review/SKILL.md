---
{
  "name": "asd-phase-impl-review",
  "description": "Runs the ASD impl-review phase iteratively until DoD met: always dispatches four internal reviewers (correctness, efficiency, testing, documentation — and asd-external-review when enabled) in parallel against the sprint's code and tests, degrading a diff-derived rubric section to n/a inside correctness/efficiency rather than skipping either agent, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Once every reviewer is APPROVE/latched, dispatches asd-tester for the cycle's one full-suite run; green completes to pr, red exits to impl (test-fix mode) and clears every APPROVE latch. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit Bash AskUserQuestion Task" },
  "codex": {}
}
---

Triggers when the sprint orchestrator dispatches the impl-review phase, or when the user explicitly asks to run or re-run impl-review for the active sprint. Execute workflow `.asd/workflows/asd-phase-impl-review.md`.
