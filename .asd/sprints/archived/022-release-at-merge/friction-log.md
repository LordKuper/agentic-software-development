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
| F-2 | impl-review | The iter-02 combined reviewer, on its retry, opened the previous iteration's review file despite the clean-context ban | — |

## F-1 — Working copy left CRLF after a dev edit

- **Phase**: impl
- **Surface**: agent — `asd-dev` (Task 6, README)
- **What happened**: After Task 6's commit, `README.md` in the working tree had CRLF endings (`git ls-files --eol`: `i/lf w/crlf`), although `.gitattributes` sets `eol=lf`. The sprint-013 schema test reads the working copy and failed on `yaml
`. The orchestrator restored the file from the index.
- **Impact**: One false-red test and a reinvestigation. The dev reported the failure as a pre-existing CRLF regex issue.
- **Refs**: —

## F-2 — Reviewer read another iteration's review file

- **Phase**: impl-review
- **Surface**: agent — `asd-reviewer-combined` (wave-1/iter-02, retry after a turn-cap interruption)
- **What happened**: The reviewer's return states it opened `reviews/impl/wave-1/iter-01/combined.md` to trace a residual finding, although `review-policy.md` "Clean-context review iteration" forbids it. The payload did not name the ban and the reviewer holds a read tool over the whole tree, so nothing stopped it.
- **Impact**: One finding (#1) rests partly on prior-iteration context. The reviewer disclosed it; no verdict was corrupted, since the finding was re-traced against current text.
- **Refs**: —
