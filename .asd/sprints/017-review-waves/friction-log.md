---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 017-review-waves

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | External Review CLI unavailable in the cloud container | reviews/impl/wave-1/iter-01/external |
| F-2 | impl-review | Review-fix has no route for a finding in another agent's memory | reviews/impl/wave-1/iter-01/correctness |

## F-1 — External Review CLI unavailable in the cloud container

- **Phase**: impl-review
- **Surface**: provider tool — `codex` (wrapped CLI for `asd-external-review` under Claude Code)
- **What happened**: `external-preflight` returned `command-unavailable`. `codex` is not installed in the remote execution container, although config records `codex-cli 0.150.1 on PATH`, which is true only on the user's own machine.
- **Impact**: External Review was availability-skipped for wave-1/iter-01, and its whole file list is recorded as Unreviewed. The internal reviewers still ran.
- **Refs**: reviews/impl/wave-1/iter-01/external

## F-2 — Review-fix has no route for a finding in another agent's memory

- **Phase**: impl-review
- **Surface**: phase — `asd-phase-impl.md` review-fix mode step 3 / `sprint-lifecycle.md` "Self-hosting"
- **What happened**: COR-4 found stale lines in reviewer and External Review agent memory. Review-fix routes findings only to `asd-dev` (or `asd-tester` for test files), but Dev may write only its own memory directory.
- **Impact**: The orchestrator had to take an ad-hoc routing decision: each owning agent fixes its own memory.
- **Refs**: reviews/impl/wave-1/iter-01/correctness
