---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 008-retro-007-remediation

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — normative there, not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | A dispatched dev staged the whole worktree, sweeping a concurrently running dev's in-progress edit into its own commit | — |
| F-2 | scope | Three of fourteen acceptance criteria were written against a stale premise and only the audit caught it | — |

## F-1 — A dispatched dev staged the whole worktree, sweeping a concurrent dev's edit into its own commit

- **Phase**: impl
- **Surface**: rule — `.asd/rules/git-strategy.md` "Commits"; workflow — `.asd/workflows/asd-phase-impl.md` step 6 dispatch payload
- **What happened**: Tasks 2, 6 and 9 were dispatched in parallel onto one shared worktree, each instructed to commit its own work. The Task 6 dev staged broadly rather than staging only the paths it had edited, so Task 9's in-progress `.asd/runtime.js` change was committed under Task 6's commit `1677d2a` before its own author could stage it. Task 9's remaining seven files landed separately in `44ba8c5`. Nothing was lost and no history was rewritten, but one commit's message does not describe its contents.
- **Impact**: Two commits misattribute their changes, so the sprint's own commit history is a misleading input for the reviewer's per-commit reasoning and for the `pr` phase's self-review checklist item "can explain every changed line". Nothing had to be redone.
- **Root shape**: the workflow dispatches independent tasks in parallel onto one worktree and asks each to commit, but no rule states that a dispatched agent stages only the paths it authored. `git-strategy.md` gained the orchestrator-bookkeeping half of this rule during this very sprint (Task 8, AC-9); the agent-to-agent half is the gap this entry records.
- **Refs**: —

## F-2 — Three acceptance criteria were written against a stale premise

- **Phase**: scope
- **Surface**: rule — `.asd/rules/sprint-lifecycle.md` "Retro phase" / `.asd/templates/t_retrospective.html`
- **What happened**: The sprint 007 retrospective's Actions table drove this sprint's AC list. Three of its rows had already been resolved at HEAD by the time the sprint started: `sync.js` had failed closed on an unmatched `--apply` target since v4.0.0 (AC-4), `tests/run.js` already asserted that behaviour twice (AC-13), and one named wording target contained no such wording (AC-5's `t_AGENTS.md`). The audit phase caught all three, but only after they had been written into `sprint.md` and accepted at the scope gate, which then required a hard gate to revise.
- **Impact**: One extra hard gate and one scope revision. Had the audit not caught it, the impl phase would have re-implemented a working fail-closed path and added a third assertion of an already-doubly-asserted behaviour.
- **Root shape**: a retrospective's recommendations are written against the HEAD of the sprint that produced them and carry no recorded verification that they are still unresolved when a later sprint picks them up. F-4's root cause in that retrospective was itself derived from a stale agent-memory note rather than from the current source.
- **Refs**: —
