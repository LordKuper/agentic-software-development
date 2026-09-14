---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 011-explicit-design-skip

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->
## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-test | Tester left its authored agent-memory write uncommitted | — |

## F-1 — Tester left its authored agent-memory write uncommitted

- **Phase**: impl-test
- **Surface**: agent — `asd-tester-critical`
- **What happened**: The tester committed its tests and `test-plan.md` but left its own edit to `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md` unstaged, although `git-strategy.md` "Commit before review" requires a dispatched agent holding a commit tool to commit every path it authored.
- **Impact**: The orchestrator had to commit the file at phase exit so the impl-review clean-worktree precondition holds; one extra check-and-commit round.
- **Refs**: —
