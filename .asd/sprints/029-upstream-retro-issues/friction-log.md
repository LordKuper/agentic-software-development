---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 029-upstream-retro-issues

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Task 7 dev ran a whole-tree `git stash` in the shared worktree | — |
| F-2 | impl | Task 2 dev committed a 53-char subject | — |
| F-3 | impl | orchestrator composed `node -e` scripts with single-quoted bodies that broke on apostrophes, three times | — |

## F-1 — dev ran a whole-tree git stash

- **Phase**: impl
- **Surface**: agent — `.asd/agents/asd-dev.md` (Task 7 dispatch); rule `git-strategy.md` "Commit before review" whole-tree ban
- **What happened**: the Task 7 dev ran `git stash -q` mid-task and popped it at once; orchestrator bookkeeping (`decisions-log.md`, `state.json`, `timing.jsonl`) was dirty then and survived intact.
- **Impact**: none this time (no sibling in flight, clean pop); during a concurrent wave a stash takes a sibling's edits off disk.
- **Refs**: —

## F-2 — dev commit subject over 50 chars

- **Phase**: impl
- **Surface**: agent — `.asd/agents/asd-dev.md` (Task 2 dispatch); rule `git-strategy.md` "Commits" (subject ≤ 50 chars)
- **What happened**: Task 2 committed a 53-char subject and flagged it, since a dispatched agent may not move HEAD to amend.
- **Impact**: the orchestrator rewords it at the pre-push squash.
- **Refs**: —

## F-3 — orchestrator shell scripts broke on apostrophes

- **Phase**: scope, impl
- **Surface**: provider tool — orchestrator `node -e '<script>'` writes of research.md, sprint.md and friction-log.md
- **What happened**: three inline scripts embedding English prose with apostrophes ended the single-quoted shell argument early and failed; each write was redone with the file-edit tool.
- **Impact**: three failed tool calls and their retries.
- **Refs**: —
