---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 033-retro-intake-model-choice

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | Host auto-mode classifier refused the gate-free triage close of a resolved issue | — |
| F-2 | scope | Two scope criteria were written undeliverable and caught only at audit | — |

## F-1 — Host auto-mode classifier refused the gate-free triage close of a resolved issue

- **Phase**: scope
- **Surface**: provider tool — Claude Code auto mode vs `asd-phase-scope.md` step 2a issue triage
- **What happened**: `gh issue close 89 … -r completed` was denied as an external system write; step 2a and `checkpoints.md` "Gate inventory" say triage closes take no gate, so the workflow has no step for asking host permission.
- **Impact**: One extra user round-trip at the scope gate to authorise all GitHub writes; closes and labels moved after the gate.
- **Refs**: —

## F-2 — Two scope criteria were written undeliverable and caught only at audit

- **Phase**: scope
- **Surface**: phase — `asd-phase-scope.md` step 2 (AC from retro rows and issues)
- **What happened**: AC-22 narrowed #93 to provider views the change surface already excludes, and AC-29 kept "plan-declared" for a change applied before any plan exists; step 2's HEAD re-verification checks a row is unresolved, not that the criterion drafted from it is deliverable.
- **Impact**: One hard audit-contradiction gate and a scope amendment (AC-35, AC-36).
- **Refs**: —
