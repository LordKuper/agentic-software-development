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
| 006-workflow-cost-routing | tests/run.js:2296 | Only check for `runLocal`'s Windows `.cmd`/metacharacter PowerShell-fallback branch; guarded by `process.platform !== 'win32'` and prints an explicit skip on non-Windows hosts instead of silently passing. Preferred fix (extract invocation construction into a pure helper so the shape is assertable on any host) is production code in `.asd/runtime.js`, reported to impl as a production change request rather than done here. | asd-tester |
