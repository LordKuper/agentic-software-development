[REVIEW-impl-combined]: CONCERNS

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | `.asd/skills/asd-update/update.js:631` (AC-2) | simplify: The updater checks for an empty pending-migration list after establishing that the installed version has reached the target. The pending filter at line 334 requires a version strictly above the installed version and at or below the target, so the list is already empty in this branch. This is the over-engineering checklist item “Defensive code for impossible-by-contract case.” | Remove the pending-list condition. Retain the version, planned-write and attention checks. |
| 2 | medium | `tests/update.test.js:26` (AC-2) | The revised contract test still pins ordinary prose in `asd-init`'s approval rule. An in-memory change from “On acceptance” to “After approval” preserves the instruction and fails the new assertion. The second assertion similarly requires the phrases “exactly” and “approved missing leaves.” This repeats the failure mode documented in `test-plan.md` and conflicts with `code-style.md` §17. | Remove the two prose assertions. Retain the checks for the update-completion heading and literal approval choices. Verify the restriction to approved additions by tracing the skill step to the core invariant. |

## Coverage

Manifest: [combined.manifest.json](./combined.manifest.json). Reviewed head `dc5513b0991b0bc9c615ea5334ba1404b3e343b5`.

The tester recorded 326 passes at `1734f03a`. All scoped files outside the sprint records match that tested revision. The linked-config check used Windows junctions. I independently verified the manifest digest, generated-view sync and context ceilings. The matched Codex probes measured 430,941 Lite input tokens and 520,232 Standard input tokens against AC-8 ceilings of 463,917 and 573,087, respectively.

