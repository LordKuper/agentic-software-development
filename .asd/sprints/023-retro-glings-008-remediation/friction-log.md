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

## F-1 — Combined reviewer overran 50 turns on a wave inside every new threshold

- **Phase**: impl-review
- **Surface**: rule — `.asd/runtime.js` `LARGE_WAVE_FILES`, `WAVE_THRESHOLD_FILES`, `WAVE_THRESHOLD_BYTES` (AC-1) and `providers.md` "Dispatch payload header"
- **What happened**: wave 1 held 16 files (diff 227 KB, 16 coverage files plus rules and sections), below `LARGE_WAVE_FILES` (20), so the payload carried no turn plan. `asd-reviewer-combined` stopped at the 50-turn cap with partial output and no verdict token, the same failure AC-1 targets. The 22-file wave of the previous sprint overran, a 26-file one passed: turn use is not a function of file count alone.
- **Impact**: one interrupted dispatch (about 286k subagent tokens, 8 minutes) and a re-dispatch of the same reviewer.
- **Refs**: reviews/impl/wave-1/iter-01/combined
