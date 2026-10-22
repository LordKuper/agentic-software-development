---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 027-staged-design-retro-intake

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | external reviewer emitted a `| - | - | - | none | - |` placeholder row on APPROVE; persist-review rejected it | reviews/impl/wave-1/iter-02/external |

## F-{{N}} — {{one-line problem}}

- **Phase**: {{phase the friction arose in}}
- **Surface**: {{rule | phase | gate | agent | skill | template | provider tool}} — {{exact path or id}}
- **What happened**: {{observed workflow behaviour}}
- **Impact**: {{what it cost — blocked work, rework, wrong artefact, extra round-trip}}
- **Refs**: {{id owned by an adjacent file when part of the problem lives there; otherwise —}}

## F-1 — external reviewer emitted a placeholder findings row on APPROVE; persist-review rejected it

- **Phase**: impl-review
- **Surface**: agent — `.asd/agents/asd-external-review.md`; template `external-review/t_review-report.md`; rule `review-policy.md` "Gate Verdict Format" (AC-8)
- **What happened**: wave-1/iter-02 APPROVE return carried `| - | - | - | none | - |`; persist-review exited 2 (severity must be low..critical). The orchestrator transcribed it (row removed) and persisted, instead of the step 7a re-dispatch the workflow names for an External Review exit 2.
- **Impact**: one transcription; the AC-8 empty-table rule does not reach the wrapper's own acting text, so the wrapper still invents a placeholder.
- **Refs**: reviews/impl/wave-1/iter-02/external
