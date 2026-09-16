---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 014-glings-retro-002-remediation

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | audit | Canon disagrees on when External Review's availability skip applies | decisions-log.md 2026-09-16 audit contradiction |

## F-1 — Canon disagrees on when External Review's availability skip applies

- **Phase**: audit
- **Surface**: rule — `.asd/rules/sprint-lifecycle.md:68,344`, `.asd/workflows/asd-phase-impl-review.md:47`, `.asd/workflows/asd-phase-design-review.md:41` vs `.asd/rules/external-review.md:47`, `.asd/agents/asd-external-review.md:105,116`
- **What happened**: The first group scopes the skip to a non-ready preflight or an active negative cache. The second also returns it for a crash, hang, timeout, unusable output or exhausted retry after invocation. Two canonical sources, so precedence could not settle it.
- **Impact**: A hard user decision was needed before the audit gate, and AC-1 now also has to narrow the external-review contract.
- **Refs**: —
