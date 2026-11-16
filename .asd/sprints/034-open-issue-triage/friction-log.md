---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 034-open-issue-triage

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | `runtime.js timing` silently ignores unknown flags, so a mistyped attr flag records a dispatch op with no attrs | D-5 |
| F-2 | impl-test | tester dispatch payload named a commit trailer (`impl-test-1`) that departs from `git-strategy.md`'s tester trailer form | — |
| F-3 | impl | `timing` suite op `scope` attr accepts only `impacted`/`full`, so a `named` Suite run (combined-1 fix) cannot be timed as a suite op | reviews/impl/wave-1/iter-01/combined |
| F-4 | impl-review | External Review iteration-2 `findings` payload passed as a file pointer, not the inline set | reviews/impl/wave-1/iter-02/external |

## F-1 — `timing` silently ignores unknown flags

- **Phase**: impl
- **Surface**: provider tool — `.asd/runtime.js` `timing` flag parsing
- **What happened**: the orchestrator opened dispatch ops with `--attr agent=asd-dev` and `--agent asd-tester` (the flag is `--attrs`); both runs exited 0 with no error, the ops recorded without the `agent` attr (`impl-test-1` with `attrs: {}`).
- **Impact**: per-agent timing totals lose those dispatches; the gap surfaced only as the tester's AC-9 deviation.
- **Refs**: D-5

## F-2 — tester trailer in dispatch payload departs from the rule

- **Phase**: impl-test
- **Surface**: phase — `.asd/workflows/asd-phase-impl-test.md` step 1a dispatch payload
- **What happened**: the orchestrator's payload told the tester to use trailer `ASD-Task: impl-test-1`; the tester followed `git-strategy.md` (`ASD-Task: impl-test entry 1`) and flagged the departure.
- **Impact**: one flagged choice to resolve; no rework.
- **Refs**: —

## F-3 — suite op scope attr lacks `named`

- **Phase**: impl
- **Surface**: provider tool — `.asd/runtime.js` `timing` suite op `scope` attr
- **What happened**: the review-fix tester noted that a filtered run (Scope `named`, introduced by the combined-1 fix) cannot be recorded as a suite op, whose `scope` attr admits only `impacted` and `full`.
- **Impact**: named review-fix runs go untimed; no rework this sprint.
- **Refs**: reviews/impl/wave-1/iter-01/combined

## F-4 — External Review iteration-2 `findings` passed as a file pointer

- **Phase**: impl-review
- **Surface**: phase — `.asd/workflows/asd-phase-impl-review.md` step 6 External Review `findings` payload key
- **What happened**: the orchestrator passed the prior iteration's `external.findings.json` path instead of the inline finding set `external-review.md` "Stalemate detection" requires; the wrapper read it anyway and flagged the deviation.
- **Impact**: none on the verdict; a protocol deviation the payload shape did not prevent.
- **Refs**: reviews/impl/wave-1/iter-02/external
