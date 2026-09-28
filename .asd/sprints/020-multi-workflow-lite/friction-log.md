---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 020-multi-workflow-lite

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Per-task sync rule conflicts with parallel wave dispatch | — |

## F-1 — Per-task sync rule conflicts with parallel wave dispatch

- **Phase**: impl
- **Surface**: rule — `.asd/project/custom-coding-rules.md` (sync "in the same task before marking it done") vs `.asd/workflows/asd-phase-impl.md` step 6 (a wave's tasks dispatched concurrently in one worktree)
- **What happened**: Wave 2 had five concurrent Tasks, three of which edit canonical agents, skills or hooks. Every `sync.js --apply` rewrites the shared `.asd/sync-state.json`, so parallel per-task syncs race on one file. No rule says who syncs when a wave is parallel, so the orchestrator deferred every sync to the final Task.
- **Impact**: The impl `build` gate (`sync.js --check`) is red until the last wave. One orchestrator decision was needed that no rule anticipates.
- **Refs**: —
