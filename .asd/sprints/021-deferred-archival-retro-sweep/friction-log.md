---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 021-deferred-archival-retro-sweep

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | Retro intake offers only the latest retro plus deferred rows, so a full sweep needed hand-run verifier dispatches | — |
| F-2 | audit | A Claude Code background agent's task output file stays 0 bytes on Windows, so it cannot signal liveness | — |
| F-3 | impl | Parallel devs told to tick one shared plan.md and write one shared memory index | — |

## F-1 — Retro intake cannot reach legacy or cross-repo rows

- **Phase**: scope
- **Surface**: provider tool — `.asd/runtime.js` `retro-candidates`
- **What happened**: The user asked to triage every open retro row across this repo and Glings. `retro-candidates` returns only the latest closed retro's undisposed rows plus deferred rows (11). It never reads retros 007–015, and consumer mode drops `asd` rows, so Glings' framework rows have no path to the framework. The orchestrator hand-ran a parser over all 19 retros and five verifier dispatches.
- **Impact**: 5 extra dispatches (~750k subagent tokens), plus the sweep's evidence and dispositions recorded by hand outside the intake mechanism.
- **Refs**: —

## F-2 — Task output file is no liveness signal on this host

- **Phase**: audit
- **Surface**: provider tool — Claude Code background `Agent` dispatch `output_file`
- **What happened**: While applying the AC-7 intent early, the orchestrator armed a 5-minute monitor on the audit architect's `output_file` size. Every `tasks/*.output` agent file is 0 bytes, running and completed alike, so size growth cannot distinguish progress from a stall. The monitor was stopped.
- **Impact**: The obvious liveness probe for AC-7 is unusable on Windows. The AC-7 host mapping needs another observable signal.
- **Refs**: —

## F-3 — Parallel devs told to tick one shared plan.md

- **Phase**: impl
- **Surface**: phase — `.asd/workflows/asd-phase-impl.md` step 6 ("initial — tick corresponding checkboxes in `<sprint>/plan.md`")
- **What happened**: Wave 1 dispatches 9 Tasks concurrently. Step 6 has every dev edit and commit `plan.md`, one shared path. `git-strategy.md` "Commit before review" forbids a dev committing a path a sibling holds mid-edit. The shared `asd-dev-critical/MEMORY.md` index hits the same collision. The orchestrator took plan ticking over and barred memory writes in this dispatch.
- **Impact**: A workflow step contradicts the concurrency rule. The orchestrator deviates to keep commits clean.
- **Refs**: —
