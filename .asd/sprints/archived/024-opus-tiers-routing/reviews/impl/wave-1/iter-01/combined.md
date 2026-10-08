[REVIEW-impl-combined]: CONCERNS

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | low | tests/run.js:7582 | Best practices (`code-style.md` §17, L125: "A test or rule that names the members of a set derives that set from its source wherever a source exists"). The sprint-024 AC-2 assert hardcodes the reserved classes `['security', 'authentication', 'migration', 'public contract', 'workflow gate']`, but their source is `.asd/runtime.js:15` `RESERVED_CHANGE_RISKS`. If a sixth reserved class is added there, nothing will require a definition for it in "Plan file format", and the test that claims "every reserved risk class has a definition" will stay green. | Derive the list from the runtime source without editing `runtime.js` (the plan keeps it unchanged): `const reserved = JSON.parse(/const RESERVED_CHANGE_RISKS = (\[[^\]]*\]);/.exec(readRepoFile('.asd/runtime.js'))[1].replace(/'/g, '"'));`. The alternative is to export the constant and read `runtime.RESERVED_CHANGE_RISKS`, but that changes `runtime.js`. Record the one mutation run in the `test-plan.md` row. |

## Coverage (internal reviewers only)

Review basis:
- **AC-1:** the four canon frontmatter edits match D1. No `codex` block changed. The generated `.claude/agents/asd-architect.md`, `asd-reviewer-correctness.md`, `asd-reviewer-combined.md` and `asd-dev-critical.md` render `model: opus`, and the tester-critical view stays sonnet. README L218, L228, L232, L244 and L248 and the four `canon_hashes` entries follow.
- **AC-2:**
  - The home is `sprint-lifecycle.md` L373-378, which defines all five reserved classes and bounds the doubt rule.
  - `providers.md` L129 cites that home and keeps the reserved-typing ban verbatim.
  - The citations in `asd-phase-plan.md` step 4 and the `t_plan.md` placeholders are in place.
  - The `change` bullet no longer names "ambiguous judgment", and the `task_routing.reason` record replaces D3's log-line claim. The orchestrator accepted both as flagged choices in decisions-log L42, so neither is raised.
- **AC-3:** a repo grep finds no remaining "delta touches", "Tasks whose paths" or "every Task's" outside sprint folders. `asd-phase-impl.md` 5a, `asd-phase-impl-test.md` 1a and `asd-phase-impl-review.md` steps 8-9 only cite the rule. The suite sentence declares `none` and never routes critical.
- **AC-4:** the presentation sentences come after the regex-picked intake sentences, and scope step 4 cites "Retro intake".
- **AC-5:** the `.gitattributes` LF line is byte-identical. The `-whitespace` line also covers the compound commit check. The §19 clause keeps its pinned phrase.
- **AC-6:** "Scope amendment" defines the review-fix-then-initial order. The Modes clause cites it. impl step 5 skips ticked waves and step 11 continues into steps 3-10 before step 12. Plan waves all run in one `impl` entry, so in a review-fix round only an amendment can leave an unticked Task.
- **AC-7:** the §17 bound and the `runs: <n>` recording are in place. The tester's `runs: 11` (10 mutations plus 1 control) matches the new bound.
- **Not recomputed:** the hashes, `sync.js --check` and the suite were not re-run here (no shell). The test-plan record says 273/273 pass and `sync --check` exits 0.

```json
{"manifest_digest":"0c4265a3d703020e3c30d8b3e1a646910e390f9b6716fb3f03b2b8ea1a436702","findings":["1"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-reviewer-combined.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/code-style.md","s":"checked"},{"i":".asd/rules/providers.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/templates/t_plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".gitattributes","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"finding","f":"1"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

## Verdict
CONCERNS: 1

## Next action
Finding 1 is low severity and sits only in a test file, so `review-policy.md` "Low-severity test-only findings" applies: a fresh `asd-tester` fixes it in place (derive the reserved list from `.asd/runtime.js`) and commits the fix. The terminal full-suite gate then runs.
