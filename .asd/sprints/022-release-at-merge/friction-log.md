---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 022-release-at-merge

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | A dev left README.md's working copy CRLF while the index held LF, reddening a content test until renormalised | — |

## F-1 — Working copy left CRLF after a dev edit

- **Phase**: impl
- **Surface**: agent — `asd-dev` (Task 6, README)
- **What happened**: After Task 6's commit, `README.md` in the working tree had CRLF endings (`git ls-files --eol`: `i/lf w/crlf`), although `.gitattributes` sets `eol=lf`. The sprint-013 schema test reads the working copy and failed on `yaml
`. The orchestrator restored the file from the index.
- **Impact**: One false-red test and a reinvestigation. The dev reported the failure as a pre-existing CRLF regex issue.
- **Refs**: —
