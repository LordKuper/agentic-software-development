[REVIEW-impl-correctness]: CONCERNS

# Review — correctness (part 2 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Manifest**: [correctness.part-2.manifest.json](correctness.part-2.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/workflows/asd-phase-impl-test.md:58`, `.asd/workflows/asd-phase-impl.md:84`; root `.asd/rules/git-strategy.md:14-15`, `.asd/rules/sprint-lifecycle.md:342` (AC-2) | Failed-dispatch recovery can mark unfinished work landed: the trailer id doesn't match the unit of work. (a) impl-test's single tester tags every commit `impl-test entry N`; its first step-7 commit names that id, so a tester dying before later areas or the step-8 suite gate reads as `landed impl-test entry N` and nothing is re-dispatched. (b) git-strategy allows phase-grouped commits but only one trailer line, so a grouped commit can name one of its ids and the other is re-dispatched though landed. | impl-test: per-step ids, or State recovery states an impl-test dispatch lands only once `test-plan.md` `Suite run` records this entry's HEAD. Grouped commits: one `ASD-Task` line per covered id, or forbid grouping for dispatched agents. Escalation: beyond per-step ids this changes a public contract — user approval. |
| 2 | low | `README.md:313` | Folder map says "dated" segments; `artifact-layout.md:185,245` numbers them. | "numbered". |
| 3 | low | `.asd/workflows/asd-phase-impl-test.md:40` | Unreachable branch: rotation moves every earlier entry's rows out first, so "update a live row in place" cannot occur and contradicts supersede-only. | Drop "update a live row in place, or"; keep "supersede a rotated one". |

## Coverage

```json
{"manifest_digest":"78e5453ed2fb8218443b4fa614bee1945ab8f6a88378d7ebc9b5ed18ed899eeb","findings":["1","2","3"],"files":[{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/templates/t_decisions-log.md","s":"checked"},{"i":".asd/templates/t_plan.md","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Bugs [impl-review]","s":"finding","f":"1"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"finding","f":"2"},{"i":"Best practices [impl-review]","s":"finding","f":"3"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```
