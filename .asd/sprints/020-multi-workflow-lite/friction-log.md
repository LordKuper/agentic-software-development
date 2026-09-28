---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 020-multi-workflow-lite

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Per-task sync rule conflicts with parallel wave dispatch | — |
| F-2 | impl | Host auto-mode classifier denied the mandated `sync.js --apply` | D-1 |

## F-1 — Per-task sync rule conflicts with parallel wave dispatch

- **Phase**: impl
- **Surface**: rule — `.asd/project/custom-coding-rules.md` (sync "in the same task before marking it done") vs `.asd/workflows/asd-phase-impl.md` step 6 (a wave's tasks dispatched concurrently in one worktree)
- **What happened**: Wave 2 had five concurrent Tasks, three of which edit canonical agents, skills or hooks. Every `sync.js --apply` rewrites the shared `.asd/sync-state.json`, so parallel per-task syncs race on one file. No rule says who syncs when a wave is parallel, so the orchestrator deferred every sync to the final Task.
- **Impact**: The impl `build` gate (`sync.js --check`) is red until the last wave. One orchestrator decision was needed that no rule anticipates.
- **Refs**: —

## F-2 — Host auto-mode classifier denied the mandated `sync.js --apply`

- **Phase**: impl (test-fix)
- **Surface**: provider tool — Claude Code auto-mode permission classifier vs `.asd/project/custom-coding-rules.md` (sync after canonical edits) and `AGENTS.md` (`sync.js --apply`)
- **What happened**: While fixing D-1, the dev dispatch ran `node .asd/sync.js --apply <target>` to refresh `release-manifest.json` `upstream_hashes`. The host classifier denied it as self-modification, because it rewrites generated views. The dev instead called `sync.js`'s exported `recomputeAndWriteHashLedgers` directly, which touched only the manifest.
- **Impact**: A rule-mandated command could not run inside a dispatched agent. The substitute path is undocumented, and it bypasses the command the rules name.
- **Refs**: D-1
