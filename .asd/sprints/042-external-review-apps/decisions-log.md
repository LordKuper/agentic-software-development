# Decisions log

## Entries

- 2026-11-27 — Workflow choice: user selected lite.
- 2026-11-27 — Approach: user required disabling connected apps for external Codex review at ASD level; enforce per invocation rather than modifying global Codex configuration.
- 2026-11-27 — Retro intake: user deferred 041-routerai-external-review#A-3 and #P-1; no open issues, open PRs or due stubs.
- 2026-11-27 — Scope accepted by the user's explicit instruction: disable connected apps for external Codex review as a mandatory ASD parameter.
- 2026-11-27 — User clarified that Claude Code can use Opus directly; leave external-review routes launched from Claude Code unchanged and apply the override to the Codex-host named-profile route.
- 2026-11-27 — Audit accepted adaptively: route, tests, documentation and CLI override behavior checked; no unresolved contradictions.
- 2026-11-27 — Plan accepted adaptively: explicit user requirement defines the route and boundary; exact route assertion identifies its test caller; sync build passed.
- 2026-11-27 — route Task 1: standard, dispatch HEAD 7ef4796d; risk change: public-contract.
- 2026-11-27 — Task 1 completed in 4a3762ca; sync hash refresh b84e0d70; build passed.
- 2026-11-27 — route Task 2: standard, dispatch HEAD b84e0d70.
- 2026-11-27 — Task 2 f7d40238: regression proof red against pre-fix runtime (missing override), green on current runtime; impacted runtime-routing 26/26.
- 2026-11-27 — Initial implementation assessment accepted adaptively: all tasks complete; sync, lint, context and agnix checks passed; no stubs introduced.
