[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-04 (severity floor medium, floor_base=wave-1/2)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

```json
{"manifest_digest":"7cef8443d099082a6767da58400831a0635d06284a65cee51f3e90e735a3fe56","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

Review basis:
- **iter-03 combined F1 (`checkpoints.md:5`).** Fixed. "It records" now reads "The orchestrator records". The sentence that records the gate decision has an explicit subject again. The AC-8 sentence keeps the place D8 gives it and its wording is unchanged. No canon test or mirror quoted "It records". A repo-wide grep outside `.asd/sprints/` finds the sentence only in `checkpoints.md`.
- **iter-03 external F1 (`tests/run.js` AC-8/AC-9 pins).** Fixed.
  - AC-8 now finds its sentence by `flagged choice` plus `plan decision` and pins only the `` `new or changed scope` `` class token. The unchanged next assert ties that token to the `Hard in both modes:` head.
  - AC-9 pins `superseded` and `citation`.
  - Neither pin can pass vacuously. The pre-amendment `checkpoints.md` has no sentence matching the locator, so `unmet` is `''` and the assert fails (M1). The pre-amendment §17 bullet has neither `superseded` nor `citation`; I checked it against the iter-03 diff's `-` line (M3). So restoring the superseded text still fails each assert, as AC-9 requires.
  - The sentence split `(?<=\.)\s` cannot cut the located sentence.
  - The clause "met by widening the fix" is no longer pinned. That follows from §17's "never the surrounding prose", not from a coverage gap.
- **`release-manifest.json`.** Only the `checkpoints.md` `upstream_hashes` value changed. Not recomputed, because I have no shell. The suite's `upstream_hashes` test covers it. test-plan.md entry 4 records 273/273 green and `sync.js --check` `ok: true` at HEAD b78ffea.
- **Scope/economy.** The delta is minimal: two words in the rule, two asserts loosened, one hash. Nothing is over-built.

## Verdict
APPROVE

## Next action
None from this reviewer. The wave-1 impl-review gate can close on the combined verdict.

## Escalations
none
