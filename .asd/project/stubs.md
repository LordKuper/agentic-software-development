---
responsibility:
  owns: project-global registry of CURRENTLY OPEN todo stubs across all sprints
  excludes: code review issues, plan tasks, design todos, resolved stubs (deleted on resolution)
  delegates_to: reviews/ (code issues), plan.md (tasks), decisions-log (audit trail of resolutions)
---

# Stubs

Only OPEN stubs. Resolved stubs deleted immediately. Migrated stubs deleted from prior sprint and re-registered under the new sprint. Accepted-debt entries kept; their Reason field MUST begin with `(accepted-debt)` so the pr-phase block exempts them.

Persists across sprint archival.

| Sprint | File:Line | Reason | Owner |
|---|---|---|---|
| 004-review-scoping-and-test-audit | `.claude/agent-memory/asd-reviewer-performance/` | (accepted-debt) leftover agent-memory dir for a reviewer retired this sprint (merged into asd-reviewer-efficiency); agent-memory is per-agent private state outside `.asd/` canon, outside the dev's write scope, and outside AC-15's grep surface — no automated migration path exists | asd-dev |
| 004-review-scoping-and-test-audit | `.claude/agent-memory/asd-pm/feedback_flag-gate-semantics-before-applying.md` | (accepted-debt) memory entry referencing the retired `scoped_fan_out` agent-level dispatch skip semantics; same out-of-scope reasoning as the row above | asd-dev |
