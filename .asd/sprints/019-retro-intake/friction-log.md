---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 019-retro-intake

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | A plan subtask assigned an orchestrator-only memory-fix inside a dev Task, so no one ran it | D-2 |
| F-2 | impl | No rule says who sets a memory-fix `D-N` row to `fixed` | D-1, D-2 |

## F-1 — A plan subtask assigned an orchestrator-only memory-fix inside a dev Task, so no one ran it

- **Phase**: impl
- **Surface**: phase — `.asd/workflows/asd-phase-impl.md` initial mode; `plan.md` Task 6
- **What happened**: Task 6 listed the reviewer-documentation memory file as "orchestrator applies the owner-approved text". Initial mode dispatches Task blocks only to devs, and the Task 6 payload excluded that file, so the memory-fix dispatch never ran. The Task was ticked, and impl-test entry 1's leftover-term sweep caught the gap.
- **Impact**: one extra impl ⇄ impl-test round.
- **Refs**: D-2

## F-2 — No rule says who sets a memory-fix `D-N` row to `fixed`

- **Phase**: impl (test-fix)
- **Surface**: rule — `.asd/rules/review-policy.md` "Autofix vs escalation" Memory-fix dispatch; `.asd/rules/artifact-layout.md` "Test plan"
- **What happened**: D-1 and D-2 were reviewer-owned memory defects, so the owners returned text and the orchestrator applied it. Test-fix requires the fixing agent to set the `Defects` row `Status` to `fixed` with its commit, but no dev fixed these rows and the orchestrator holds no grant on `test-plan.md`. The orchestrator set both rows itself so the round could close.
- **Impact**: an ungranted orchestrator write to a Tester-owned artefact.
- **Refs**: D-1, D-2
