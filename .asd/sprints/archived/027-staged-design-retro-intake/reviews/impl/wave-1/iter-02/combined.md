[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|

## Coverage (internal reviewers only)

Scope: the 10 manifest files over `47a5781c2a182e55.diff` (floor `medium`). Checked:
- `asd-phase-scope.md` step 2: each stage now writes its own output when it finishes. (a) writes the raw scope and answers to Requirements only; (b) writes Findings and Approaches on `COMPLETED`, or the `no web research: <cause>` Findings line on skip; (c) writes the refined requirements and the `Chosen` line. Each Re-entry key (Requirements, Findings, `Chosen`) is now written by its own stage. A fresh `t_research.md` copy fails every key because each section still holds a `{{` placeholder, so no hard gate is skipped by placeholder text alone.
- `sprint-lifecycle.md` "Orchestration and adaptive gates": the three-way disposition clause became a pointer to scope step 2a. Every removed clause is still stated there: include/reject/defer at line 40, consequences per choice at line 41, no default at line 40, the gate blocked while a row lacks a choice at step 4. This also matches the pinned single-home rule (`tests/run.js:6260`). "Staged solution design" now says research.md is written stage by stage, which matches step 2.
- `t_retro-backlog.md`: the comment trim removes only restatements that scope step 2a already owns (re-offer of `deferred` rows, `closed` set with no question). AC-2 is still stated at its home.
- `asd-phase-design.md` step 10 Dispatch now passes `inputs.research`, the same as steps 6/8/9 and the audit dispatch. Creators get the read rule from the workflow `## Rules` line 52, so `asd-architect.md` Inputs needs no change.
- `README.md` folder map: "the first two" was made wrong by the `research.md` insertion and is now replaced by explicit names.
- `tests/run.js`: four new asserts pin contract tokens (`{{` placeholder, the `COMPLETED` → Findings and Approaches clause, `inputs.research` on every design Dispatch entry derived from its JSON, the `Raw scope` line plus its writer). The stage (b) regex matches the step text as written. The mutation proofs used the `--filter` runs `test-plan.md` "Added tests" records.
- `release-manifest.json`: hash entries changed for exactly the five canon files this diff edits. I could not recompute the hashes without a shell; I relied on the tester's recorded full suite (302/302) and `sync.js --check` ok.
- Agent memory (`feedback_reentry-evidence-check.md` plus its index line): records method only, with no sprint, Task, wave, iteration or verdict, and nothing that contradicts this agent's definition.
- `test-plan.md` records no manual-verification rows.

```json
{"manifest_digest":"50b2f1b6a8b685c03deb2231b16dcb26d441daa72b4741b470d052a4534f8132","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/templates/t_research.md","s":"checked"},{"i":".asd/templates/t_retro-backlog.md","s":"checked"},{"i":".asd/workflows/asd-phase-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/feedback_reentry-evidence-check.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

## Verdict
APPROVE

## Next action
Reviewer done; the combined reviewer is APPROVE-latched for wave 1.

## Escalations (optional)
