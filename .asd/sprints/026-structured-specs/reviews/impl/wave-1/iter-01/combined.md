[REVIEW-impl-combined]: CONCERNS

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F-1 | medium | .asd/rules/sprint-lifecycle.md:165, :168 ("Input sources", rows `requirements` and `ux`); AC-7 | The new table is now the only place requirement and UX inputs are resolved (agents cite `payload.inputs.<key>` and never re-derive). It gives only the decomposition-enabled persistent paths: `docs/product/requirements/<subsystem>.html` and `docs/ux/<subsystem>.html`. With `project.subsystem_decomposition: disabled`, `artifact-layout.md` "Paths (decomposition disabled)" (l.84, l.88) uses the flat `docs/product/requirements.html` and `docs/ux/ux-spec.html`, and "Design-promote phase" merges drafts into them. An orchestrator resolving from the table in a flat project points dev, tester and reviewers at files that do not exist. The `requirements` input then falls back to nothing, and the AC trace and AC coverage lose their source. The writing agents (`asd-ba.md` l.27/46) do know both forms, so the table is out of step with the path map it relies on. | Add the flat form to both cells, e.g. "`docs/product/requirements/<subsystem>.html` (decomposition disabled: `docs/product/requirements.html`)" and the same for `docs/ux/ux-spec.html`. Or replace the literal paths with a pointer to the persistent requirements/ux-spec location in `artifact-layout.md` "Paths". Keep the `tests/run.js` l.6697 pin, which checks only the lite clause, green. |

## Coverage (internal reviewers only)

```json
{"manifest_digest":"73095f13c7396a19aa3aeea15603651fff4facd197f6102d4cc146769262140b","findings":["F-1"],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/agent-protocol.md","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/language-policy.md","s":"checked"},{"i":".asd/rules/providers.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/templates/t_audit.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_retro-backlog.md","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"pass"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Perf anti-patterns [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Algorithmic complexity [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Regression detection [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Hot path identification [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"pass"},{"i":"Provenance","s":"pass"},{"i":"Traceability","s":"pass"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"F-1"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"reviewed"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Perf anti-patterns [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Algorithmic complexity [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Regression detection [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Hot path identification [impl-review]","s":"n/a","p":"no perf budgets section and no executable file in scope"},{"i":"Overall quality","s":"reviewed"}]}
```

Review basis:
- AC-13 relocation check (wave-1 deletions against their HEAD homes). Each moved rule was found in its new home:
  - "Retro intake" → `asd-phase-scope.md` step 2a.
  - "Audit phase" → `asd-phase-audit.md` "Rules" and steps 3a/3b.
  - "Design phase" → `asd-phase-design.md` steps 6-10 and "Rules".
  - "Impl phase" → `asd-phase-impl.md` `## Entry` modes, steps 2-3/7-9 and "Rules".
  - "Impl-test phase" → `asd-phase-impl-test.md` steps 3-10 and "Rules", stalemate in step 9.
  - "Retro phase" minus the row-id grammar → `asd-phase-retro.md` steps 1-7.
  - PR open-mode DoD → `asd-phase-pr.md` Open mode step 1.
  - "Signal vocabulary" and the protocols → `agent-protocol.md` "Signals" and "Relay".
  - The providers "Dispatch payload header" lines → `agent-protocol.md` "Dispatch payload"; host enforcement stays in `providers.md`.
- Behaviour changes found are only the ones AC-6 allows: `PLAN_DRAFT`/`PLAN_READY` dropped, `ABORT` added, `ADVICE_NEEDED` limited to creators, and the reviewer branch dropped from relay steps 4 and 6. AC-9, AC-10 and AC-11 are present in their homes.
  - AC-9: `sprint-closure`; no "sprint closure" left in rules, workflows, skills or README.
  - AC-10: the HEAD-move ban in `git-strategy.md` "Forbidden", plus the orchestrator-only squash.
  - AC-11: the edge-semantics rule in "Plan file format" Decomposition rules.
- Stale citations: I grepped rules, workflows, agents, skills and templates separately for the removed headings and protocol names. The only hits are the `asd-phase-retro.md` l.30/32 cites of `asd-phase-scope.md` "Retro intake", a bold step label in a wave-2 file outside this scope.
- `agent-protocol.md` FAILED "except External Review" matches the `asd-external-review.md` `## Signals` (REVIEW_DONE, ABORT). The advisor "not logged" reference resolves to `asd-advisor.md` `## Rules`.
- The `review-policy.md` restatement that reviewers never emit `ADVICE_NEEDED`/`QUESTION` is required by plan Task 1, so no economy finding is raised for it.
- Release-manifest hash values were not recomputed (no shell). The suite record in `test-plan.md` "Suite run" says 287/287 pass with `sync.js --check` clean at 5c7c8fcb. `.asd/rules` is a managed path, and the new `agent-protocol.md` has its `upstream_hashes` entry.
- `test-plan.md` records no manual-verification rows. No over-engineering or structure finding was raised.

## Verdict
CONCERNS: 1

## Next action
Route F-1 to `impl` review-fix: add the decomposition-disabled persistent paths to the `requirements` and `ux` rows of `sprint-lifecycle.md` "Input sources", then re-run `node tests/run.js`.
