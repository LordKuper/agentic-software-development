---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 013-stalemate-proof-guardrails

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Both wave-1 critical dev dispatches terminated by host rate limit before any edit | — |
| F-2 | impl | Wave-2 Task 2 dev dispatch stalled 600s twice with no edit and no signal | — |

## F-1 — Both wave-1 critical dev dispatches terminated by host rate limit before any edit

- **Phase**: impl
- **Surface**: provider tool — Claude Code subagent dispatch (`asd-dev-critical`, HTTP 429 session limit)
- **What happened**: Tasks 1 and 5 were dispatched concurrently on the critical tier; both agents died on the session usage limit with no file written and no signal returned. The workflow has no rule for a dispatch lost to a host limit, so the orchestrator re-dispatched from a clean tree.
- **Impact**: One lost wave round-trip; re-dispatch of both tasks.
- **Refs**: —

## F-2 — Wave-2 Task 2 dev dispatch stalled 600s twice with no edit and no signal

- **Phase**: impl
- **Surface**: provider tool — Claude Code subagent dispatch (`asd-dev`, stream watchdog timeout)
- **What happened**: The standard-tier Task 2 dispatch stopped making progress and was killed by the host watchdog after 600s, having written nothing. As in F-1, no rule covers a dispatch lost without a signal; the orchestrator checked the worktree and re-dispatched fresh.
- **Impact**: Wave 2 held open for two extra dispatches; the fresh standard-tier retry stalled identically, so Task 2 was raised to the critical tier for a third dispatch.
- **Refs**: —
