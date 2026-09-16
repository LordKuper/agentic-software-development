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
| F-2 | impl-review | Reviewer ledger returned without `manifest_digest` | reviews/impl/iter-01/efficiency |
| F-3 | impl-review | Shell-less reviewers handed a `git diff` command instead of the diff | reviews/impl/iter-01, iter-02, iter-03 |

## F-1 — Canon disagrees on when External Review's availability skip applies

- **Phase**: audit
- **Surface**: rule — `.asd/rules/sprint-lifecycle.md:68,344`, `.asd/workflows/asd-phase-impl-review.md:47`, `.asd/workflows/asd-phase-design-review.md:41` vs `.asd/rules/external-review.md:47`, `.asd/agents/asd-external-review.md:105,116`
- **What happened**: The first group scopes the skip to a non-ready preflight or an active negative cache. The second also returns it for a crash, hang, timeout, unusable output or exhausted retry after invocation. Two canonical sources, so precedence could not settle it.
- **Impact**: A hard user decision was needed before the audit gate, and AC-1 now also has to narrow the external-review contract.
- **Refs**: —

## F-2 — Reviewer ledger returned without `manifest_digest`

- **Phase**: impl-review
- **Surface**: agent — `asd-reviewer-efficiency` (iter-01 part 2); template — `.asd/templates/t_review.md` Coverage block
- **What happened**: The ledger block carried findings/files/rules/sections but no `manifest_digest`; `validate-ledger` rejects that as incomplete, not transcribable. `t_review.md` shows no ledger keys, and the dispatch payload did not restate the shape.
- **Impact**: One fresh re-dispatch (~100k subagent tokens); later payloads spelled out the ledger shape.
- **Refs**: reviews/impl/iter-01/efficiency

## F-3 — Shell-less reviewers handed a `git diff` command instead of the diff

- **Phase**: impl-review
- **Surface**: phase — `.asd/workflows/asd-phase-impl-review.md` step 6 payload ("the diff computed in step 1")
- **What happened**: The orchestrator passed the diff as a command line; internal reviewers hold no shell, so every reviewer in all three iterations rebuilt the change set from plan.md, test-plan.md and decisions-log segments before reviewing.
- **Impact**: Extra read cost per reviewer, and one iter-02 reviewer misread an out-of-surface decisions-log segment as empty.
- **Refs**: reviews/impl/iter-01, reviews/impl/iter-02, reviews/impl/iter-03