```json
{
  "manifest_digest":"c2c26d3d2e22aa770610c2314817f9b32f503c60f94dd14a4625dceda306cd79",
  "findings":["1","2"],
  "files":[
    {"i":".asd/migrations/14.12.0.js","s":"checked"},
    {"i":".asd/release-manifest.json","s":"checked"},
    {"i":".asd/rules/core.md","s":"checked"},
    {"i":".asd/rules/sprint-lifecycle.md","s":"checked"},
    {"i":".asd/runtime.js","s":"checked"},
    {"i":".asd/skills/asd-init/SKILL.md","s":"checked"},
    {"i":".asd/skills/asd-update/SKILL.md","s":"checked"},
    {"i":".asd/skills/asd-update/update.js","s":"checked"},
    {"i":".asd/sync-state.json","s":"checked"},
    {"i":".asd/sync.js","s":"checked"},
    {"i":".asd/templates/t_AGENTS.md","s":"checked"},
    {"i":"AGENTS.md","s":"checked"},
    {"i":"README.md","s":"checked"},
    {"i":"tests/migrations.test.js","s":"checked"},
    {"i":"tests/runtime-routing.test.js","s":"checked"},
    {"i":"tests/update.test.js","s":"checked"},
    {"i":".asd/sprints/040-mockups-token-optimization/test-plan.md","s":"checked"},
    {"i":".asd/sprints/040-mockups-token-optimization/test-plan.entry-01.md","s":"checked"},
    {"i":".asd/sprints/040-mockups-token-optimization/test-plan.entry-02.md","s":"checked"}
  ],
  "rules":[
    {"i":"Draft correctness: AC completeness, contract soundness, ADR decision soundness [design-review]","s":"n/a","p":"outside phase gate"},
    {"i":"Bugs [impl-review]","s":"pass"},
    {"i":"Security [impl-review]","s":"pass"},
    {"i":"Contracts and compatibility [impl-review]","s":"pass"},
    {"i":"Best practices [impl-review]","s":"finding","f":"2"},
    {"i":"AC → code trace [impl-review]","s":"pass"},
    {"i":"AC → check coverage [impl-review]","s":"pass"},
    {"i":"Test check-ladder adequacy [impl-review]","s":"pass"},
    {"i":"Test removal validity [impl-review]","s":"pass"},
    {"i":"No-test decision honesty [impl-review]","s":"pass"},
    {"i":"Fail-first regression proof [impl-review]","s":"pass"},
    {"i":"Test meaningfulness and determinism [impl-review]","s":"finding","f":"2"},
    {"i":"Test edge cases [impl-review]","s":"pass"},
    {"i":"Manual verification necessity [impl-review]","s":"pass"},
    {"i":"SSoT [design-review, impl-review]","s":"pass"},
    {"i":"Template adherence [design-review, impl-review]","s":"pass"},
    {"i":"HTML shell wrapping [design-review, impl-review]","s":"n/a","p":"no HTML file in scope"},
    {"i":"Provenance [design-review, impl-review]","s":"n/a","p":"no HTML file in scope"},
    {"i":"Traceability [design-review, impl-review]","s":"n/a","p":"no HTML file in scope"},
    {"i":"Persistent actuality [impl-review]","s":"pass"},
    {"i":"In-code doc comments [impl-review]","s":"pass"},
    {"i":"Stub resolution [impl-review]","s":"pass"},
    {"i":"Framework mode [impl-review]","s":"pass"},
    {"i":"Custom rules consistency [design-review, impl-review]","s":"pass"},
    {"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},
    {"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"finding","f":"1"},
    {"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},
    {"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},
    {"i":"Duplication and reuse [design-review, impl-review]","s":"pass"},
    {"i":"Documentation economy [design-review, impl-review]","s":"pass"},
    {"i":"Runtime token cost [design-review, impl-review]","s":"pass"},
    {"i":"Change-size proportionality [design-review, impl-review]","s":"pass"},
    {"i":"Test-suite cost and check-ladder cost [impl-review]","s":"pass"},
    {"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},
    {"i":"Perf anti-patterns [impl-review]","s":"pass"},
    {"i":"Algorithmic complexity [impl-review]","s":"pass"},
    {"i":"Regression detection [impl-review]","s":"pass"},
    {"i":"Hot path identification [impl-review]","s":"pass"},
    {"i":"Overall quality","s":"pass"},
    {"i":".asd/project/custom-common-rules.md","s":"pass"},
    {"i":".asd/project/custom-coding-rules.md","s":"pass"}
  ],
  "sections":[
    {"i":"Draft correctness: AC completeness, contract soundness, ADR decision soundness [design-review]","s":"n/a","p":"outside phase gate"},
    {"i":"Bugs [impl-review]","s":"reviewed"},
    {"i":"Security [impl-review]","s":"reviewed"},
    {"i":"Contracts and compatibility [impl-review]","s":"reviewed"},
    {"i":"Best practices [impl-review]","s":"reviewed"},
    {"i":"AC → code trace [impl-review]","s":"reviewed"},
    {"i":"AC → check coverage [impl-review]","s":"reviewed"},
    {"i":"Test check-ladder adequacy [impl-review]","s":"reviewed"},
    {"i":"Test removal validity [impl-review]","s":"reviewed"},
    {"i":"No-test decision honesty [impl-review]","s":"reviewed"},
    {"i":"Fail-first regression proof [impl-review]","s":"reviewed"},
    {"i":"Test meaningfulness and determinism [impl-review]","s":"reviewed"},
    {"i":"Test edge cases [impl-review]","s":"reviewed"},
    {"i":"Manual verification necessity [impl-review]","s":"reviewed"},
    {"i":"SSoT [design-review, impl-review]","s":"reviewed"},
    {"i":"Template adherence [design-review, impl-review]","s":"reviewed"},
    {"i":"HTML shell wrapping [design-review, impl-review]","s":"n/a","p":"no HTML file in scope"},
    {"i":"Provenance [design-review, impl-review]","s":"n/a","p":"no HTML file in scope"},
    {"i":"Traceability [design-review, impl-review]","s":"n/a","p":"no HTML file in scope"},
    {"i":"Persistent actuality [impl-review]","s":"reviewed"},
    {"i":"In-code doc comments [impl-review]","s":"reviewed"},
    {"i":"Stub resolution [impl-review]","s":"reviewed"},
    {"i":"Framework mode [impl-review]","s":"reviewed"},
    {"i":"Custom rules consistency [design-review, impl-review]","s":"reviewed"},
    {"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},
    {"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},
    {"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},
    {"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},
    {"i":"Duplication and reuse [design-review, impl-review]","s":"reviewed"},
    {"i":"Documentation economy [design-review, impl-review]","s":"reviewed"},
    {"i":"Runtime token cost [design-review, impl-review]","s":"reviewed"},
    {"i":"Change-size proportionality [design-review, impl-review]","s":"reviewed"},
    {"i":"Test-suite cost and check-ladder cost [impl-review]","s":"reviewed"},
    {"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},
    {"i":"Perf anti-patterns [impl-review]","s":"reviewed"},
    {"i":"Algorithmic complexity [impl-review]","s":"reviewed"},
    {"i":"Regression detection [impl-review]","s":"reviewed"},
    {"i":"Hot path identification [impl-review]","s":"reviewed"},
    {"i":"Overall quality","s":"reviewed"}
  ]
}
```

## Verdict

CONCERNS: 2

## Next action

Simplify the updater's no-op condition and remove the prose assertions from the update-completion contract test.

## Escalations

None.
