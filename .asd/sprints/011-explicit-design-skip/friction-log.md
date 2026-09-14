---
responsibility:
  owns: sprint-scoped record of workflow malfunctions (F-N)
  excludes: code defects (test-plan.md D-N), review findings (reviews/), manual steps (manual-steps.md MS-N), decisions (decisions-log.md)
  delegates_to: retrospective.html (analysis)
---

# Friction Log

## F-1 — impl-test: tester left its authored agent-memory write uncommitted

- **Phase**: impl-test
- **What happened**: `asd-tester-critical` committed its tests and `test-plan.md` but left its own edit to `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md` unstaged, although `git-strategy.md` "Commit before review" requires a dispatched agent holding a commit tool to commit every path it authored. The orchestrator committed it at phase exit so the impl-review clean-worktree precondition could hold.
- **Evidence**: `git status --porcelain` after the tester returned, at HEAD 44f184c.
