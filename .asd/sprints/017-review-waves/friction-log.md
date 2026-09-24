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
| F-3 | impl | Review-fix tester wrote an impl-test Entry log row | test-plan.md Entry log |
| F-4 | impl | Reviewers declare `memory: project` but get no write tool | reviews/impl/wave-1/iter-01/correctness |

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

## F-3 — Review-fix tester wrote an impl-test Entry log row

- **Phase**: impl (review-fix)
- **Surface**: phase — `asd-phase-impl.md` review-fix tester chain vs `asd-phase-impl-test.md` step 1/4 (Entry log ownership)
- **What happened**: The `asd-tester` running the review-fix test-file chain rotated `test-plan.md` into `test-plan.entry-01.md` and appended Entry 2 with `HEAD analysed` filled. That is impl-test's re-entry bookkeeping, which review-fix mode does not own, and no rule says whether a review-fix tester amends test-plan.md.
- **Impact**: The next impl-test entry treats it as a prior entry, so its delta is only the commits after it. Coverage still holds, because the tester analysed the dev-chain delta with fail-first proofs, but the ownership boundary is unclear.
- **Refs**: test-plan.md Entry log

## F-4 — Reviewers declare `memory: project` but get no write tool

- **Phase**: impl (review-fix)
- **Surface**: agent — `asd-reviewer-correctness`, `asd-reviewer-efficiency`, `asd-reviewer-documentation` (canon `memory: project`, tools Read/Glob/Grep only)
- **What happened**: The owners were dispatched to fix their own stale memory (COR-4). The Claude Code host gave them no write or edit tool, so none of them could write. `review-policy.md` "Gate Verdict Format" says the memory channel is one "reviewers do use and the host serves", which did not hold here.
- **Impact**: The owners' texts had to be applied under a user-approved exception to memory ownership. A reviewer's memory can go stale with no owner able to correct it.
- **Refs**: reviews/impl/wave-1/iter-01/correctness (COR-4)
