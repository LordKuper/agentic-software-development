[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2 (floor medium)
- **Manifest**: [correctness.manifest.json](correctness.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1 | medium | `.asd/rules/sprint-lifecycle.md:342` "Failed dispatch" (AC-2) | A `D-N` trailer is read as landed, but test-fix mode needs a second commit to flip the Defects row to `fixed` with the fix sha (`asd-phase-impl.md:77`, `asd-dev.md:77`). A dispatch dying between the two commits leaves the row `pending`; reconstruction drops `D-N`, and the next test-fix entry re-sends an already-fixed defect — breaks AC-2's "only work that did not land" and the defect record. | Second exception beside the impl-test one: a `D-N` trailer lands only when its Defects row reads `fixed` with a fix commit; otherwise the re-dispatch carries that `D-N` as "set Status from the trailer commit's sha", no second fix. Pin it in `tests/run.js` `sprint-014 AC-2`. |

Out-of-surface remark (not a finding): reviewer believed `decisions-log.005.md` empty; orchestrator verified `.005` holds the impl-test entry 2 lines and the live log is template-only.

## Coverage

```json
{"manifest_digest":"0cd8a379908fdd12745d5d69cc6c58ea4fa828b21b3fafeef96549273f223f7f","findings":["COR-1"],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"finding","f":"COR-1"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```
