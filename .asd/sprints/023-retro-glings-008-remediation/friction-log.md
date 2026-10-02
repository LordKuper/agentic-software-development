---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 023-retro-glings-008-remediation

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | The combined reviewer hit its 50-turn cap on a 16-file, 227 KB wave that the new division thresholds accept as one wave | reviews/impl/wave-1/iter-01/combined |
| F-2 | impl-review | `lint` (`git diff --cached --check`) fails on the generated review `.diff` files, whose lines carry trailing whitespace | reviews/impl/wave-1/iter-01 |
| F-3 | impl-review | Two reviewer returns carried a verdict and a valid ledger but no findings table, so the persistence step rejected them and both reviewers were re-dispatched | reviews/impl/wave-2/iter-02/combined, reviews/impl/wave-2/iter-02/external |
| F-4 | impl-review | A scope amendment accepted while impl review fixes were pending had no stated order against the amendment's new Tasks, because impl modes are exclusive | — |

## F-1 — Combined reviewer overran 50 turns on a wave inside every new threshold

- **Phase**: impl-review
- **Surface**: rule — `.asd/runtime.js` `LARGE_WAVE_FILES`, `WAVE_THRESHOLD_FILES`, `WAVE_THRESHOLD_BYTES` (AC-1) and `providers.md` "Dispatch payload header"
- **What happened**: wave 1 held 16 files (diff 227 KB, 16 coverage files plus rules and sections), below `LARGE_WAVE_FILES` (20), so the payload carried no turn plan. `asd-reviewer-combined` stopped at the 50-turn cap with partial output and no verdict token, the same failure AC-1 targets. The 22-file wave of the previous sprint overran, a 26-file one passed: turn use is not a function of file count alone.
- **Impact**: one interrupted dispatch (about 286k subagent tokens, 8 minutes) and a re-dispatch of the same reviewer.
- **Refs**: reviews/impl/wave-1/iter-01/combined

## F-2 — Whitespace lint fails on generated review diff files

- **Phase**: impl-review
- **Surface**: gate — `.asd/project/commands.yaml` `lint` (`git diff --cached --check`) over a commit that stages `reviews/impl/**/<fingerprint>.diff`
- **What happened**: the review diff files embed the reviewed lines verbatim, including blank context lines that are a lone space and added blank lines, so the whole-tree staged lint reports hundreds of trailing-whitespace errors for content that is not authored. The commit went through (no hook), but the gate result is noise.
- **Impact**: the lint gate cannot be read as green over a review commit; orchestrator and devs scope it to their own paths by hand.
- **Refs**: —

## F-3 — Reviewer returns without the findings table were rejected twice

- **Phase**: impl-review
- **Surface**: agent — `asd-reviewer-combined` and `asd-external-review` return shape against `t_review.md` and `external-review/t_review-report.md`
- **What happened**: in one iteration each reviewer, finding nothing at the floor, returned the verdict token, prose and (combined) a valid ledger but omitted the `## Findings` / `## Kept findings` table. `persist-review` exited 2 ("review has no findings table"); each reviewer was re-dispatched fresh with a format reminder and then returned the single `no findings` row.
- **Impact**: two extra reviewer dispatches (about 140k subagent tokens and 10 minutes) for no new information.
- **Refs**: reviews/impl/wave-2/iter-02/combined, reviews/impl/wave-2/iter-02/external

## F-4 — Order of a pending review-fix and an amendment's new Tasks is unstated

- **Phase**: impl-review
- **Surface**: rule — `sprint-lifecycle.md` "Scope amendment" and `asd-phase-impl.md` mode detection
- **What happened**: amendment AC-11 was accepted at impl-review while `review_fixes_pending` was set. Impl detects its mode from the fix flags, so the amendment's Tasks (plan wave 5) could not be dispatched in the same pass; the orchestrator ran the review-fix round first and re-entered impl in initial mode afterwards. No rule names that order.
- **Impact**: a judgment call by the orchestrator, one extra impl-test entry between the two rounds.
- **Refs**: —
