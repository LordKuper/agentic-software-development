[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2 (floor medium)
- **Manifest**: [testing.manifest.json](testing.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1 | medium | `test-plan.md:37` (row "Leftover paths limited to the failed dispatch's authorised paths (COR-1)"); `.asd/rules/sprint-lifecycle.md:342`; `tests/run.js:4756-4757` (AC-2) | Row's `none` reason ("assertable if reconstruction moved into `runtime.js`") doesn't hold: the sibling COR-2 clause in the same orchestrator-executed paragraph is pinned statically. Deleting the authorised-paths/bookkeeping/sibling exclusion leaves the suite green, and a re-dispatch would name `state.json`, `decisions-log.md` or sibling edits for the agent to finish or revert — breaks author-only staging (`custom-coding-rules.md:12`). §17 bars `none` when a check would catch it. | In AC-2, assert the Failed-dispatch leftovers sentence limits paths to the failed dispatch's authorised paths, excludes orchestrator bookkeeping and in-flight sibling paths, and the orchestrator never stages/discards them; supersede row 37 with an `add` row and a fail-first record. |

## Coverage

```json
{"manifest_digest":"af5345183bb1cac2a4df273667e6c544fd2a2997fb2fefe4546dda9631e315c0","findings":["TST-1"],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-1"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"pass"},{"i":"Stub-resolution verification","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
