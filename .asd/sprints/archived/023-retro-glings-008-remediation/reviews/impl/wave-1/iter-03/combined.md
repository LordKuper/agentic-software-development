[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

What was checked, by reading the manifest diff against the homes:

- `.asd/templates/t_plan.md:19-20` (the review-fix of the prior iteration's placement finding): the `Reachability` rule now reads "under the `Material risk` line(s) and any `Test-only` line", the `Settings change` rule "under the `Material risk`, `Test-only` and `Reachability` lines". Both equal, span for span and in order, the spans before the `):` of `sprint-lifecycle.md` "Plan file format" lines 378 and 382, and the `Test-only` rule at line 18 ("directly under `Material risk`, ahead of any `Reachability`") is consistent with both, so the chain no longer computes the reverse order. No other canon or README site restates the `Reachability` or `Settings change` placement (`asd-phase-impl.md` step 5 and `asd-init` SKILL name the `Settings change:` literal only), so no mirror is left unread.
- `tests/run.js:7525-7529` (the AC-5 test extension): resolved by hand against the live files. The `Reachability` mirror is line 19 (the first `- ` line carrying the `` `Reachability:`` span; line 18 carries `` `Reachability` `` without the colon, line 20 does not carry it), its spans before the first `;` minus its own span are `['Material risk', 'Test-only']`, the home's `placement` is the same; the `Settings change` mirror is line 20, `['Material risk', 'Test-only', 'Reachability']` against the home's same list. Both pass on the current text. The home list is read from the file, not hand-listed (`code-style.md` §17), and the helpers (`spans`, `placement`, `declarationOf`, `template`, `lineName`) are all in scope of the test. The recorded proof is within the §17 bound (2 relations: 2 mutations plus 1 reword control, runs: 3); the baseline B1 shows the pre-fix text passed the unchanged suite, so the pin is the new relation, not a restated literal.
- `.asd/release-manifest.json`: one `upstream_hashes` value, the `t_plan.md` row; `canon_hashes` carries no template entry. The tester's gate run (272/272 with the `upstream_hashes` test green, `sync --check` ok) is on this tree; no tool here recomputes the digest.
- Agent memory (`asd-reviewer-combined/*`, `asd-tester-critical/project_testability-envelope.md`): hand-authored memory, in the review surface by `artifact-layout.md` "Agent memory"; the added lines hold method only, no sprint, Task, wave, iteration or verdict id, and the instructions they give are reads inside each agent's grant.

Dropped under the severity floor: the new loop has the same recorded ceiling as the rest of the placement pins (a reversal by a connector synonym, or a placement clause moved past the first `;`, is not read).

The compact ledger, bound to the dispatched manifest digest:

```json
{"manifest_digest":"813e7bc217d5a8221860c224195a88f1136684a4ac32766dc3ed7a71de3447af","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/templates/t_plan.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/feedback_re-review-mirror-pointers.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

## Verdict

APPROVE

## Next action

Reviewer done. No findings at or above the medium floor.
