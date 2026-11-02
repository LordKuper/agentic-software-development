---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 031-combined-design-review

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | Git Bash rewrote the `<ref>:<path>` argument of `git show origin/main:<path>` again | — |
| F-2 | audit | `.asd/tmp/` holds 452 leftover files from sprints 021-030, mostly dispatch context bundles | — |

## F-1 — Git Bash path conversion broke `git show <ref>:<path>` again

- **Phase**: scope (merged-unclosed release check before it)
- **Surface**: provider tool — Git Bash (MSYS) on Windows, running `git-strategy.md` "Versioning & Changelog (self-hosting only)"'s `git show origin/<base>:<path>` form
- **What happened**: the same conversion as sprint 030 F-4 mangled `origin/main:.asd/sprints/…/sprint.md`; the check succeeded only after `export MSYS_NO_PATHCONV=1`.
- **Impact**: one failed command and a retry; AC-7 carries the fix.
- **Refs**: —

## F-2 — scratch directory never emptied of context bundles

- **Phase**: audit
- **Surface**: rule — `artifact-layout.md` "Scratch directory" ("removes them after use"); `agent-protocol.md` "Dispatch payload" (`<scratch-dir>/<NNN-slug>-<dispatch id>.context.md`)
- **What happened**: a grep over `.asd/` returned hundreds of `.asd/tmp/*.context.md` hits from sprints 026-029; `.asd/tmp/` holds 452 files. No phase step removes a dispatch's context bundle or the orchestrator's after use.
- **Impact**: noise in every repo-wide grep of `.asd/` during audit; disk growth per sprint.
- **Refs**: —
