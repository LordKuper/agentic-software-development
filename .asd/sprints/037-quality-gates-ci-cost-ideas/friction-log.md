---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 037-quality-gates-ci-cost-ideas

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | `retro-candidates` rejects a retrospective whose Systemic proposals section has no table | — |

## F-1 — `retro-candidates` rejects a retrospective whose Systemic proposals section has no table

- **Phase**: scope
- **Surface**: skill — `.asd/runtime.js` `retroRows` against `.asd/workflows/asd-phase-retro.md` output
- **What happened**: Sprint 036's retro had zero systemic proposals and wrote the section as a "None." paragraph with no `<table>`; `retro-candidates` exits 2 with `retrospective systemic-proposals table has no tbody`. Neither the retro workflow nor `t_retrospective.html` states the zero-row shape.
- **Impact**: Retro intake is blocked for sprint 036's seven action rows until the user decides at the scope gate; the archived retrospective is immutable, so it cannot be repaired in place.
- **Refs**: —
