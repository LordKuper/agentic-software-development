---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 036-codex-sol-6-2

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | `agent-liveness` reports STALL for dev agents that already returned COMPLETED | — |

## F-1 — `agent-liveness` reports STALL for dev agents that already returned COMPLETED

- **Phase**: impl
- **Surface**: provider tool — `.asd/runtime.js` `agentLiveness` / `transcriptProgress`
- **What happened**: Task 1 and all five wave-2 `asd-dev` dispatches returned COMPLETED via a subagent hand-back within minutes; each Monitor-run `agent-liveness --interval 300` later printed `STALL <id> no-progress` for every one of them. The transcript of a finished agent stops growing, and `transcriptProgress` did not mark it done.
- **Impact**: six false stall events; the orchestrator had to recognise them as benign by hand. A stall acted on literally would `TaskStop` a finished agent and trigger a needless failed-dispatch reconstruction. AC-14 covers reviewers with a return file only; creator dispatches that return in chat are still exposed.
- **Refs**: —
