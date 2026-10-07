[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

Review basis (delta since iter-01: review-fix 56b6d84 and 63ee0c8, impl-test entry 2):
- **external F1 (providers.md:123):** the new sentence records a derived id's declaration on its decisions-log routing line (`; risk <declaration>`, with `via <check>` after `none`/`artifact`, and an id prefix when the line names several). This carries out D3's "recorded in the routing decisions-log line", and decisions-log L63 accepts it as a flagged choice. The mirrors agree:
  - `t_decisions-log.md` shows the suffix as optional, `[; risk <declaration>]`.
  - `asd-phase-impl.md` 5a makes it optional and limits it to a fix round's ids, so a plan Task has no derived declaration.
  - `asd-phase-impl-test.md` 1a always adds it, because every impl-test dispatch is a derived id. impl-review steps 8-9 route "as step 1a", so they inherit the format.
  - The `dispatch HEAD <sha>` reconstruction anchor (`sprint-lifecycle.md` L421, the sprint-014 test at run.js L5071) is unchanged. No runtime parser reads the line (grep of `.asd/*.js`). The routing line for entry 2 (decisions-log L65) conforms.
- **external F2 (run.js:7568):** the assert now needs the own-declaration wording and rejects the "Material risk lines of the plan Tasks" / "Tasks whose paths" clause. Restoring the inheritance rule therefore fails it (mutation recorded in test-plan.entry-01.md L29).
- **external F3 (run.js:7605-7608):** the order and the "unticked Tasks only" filter match `sprint-lifecycle.md` L411 on a single line, so `.` in the regex needs no newline. The step 5 skipped-wave clause and the step 11 `continue in initial mode … before step 12` clause match the canon text.
- **combined F1 (run.js:7582):** the reserved set is now read from `runtime.js` L15 `RESERVED_CHANGE_RISKS`, which uses single-quoted literals and so matches the regex. An empty match fails the new non-empty assert.
- **logLine pin:** the sentence split `(?<=\.)\s` stays intact, because `sync.js --check` has no period followed by whitespace. "decisions-log routing line" occurs only at providers.md L123.
- **README:** it holds no routing-line format, so no mirror edit is due.
- **Below the floor, not raised:**
  - "Its decisions-log routing line" has an ambiguous antecedent, though the 5a/1a mirrors resolve it.
  - The suite run's `none` leaves its `via <check>` implicit.
- **Not recomputed (no shell):** the `release-manifest.json` hashes, `sync.js --check` and the suite. The test-plan record says 273/273 pass at 081d3ba and `sync --check` exits 0.

```json
{"manifest_digest":"d5140691c15bdeda67b04870db6121a928d7cf918859e009bae949909be2ce96","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/providers.md","s":"checked"},{"i":".asd/templates/t_decisions-log.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

## Verdict
APPROVE

## Next action
No combined findings. The orchestrator aggregates this verdict with External Review's verdict at step 8. If wave 1's roster is met, the terminal full-suite gate (step 9) runs.
