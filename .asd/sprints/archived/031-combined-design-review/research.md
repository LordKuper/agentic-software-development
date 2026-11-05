---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

<!-- Stages, conceptual boundary, no-web-research Findings line: .asd/rules/sprint-lifecycle.md "Staged solution design" — not restated here. -->

## Requirements
Raw scope and stage (a) answers; stage (c) refines the answers.
- Raw scope: "Надо сделать так, чтобы design-review использовало combined ревьювера." (make design-review use the combined reviewer)
- Problem: design-review dispatches two internal reviewers (`quality`, `efficiency`) over the same drafts; this costs tokens and duplicates the documentation checks both rubrics run.
- Actors: the main orchestrator running `standard`'s design-review; `asd-reviewer-combined`; `asd-external-review` (unchanged).
- Functional requirements: `standard`'s design-review roster becomes `combined` + `external`, always, with no config key or per-sprint choice to restore two internal reviewers; `standard`'s impl-review roster stays `quality` + `efficiency` + `external`; `lite` has no design-review and is unchanged.
- Constraints: `backward_compat: migration`, but in-flight sprints holding design-review verdicts keyed `quality`/`efficiency` need no support (user answer: not considered).
- Success criteria: design-review dispatches `combined` + `external`; its DoD is computed over those keys; `node tests/run.js` green; README in sync. Nothing else.
- Refined (stage c): `external` stays in the design-review roster as the independent second view; no migration script, since in-flight sprints are not supported; quality, efficiency and combined share one model tier (opus/high, sol/high), so the swap removes one of two equal-cost internal dispatches per design-review iteration.

## Findings
- Multi-agent LLM review cost scales with the number of reviewer agents, not the reviewed size: several focused agents over one diff cost more than one agent over it; every agent re-reads the same input — source: https://reviewate-website.pages.dev/blog/multi-agent-code-review-architecture
- Parallel specialised reviewers routinely report the same issue, so multi-reviewer pipelines need a dedup/synthesis step before presenting findings — source: https://dev.to/looksgoodtomeow/i-built-an-ai-code-reviewer-with-6-parallel-agents-heres-the-architecture-warts-and-all-dfc
- Extra reviewers pay off when they detect different problem classes, with diminishing gains; overlapping rubrics add cost without recall — source: https://gaurav-yadav.github.io/adversarial-ai-review
- Multi-agent systems use about 15× the tokens of chat; they are worth it for broad, parallelisable tasks exceeding one context, while most bounded tasks are served best by a single agent — source: https://www.anthropic.com/engineering/multi-agent-research-system
- Independent reviewers should run in parallel on independent inputs; a reviewer reading another's findings is anchored by them — source: https://gaurav-yadav.github.io/adversarial-ai-review

## Approaches
- **A. Reuse `asd-reviewer-combined` in design-review**: `standard`'s `reviewers.design` becomes `combined` + `external`; design-review dispatches `asd-reviewer-combined` in place of quality + efficiency; the combined agent drops its impl-review-only restriction and gains its design-review inputs; rule docs, README and tests follow. Pros: no new agent; the manifest emitter already composes a combined manifest for design-review (phase-gate and UI n/a predicates); the external reviewer keeps an independent second view; one internal dispatch per iteration. Cons: the combined agent body carries a second phase's input list.
- **B. New dedicated design-review combined agent**: an eighth agent composing both rubrics over drafts only. Pros: per-phase input lists stay separate. Cons: a new agent file, roster, README, manifest and `canon_hashes` churn; duplicates combined's composition contract — adds the token and maintenance cost the sprint aims to cut.
- **C. Keep quality + efficiency, deduplicate documentation entries**: assign each overlapping documentation rubric entry to one reviewer in design-review. Pros: smallest roster contract change. Cons: still two internal dispatches per iteration (the main token cost stays); does not meet the requirement to use the combined reviewer.
- Recommended: A — meets the requirement with the fewest new surfaces, reuses existing runtime support, and removes one full internal dispatch per design-review iteration.
- Chosen: A — user answer: "A: переиспользовать combined (рекомендую)"
