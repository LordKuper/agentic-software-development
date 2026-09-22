[REVIEW-impl-efficiency]: CONCERNS

Manifest: [efficiency.part-1.manifest.json](./efficiency.part-1.manifest.json) · Patch: [efficiency.part-1.diff](./efficiency.part-1.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| E1 | critical | `.asd/runtime.js:456-461` (`dispatchWaves`), `.asd/runtime.js:600` (export) | Dead code left "in case we need it" (`simplify`). Nothing calls `dispatchWaves`: there is no CLI subcommand, no workflow or rule cite, and no test (`test-plan.entry-01.md:19` flags it). The wave rule is orchestrator prose; only `DISPATCH_CEILING` is load-bearing. | Delete `dispatchWaves` and its export; keep `DISPATCH_CEILING`. Drop "exports a pure wave-splitting helper" from `CHANGELOG.md:15`. |
| E2 | critical | `.asd/runtime.js:393-397` (`assertReviewerUnion`), `:511` (call), `:600` (export); `.asd/rules/review-policy.md:162` | Defensive code for a case the contract makes impossible (`simplify`). `reviewerFiles` gives the whole scope to every reviewer except impl-review Testing, so the guard can never fire; test-plan M5 confirms deleting it leaves the suite green. The invariant is already pinned by `tests/run.js:4958-4961`. | Delete the function, its call, its export and the `assertReviewerUnion` clause in "Union property". Keep the plain invariant statement. |

Checked and not raised:
- **Perf:** `rangeRenames` and `writePatch` are O(files), with no hot path.
- **`maxTurns` 150:** required by AC-9.
- **Constants:** they are cited by symbol.
- **`gitRef`:** it guards a trust boundary.
- **`core.md`:** the change is a net deletion.
- **AC-3 table:** required.
- **`runtime.js` size:** not raised, per the standing override.

Ledger note: E2 is an over-engineering hit. It sits on the Complexity-vs-value row because each row carries one finding reference.

## Verdict
CONCERNS: 2

## Next action
`asd-dev` deletes the code named in E1 and E2. Neither needs escalation. Refresh the ledger hashes afterwards.

```json
{"manifest_digest":"0a993dfb9951d81c3393f6740368a15a471620dcc6ba532ed25a3eb7407d79e2","findings":["E1","E2"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"}],"rules":[{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"finding","f":"E1"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"finding","f":"E2"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"}]}
```
