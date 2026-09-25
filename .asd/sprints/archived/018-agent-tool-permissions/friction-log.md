---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 018-agent-tool-permissions

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Concurrent wave-2 dev commits swept a sibling's staged files; three agents reset and recommitted | — |
| F-2 | impl | Dispatched agents inherited the sprint folder as cwd and wrote agent memory under the sprint folder | — |
| F-3 | impl-review | Two internal reviewers hit the 50-turn cap on a 38-file scope with no report | reviews/impl/wave-1/iter-01/correctness, reviews/impl/wave-1/iter-01/documentation |

## F-1 — Concurrent wave-2 dev commits swept a sibling's staged files

- **Phase**: impl
- **Surface**: rule — `.asd/rules/git-strategy.md` "Commit before review" (staging ownership in a shared worktree)
- **What happened**: Task 2 staged its five agent files, then ran a lint on the index. Tasks 3, 4 and 5 each ran a plain `git commit` after staging only their own paths, which also took Task 2's staged files. Each noticed, soft-reset its own commit and recommitted with a pathspec. Task 2 believed its work had landed in f74fe92, which no longer existed, so its files were left staged and uncommitted.
- **Impact**: three reset/recommit cycles, a Task 2 completion report that was wrong, and an extra orchestrator correction round. The rule bans whole-tree staging but not stage-then-wait, and it does not require a pathspec-only commit.
- **Refs**: —

## F-2 — Dispatched agents wrote agent memory under the sprint folder

- **Phase**: impl
- **Surface**: provider tool — orchestrator shell cwd inherited by dispatched agents
- **What happened**: an orchestrator bookkeeping command changed the session's working directory to `.asd/sprints/018-agent-tool-permissions/`. The Task 1 and Task 2 dev agents, dispatched afterwards, resolved `.claude/agent-memory/...` against that directory and created a stray `.claude/` tree inside the sprint folder.
- **Impact**: memory landed outside the host-served memory path; it duplicated an existing memory and needed a manual move plus cleanup.
- **Refs**: —

## F-3 — Reviewers exhausted maxTurns before returning a report

- **Phase**: impl-review
- **Surface**: agent — `asd-reviewer-correctness`, `asd-reviewer-documentation` frontmatter `maxTurns: 50`
- **What happened**: on a 38-file, 543-line wave (well under the 3000-line wave threshold) both reviewers spent all 50 turns reading and returned no text; each needed a fresh re-dispatch with an explicit turn budget in the payload.
- **Impact**: two interrupted attempts, a second full review pass for each (~400k extra subagent tokens), and a longer iteration. The wave threshold measures diff lines, not reviewer turn cost.
- **Refs**: reviews/impl/wave-1/iter-01/correctness, reviews/impl/wave-1/iter-01/documentation
