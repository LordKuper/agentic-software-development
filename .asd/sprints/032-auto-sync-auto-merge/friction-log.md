---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 032-auto-sync-auto-merge

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | `emit-manifest --iteration <NN>` rejects the zero-padded form the workflow's `NN` names | — |
| F-2 | impl | A review-fix finding needing a tech-reference edit has no owner in the fix round | reviews/impl/wave-1/iter-01/combined |

## F-1 — `emit-manifest --iteration <NN>` rejects the zero-padded form

- **Phase**: impl-review
- **Surface**: workflow — `.asd/workflows/asd-phase-impl-review.md` step 6, `.asd/rules/external-review.md` "Phase-scoped payload", `.asd/runtime.js` `emit-manifest`
- **What happened**: Step 6 writes `--iteration <NN>`, and everywhere else in that workflow `NN` is the zero-padded id of `iter-NN`. `--iteration 01` stopped with `--iteration <n> must be a positive integer`.
- **Impact**: One failed command per review phase that follows the text literally; no wrong artefact.
- **Refs**: —

## F-2 — A review-fix finding needing a tech-reference edit has no owner

- **Phase**: impl
- **Surface**: rule — `.asd/rules/sprint-lifecycle.md` "Self-hosting" allowlist, `.asd/workflows/asd-phase-impl.md` step 9
- **What happened**: Finding F1 needed a line in `docs/architecture/tech-reference/gh-2.90.md`. The dev allowlist excludes `docs/**`, so the orchestrator had to write it, yet step 9's authorised round-diff list names no such orchestrator edit. It was committed before the dev dispatch to stay out of the round's diff.
- **Impact**: An ordering workaround; no rework.
- **Refs**: reviews/impl/wave-1/iter-01/combined
