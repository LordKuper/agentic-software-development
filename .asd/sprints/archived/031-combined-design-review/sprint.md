---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 031-combined-design-review

## Goal
Make design-review use the combined reviewer: `standard`'s design-review dispatches `asd-reviewer-combined` plus External Review instead of `asd-reviewer-quality` plus `asd-reviewer-efficiency` plus External Review, always, to cut the token cost of two equal-tier internal dispatches per iteration and the documentation checks both rubrics duplicate (`research.md`, approach A).

## Acceptance
- AC-1: `.asd/workflows/standard.json` `reviewers.design` is `combined`, `external`; `standard`'s `reviewers.impl` and every `lite.json` key stay unchanged.
- AC-2: `asd-phase-design-review.md` dispatches `asd-reviewer-combined` in place of `asd-reviewer-quality` and `asd-reviewer-efficiency` — fresh per iteration, behind the APPROVE latch filter, over its own `emit-manifest --reviewer combined --phase design-review` manifest; `reviews.design.verdicts` and `latched` are keyed `combined`/`external` and design-review DoD is aggregated over those keys; the `asd-phase-design-review` skill description agrees.
- AC-3: `asd-reviewer-combined.md` reviews design-review drafts: its impl-review-only rule and its `Not: design-review` delegation are gone, and its inputs name its design-review inputs; `asd-reviewer-quality.md` and `asd-reviewer-efficiency.md` no longer claim a design-review dispatch, their `## Review rubric` staying the home of the design-review entries the combined manifest composes.
- AC-4: Every other site restating the design-review roster agrees — rule docs, README (workflow descriptions, phase flowchart and table, agent roster), any test asserting the old roster; `node tests/run.js` and `node .asd/sync.js --check` are green.
- AC-5: `review-policy.md` "Verify before applying": the fixer holds a suggested fix to the over-engineering checklist before applying it, and a case the caller excludes gets no callee guard (030-english-only-asd-issues#A-1).
- AC-6: `asd-phase-impl.md` step 7: in a self-hosting fix round, the sync (the changed views, or `--apply AGENTS.md` for canon with no view) runs after the dev chain and before the tester chain (030-english-only-asd-issues#A-2).
- AC-7: `.asd/project/custom-common-rules.md`: on Git Bash, `git show <ref>:<path>` runs with `MSYS_NO_PATHCONV=1` set (030-english-only-asd-issues#A-4).
- AC-8: `sprint-lifecycle.md` "Scope amendment": before an amendment's criterion joins the plan, its rule text is checked against every accepted criterion's rule for a contradiction (030-english-only-asd-issues#P-2).
- AC-9: `.asd/runtime.js` splits every git invocation carrying scope paths into chunks whose command line stays under the Windows 32,767-character limit, keeping complete file coverage and each rename paired with its source (`git diff` takes no `--pathspec-from-file`) (issue #74).
- AC-10: `.asd/runtime.js` `reviewFindings` validates the findings table header against the canonical `t_review.md` columns before reading any column by position, and rejects any other layout (issue #78).

## Out of scope
- `standard`'s impl-review roster (stays quality, efficiency, external).
- A config key or per-sprint choice restoring two internal design-review reviewers.
- Support or migration for in-flight sprints holding design-review verdicts keyed `quality`/`efficiency`.
