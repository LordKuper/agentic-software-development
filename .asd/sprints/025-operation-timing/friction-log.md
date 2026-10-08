---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 025-operation-timing

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | Closure-write gate name differs between two rule homes | — |
| F-2 | impl | A wave-2 dev committed sibling Tasks' uncommitted edits, then reset twice | — |

## F-1 — Closure-write gate name differs between two rule homes

- **Phase**: scope
- **Surface**: rule — `.asd/workflows/asd-phase-scope.md` step 1 vs `.asd/rules/sprint-lifecycle.md` "PR phase" closure write
- **What happened**: The workflow names the `gate_decisions` entry `gate: sprint-closure`; the lifecycle rule names it a `sprint closure` entry. The orchestrator followed the workflow and the sprint 023 precedent.
- **Impact**: An extra lookup to pick the spelling; a reader keyed on either string misses the other.
- **Refs**: —

## F-2 — A wave-2 dev committed sibling Tasks' uncommitted edits, then reset twice

- **Phase**: impl
- **Surface**: rule — `.asd/rules/git-strategy.md` "Commit before review" (stage only authored paths, `git commit --only -- <paths>`); agent `asd-dev` (Task 4)
- **What happened**: Task 4's first two commits (0ef20ce, 87f6788) swept the in-progress `asd-sprint/SKILL.md` (Task 3) and `README.md` (Task 8) edits; the dev ran `git reset HEAD~1` twice and recommitted its 10 files as 65aabcd. The mixed resets kept the siblings' edits on disk.
- **Impact**: Two extra commit/reset round-trips on a shared worktree with four agents in flight; a `--hard` reset or a whole-tree stash would have destroyed sibling work.
- **Refs**: —
