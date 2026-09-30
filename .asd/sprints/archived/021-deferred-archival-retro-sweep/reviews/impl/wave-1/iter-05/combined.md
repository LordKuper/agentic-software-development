[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-05

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

Dropped below floor (`critical`):
- low — `.asd/workflows/asd-phase-pr.md:10`: "unless the sprint branch already carries this sprint's bump" names no check for it. Fix: name one, e.g. `git diff <git.base_branch>...HEAD -- .asd/release-manifest.json` shows an `asd_version` change.
- medium, predates this range — `.asd/workflows/asd-phase-pr.md:10` with `.asd/skills/asd-sprint/SKILL.md:30`: an open-mode `MERGED` hit writes nothing, so the local `phase` stays at retro's. If the user then refuses closure, the Step 1 gate on `phase="pr"` misses the sprint on the next invocation, and the resume flow re-runs `retro` before `pr` finds the hit again. The claim at `.asd/rules/sprint-lifecycle.md:321` that "every PR head carries it" also covers only heads that open mode pushed, not a PR opened by hand and merged before `pr`. Fix: on a `MERGED` hit, write and commit `phase=pr` locally, or have Step 1 also run the head-branch lookup for a `retro`-phase sprint.

Checked and sound: in open mode step 2, both non-`MERGED` paths commit `phase=pr` before any push. The no-hit path pushes it through "PR creation" ("Push branch, then `gh pr create`"). The adopted `OPEN` path pushes it through merge mode step 1's origin `pr.number` check/push. The self-hosting bump stays "before composing the PR" per `git-strategy.md` "Versioning & Changelog". Step 1A's unconditional carry agrees with the closure write at `sprint-lifecycle.md:325` and `asd-phase-scope.md:8`, and with the Step 1 wording at `SKILL.md:30`. README row 192 is unaffected. Both generated `asd-sprint` views carry the new Step 1A text. The new `tests/run.js:6878-6901` assertions derive the gate value from Step 1's `phase="pr"` span. They split clauses on `[;.]\s`, which leaves `state.json.pr` whole, and pin commit-before-adopt and bump-before-adopt without vacuous passes.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"11ebadfa56f677591ea1261a7d5e24e23cc6797c964f291539ec15d70527f5f8","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

## Verdict
APPROVE

## Next action
The orchestrator persists this return (`persist-review --in` this file) and records APPROVE for combined in wave-1/iter-05. The two dropped items need no action this wave. The medium one is a candidate `F-N` for retro.
