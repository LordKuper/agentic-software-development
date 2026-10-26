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
| F-1 | impl-test | tester opened a `suite` timing op with wrong flags; the first pre-strategy run went unbracketed | timing.jsonl |

## F-{{N}} — {{one-line problem}}

- **Phase**: {{phase the friction arose in}}
- **Surface**: {{rule | phase | gate | agent | skill | template | provider tool}} — {{exact path or id}}
- **What happened**: {{observed workflow behaviour}}
- **Impact**: {{what it cost — blocked work, rework, wrong artefact, extra round-trip}}
- **Refs**: {{id owned by an adjacent file when part of the problem lives there; otherwise —}}

## F-1 — tester opened a suite timing op with wrong flags

- **Phase**: impl-test
- **Surface**: provider tool — `node .asd/runtime.js timing`
- **What happened**: entry 2's tester passed wrong flags to the first `suite` op open; timing warned and exited 0, so the pre-strategy run went unrecorded and was re-run bracketed as `suite impl-test#2a`.
- **Impact**: one extra full-suite run; one unbracketed run missing from the timing ledger.
- **Refs**: —
