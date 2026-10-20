---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint {{SPRINT_ID}}

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | route-task rejected two inputs before its required evidence fields were known | — |
| F-2 | impl-review | combined reviewer wrote a placeholder `none` row in an empty findings table; persist-review rejected it | reviews/impl/wave-1/iter-02/combined |

## F-1 — route-task rejected two inputs before its required evidence fields were known

- **Phase**: impl
- **Surface**: rule — `.asd/rules/providers.md` "Task-class variants and routing"; `.asd/runtime.js` `routeTask`
- **What happened**: the orchestrator built `route-task` input from the prose (kind + risks); the runtime answered `routing kind invalid` (kind must be command|mechanical|standard) and then `routing evidence incomplete` (objectiveInputs, failedObjectiveCheck, checks, correctionAttempts required). Neither the required keys nor the kind enum are stated in the rule.
- **Impact**: two extra round-trips per new session before the first dispatch.
- **Refs**: —

## F-2 — combined reviewer wrote a placeholder `none` row in an empty findings table; persist-review rejected it

- **Phase**: impl-review
- **Surface**: agent — `.asd/agents/asd-reviewer-combined.md`; template `t_review.md` findings table
- **What happened**: an APPROVE return carried a `| none | - | - |` row; `persist-review` exited 2 (severity must be low..critical). One transcription (row removed) passed, per `review-policy.md` "Coverage ledger" enforcement.
- **Impact**: one transcription and re-run; an empty-table convention is not stated where the reviewer reads it.
- **Refs**: reviews/impl/wave-1/iter-02/combined
