---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 015-glings-retro-003-review-scope

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | Free-form scope collected via discrete-option prompt, took three round-trips | — |
| F-2 | impl-review | Documentation part-1 ledger omitted the `findings` key; passed after one transcription | reviews/impl/iter-01/documentation.part-1 |

## F-1 — Free-form scope collected via discrete-option prompt, took three round-trips

- **Phase**: scope
- **Surface**: skill — `.asd/skills/asd-sprint/SKILL.md` step 2A.3
- **What happened**: step 2A.3 says "Request user decision: confirm start; collect scope (free-form)", so scope was asked through an option prompt. The user picked an option without filling "Other", a second prompt followed, and the user then sent the scope as a separate chat message. This reproduces Glings retro 003 F-3.
- **Impact**: two extra round-trips before scope text arrived; carried as AC-7.
- **Refs**: —

## F-2 — Documentation part-1 ledger omitted the `findings` key

- **Phase**: impl-review
- **Surface**: agent — `asd-reviewer-documentation`
- **What happened**: The returned compact ledger had no `findings` array, so `validate-ledger` rejected it with "ledger findings invalid". The finding ids (D-1, D-2) were present in the return, so one transcription added the key and the ledger then validated.
- **Impact**: one extra transcription pass; no re-dispatch.
- **Refs**: reviews/impl/iter-01/documentation.part-1
